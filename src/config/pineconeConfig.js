const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config();

const initPinecone = async () => {
  console.log('Starting Pinecone initialization...');
  try {
    // Initialize Pinecone with correct configuration
    console.log('Initializing Pinecone client...');
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'pcsk_3s8f1P_DJnL5aty4gbk8h4ey7pJZVuVxSf6No8F7e6WxqNS1wwAhkMDLqBFnfibDMpSsSs',
      // Remove controllerHostUrl as it's not needed for serverless
    });

    const indexName = 'botembedding';
    console.log(`Using index name: ${indexName}`);

    // Check existing indexes
    console.log('Fetching existing indexes...');
    const existingIndexes = await pc.listIndexes();
    const indexNames = existingIndexes.indexes.map(index => index.name);
    console.log('Existing indexes:', indexNames);

    // Create index if it doesn't exist (serverless configuration)
    if (!indexNames.includes(indexName)) {
      console.log(`Index "${indexName}" does not exist. Creating it...`);
      await pc.createIndex({
        name: indexName,
        dimension: 384,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log(`Index "${indexName}" created successfully.`);
    } else {
      console.log(`Index "${indexName}" already exists.`);
    }

    // Wait for index to be ready (optional but recommended)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Get the index
    const index = pc.index(indexName);

    return index;
  } catch (error) {
    console.error('Error during Pinecone initialization:', error.message);
    console.error('Full error details:', error);
    throw new Error(`Pinecone initialization failed: ${error.message}`);
  }
};

module.exports = initPinecone;