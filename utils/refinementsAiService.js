const Groq = require('groq-sdk');
require('dotenv').config();
const apiKey = process.env.GROQ_API_KEY;

const client = new Groq({apiKey});

const refineQuery = async (userQuery, metadata) => {
    try {
        const prompt = `METADATA ANALYSIS TASK:

Query: ${userQuery}

Metadata Details:
${typeof metadata === 'object' ? JSON.stringify(metadata, null, 2) : metadata}

INSTRUCTIONS:
- Carefully extract ALL relevant information from the metadata
- If no direct match exists, use contextual reasoning
- Provide a detailed, informative response
- Be specific and avoid generic statements
- If truly no information is available, explain precisely why

REQUIRED RESPONSE FORMAT:
1. Relevance assessment
2. Key extracted information
3. Reasoning behind the response

Response:`;

        console.log('Prompt for Query Refinement:', prompt);
        const messages = [
            {
                "role": "system",
                "content": "chat with pdf "
            },
            {
                "role": "user",
                "content": prompt
            }
        ];

        const chatCompletion = await client.chat.completions.create({
            "messages": messages,
            "model": "llama3-70b-8192",
            "temperature": 1,
            "max_tokens": 1024,
            "top_p": 1,
            "stream": true,
            "stop": null
        });

        let responseText = '';
        for await (const chunk of chatCompletion) {
            responseText += chunk.choices[0]?.delta?.content || '';
        }

        console.log('Refined Query Result:', responseText);
        return responseText.trim();

    } catch (error) {
        console.error('Detailed Error in Query Refinement:', error);

        if (error.message.includes('API key')) {
            throw new Error('Invalid or missing Groq API key');
        }

        throw error;
    }
};

module.exports = { refineQuery };