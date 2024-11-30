const { HfInference } = require('@huggingface/inference');
const initPinecone = require('../config/pineconeConfig');
require('dotenv').config();
 const apiKey = process.env.HUGGING_FACE_API_KEY_FOR_EMBEDDINGS
const hf = new HfInference( apiKey );
const generateEmbeddings = async (textChunks) => {
  console.log('Starting to generate embeddings...',textChunks.length);
  try {
    const embeddings = await Promise.all(
      textChunks.map(async (chunk, index) => {
        console.log(`Processing chunk ${index + 1} with content:`, chunk.content);
        const response = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: chunk.content
        });
        console.log(`Successfully generated embedding for chunk ${index + 1}`);
        return response;
      })
    );

    console.log('All embeddings generated successfully.');
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
};

const storeEmbeddingsInPinecone = async (embeddings, textChunks) => {
  console.log('Initializing Pinecone... ',embeddings.length);
  try {
    const index = await initPinecone();
    console.log('Pinecone initialized successfully.');

    console.log('Preparing vectors for upsert...');
    const vectors = embeddings.map((embedding, i) => ({
      id: `chunk-${i}`,
      values: embedding, // Ensure this is a flat array of numbers
      metadata: {
        value: textChunks[i].content, // Store the actual text/value
        chunkNumber: textChunks[i].chunkNumber,
        startWord: textChunks[i].startWord,
        endWord: textChunks[i].endWord,
        wordCount: textChunks[i].wordCount
      }
    }));

    console.log(`Upserting ${vectors.length} vectors to Pinecone...`);

    // Use the correct upsert method
    await index.upsert(vectors);

    console.log('Vectors upserted successfully.');
  } catch (error) {
    console.error('Error storing embeddings in Pinecone:', error);
    throw error;
  }
};
module.exports = {
  generateEmbeddings,
  storeEmbeddingsInPinecone
};