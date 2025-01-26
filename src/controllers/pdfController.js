const { extractTextFromPDF } = require('../services/pdfService');
const { generateEmbeddings, storeEmbeddingsInPinecone } = require('../services/embeddingService');

module.exports.uploadPDF = async (req, res) => {
    console.log('Uploading PDF file...Inside the Chunk function******************************************************');
    console.log(req.file);
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.file;

    try {
        const extractedData = await extractTextFromPDF(file.buffer);
        const embeddings = await generateEmbeddings(extractedData.chunks);
        await storeEmbeddingsInPinecone(embeddings,  extractedData.chunks);

        res.send({
            message: 'File uploaded and processed successfully.',
            extractedData,
        });
    } catch (error) {
        res.status(500).send('Error processing file.');
    }
};