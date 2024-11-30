module.exports.chunksFormationOfExtractedText = async (extractedData) => {
    console.log(extractedData)
    console.log('Starting chunk formation process...');

    // Ensure extractedData is a string
    if (typeof extractedData !== 'string') {
        console.error('Invalid input: extractedData is not a string. Type:', typeof extractedData);
        throw new Error('Invalid input: extractedData should be a string');
    }

    // Handle empty or null extractedData
    if (!extractedData.trim()) {
        console.warn('Input extractedData is empty or only contains whitespace.');
        return [];
    }

    console.log('Input validation passed. Extracting chunks...');

    const chunkSize = 500;
    const words = extractedData.split(/\s+/);
    const totalWords = words.length;
    console.log(`Total words in input: ${totalWords}`);

    const textChunks = [];

    for (let i = 0; i < totalWords; i += chunkSize) {
        const chunks = words.slice(i, i + chunkSize).join(' ');
        const chunkData = {
            chunkNumber: textChunks.length + 1,
            startWord: i,
            endWord: Math.min(i + chunkSize, totalWords),
            content: chunks,
            wordCount: chunks.split(/\s+/).length
        };

        textChunks.push(chunkData);

        console.log(`Chunk ${chunkData.chunkNumber} created:`, {
            startWord: chunkData.startWord,
            endWord: chunkData.endWord,
            wordCount: chunkData.wordCount
        });
    }

    console.log(`Chunk formation completed. Total chunks created: ${textChunks.length}`);
    return textChunks;
};
