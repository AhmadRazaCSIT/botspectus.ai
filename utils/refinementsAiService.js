const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

const refineQuery = async (userQuery, metadata) => {
  try {
    // More explicit and structured prompt
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

    const genAi = new GoogleGenerativeAI(apiKey);
    const model = genAi.getGenerativeModel({ model: "gemini-pro" });

    // More comprehensive error handling
    const result = await model.generateContent(prompt);

    // Multiple fallback mechanisms for response extraction
    const responseText =
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        result?.response?.text() ||
        JSON.stringify(result) ||
        "No valid response generated";

    console.log('Refined Query Result:', responseText);
    return responseText.trim();

  } catch (error) {
    console.error('Detailed Error in Query Refinement:', error);

    // More informative error handling
    if (error.message.includes('API key')) {
      throw new Error('Invalid or missing Google Gemini API key');
    }

    throw error;
  }
};

module.exports = { refineQuery };