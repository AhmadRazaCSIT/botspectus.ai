const { HfInference } = require('@huggingface/inference');
const initPinecone = require('../config/pineconeConfig');
require('dotenv').config();
const apiKey = process.env.HUGGING_FACE_API_KEY_FOR_EMBEDDINGS;
const hf = new HfInference(apiKey);

module.exports.queryService = async (userQuery) => {
    try {
        // 1. Generate embedding for the user's query
        const queryEmbedding = await hf.featureExtraction({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: [userQuery] // Wrap userQuery in an array
        });

        // 2. Initialize Pinecone index
        const index = await initPinecone();

        // 3. Perform a similarity search
        const queryResponse = await index.query({
            topK: 5,
            vector: queryEmbedding,
            includeMetadata: true
        });

        // 4. Extract the exact value
        if (queryResponse.matches && queryResponse.matches.length > 0) {
            // Sort matches by similarity score to get the most relevant
            const topMatches = queryResponse.matches.sort((a, b) => b.score - a.score);

            // Get the most similar match's metadata
            const mostRelevantMatch = topMatches[0];

            // Directly return the value from the metadata
            return mostRelevantMatch.metadata.value || "No matching value found.";
        }

        return "No matching value found.";

    } catch (error) {
        console.error('Error querying Pinecone:', error);
        throw error;
    }
};