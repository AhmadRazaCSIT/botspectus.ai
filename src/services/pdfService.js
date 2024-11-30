const PDFParser = require('pdf2json');
const fs = require('fs');
const path = require('path');

// Parse PDF using pdf2json
const parsePDF = async (pdfBuffer) => {
  console.log('Starting PDF parsing...');
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      try {
        console.log('PDF parsing completed. Extracting data...');
        console.log(
            'PDF Data Overview:',
            JSON.stringify(
                {
                  hasFormImage: !!pdfData.formImage,
                  hasPages: pdfData.formImage && pdfData.formImage.Pages ? pdfData.formImage.Pages.length : 0,
                  metadata: pdfData.metadata || {}
                },
                null,
                2
            )
        );

        const completeText = extractTextFromPDFData(pdfData);

        console.log('Text extraction successful.');
        console.log(`Extracted Text Preview (First 500 chars): ${completeText.slice(0, 500)}...`);
        resolve({
          text: completeText,
          totalTextLength: completeText.length,
          pageCount: pdfData.formImage && pdfData.formImage.Pages ? pdfData.formImage.Pages.length : 0,
          metadata: pdfData.metadata || {}
        });
      } catch (err) {
        console.error('Error during PDF data processing:', err);
        reject(new Error(`Error processing PDF data: ${err.message}`));
      }
    });

    pdfParser.on('pdfParser_dataError', (err) => {
      console.error('Error event emitted during PDF parsing:', err.parserError || 'Unknown error');
      reject(new Error(`PDF parsing error: ${err.parserError || 'Unknown error'}`));
    });

    try {
      console.log('Initiating buffer parsing...');
      pdfParser.parseBuffer(pdfBuffer);
    } catch (parseError) {
      console.error('Critical error while parsing PDF buffer:', parseError.message);
      reject(new Error(`Failed to parse PDF buffer: ${parseError.message}`));
    }
  });
};

// Comprehensive text extraction function
const extractTextFromPDFData = (pdfData) => {
  if (!pdfData) {
    console.error('No PDF data available for text extraction.');
    throw new Error('No PDF data provided');
  }

  if (pdfData.Pages) {
    console.log('Extracting text from standard Pages structure...');
    return extractFromPages(pdfData.Pages);
  }

  if (pdfData.formImage && pdfData.formImage.Pages) {
    console.log('Extracting text from formImage Pages structure...');
    return extractFromFormImagePages(pdfData.formImage.Pages);
  }

  console.error('No valid page structure found in PDF data.');
  throw new Error('Unable to extract text: No valid page structure found');
};

// Extract text from standard Pages structure
const extractFromPages = (pages) => {
  console.log('Starting text extraction from Pages...');
  return pages
      .map((page, pageIndex) => {
        console.log(`Processing Page ${pageIndex + 1}`);
        const pageText = page.Texts
            .map((textObj) =>
                textObj.R
                    .map((r) => (r.T ? decodeURIComponent(r.T) : ''))
                    .join('')
            )
            .join(' ');
        console.log(`Page ${pageIndex + 1} Text Length: ${pageText.length}`);
        return pageText;
      })
      .join('\n\n')
      .trim();
};

// Extract text from formImage Pages structure
const extractFromFormImagePages = (pages) => {
  console.log('Starting text extraction from formImage Pages...');
  return pages
      .map((page, pageIndex) => {
        console.log(`Processing formImage Page ${pageIndex + 1}`);
        const pageText = page.Texts
            .map((textObj) =>
                textObj.R
                    .map((r) => (r.T ? decodeURIComponent(r.T) : ''))
                    .join('')
            )
            .join(' ');
        console.log(`formImage Page ${pageIndex + 1} Text Length: ${pageText.length}`);
        return pageText;
      })
      .join('\n\n')
      .trim();
};

// Main Function to extract text from PDF
const extractTextFromPDF = async (pdfBuffer) => {
  console.log('Starting main text extraction process...');
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
    console.error('Invalid PDF buffer provided.');
    throw new Error('Invalid PDF buffer provided');
  }

  const tempDir = './temp_pdf';
  const tempPdfPath = path.join(tempDir, 'input.pdf');

  if (!fs.existsSync(tempDir)) {
    console.log('Temporary directory does not exist. Creating...');
    fs.mkdirSync(tempDir);
  }

  try {
    console.log('Saving PDF buffer to temporary file...');
    fs.writeFileSync(tempPdfPath, pdfBuffer);

    console.log('Attempting to parse the PDF...');
    const result = await parsePDF(pdfBuffer);

    console.log('Cleaning up temporary file...');
    fs.unlinkSync(tempPdfPath);

    console.log('PDF processing completed successfully.');
    console.log('Final Extracted Text Length:', result.totalTextLength);
    console.log('Extracted Text Preview:', result.text.slice(0, 1000));
    return result;
  } catch (error) {
    console.error('Error during PDF extraction:', error.message);

    try {
      const stats = fs.statSync(tempPdfPath);
      console.error('Temporary PDF file details:', {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    } catch (statError) {
      console.error('Could not retrieve temporary file stats:', statError.message);
    }

    throw error;
  }
};

module.exports = {
  extractTextFromPDF
};
