const { extractTextFromPDF } = require('../services/pdfService');
const { chunksFormationOfExtractedText } = require('../../utils/chunkText');
const { generateEmbeddings, storeEmbeddingsInPinecone } = require('../services/embeddingService');

module.exports.uploadPDF = async (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.file;

    try {
        const extractedData = await extractTextFromPDF(file.buffer);
        const textChunks = await chunksFormationOfExtractedText(extractedData.text);
        const embeddings = await generateEmbeddings(textChunks);
        await storeEmbeddingsInPinecone(embeddings, textChunks);

        res.send({
            message: 'File uploaded and processed successfully.',
            extractedData,
            textChunks,
        });
    } catch (error) {
        res.status(500).send('Error processing file.');
    }
};