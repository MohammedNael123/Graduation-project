const axios = require("axios");
const path = require("path");
const { getDocument, GlobalWorkerOptions } = require("pdfjs-dist");

// Load the PDF.js worker
GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");
/**
 * Extracts text content from each page of a PDF buffer (Uint8Array).
 * @param {Uint8Array} pdfBuffer
 * @returns {Promise<string[]>} Array of page text strings.
 */
async function extractPdfPages(pdfBuffer) {
  const loadingTask = getDocument({ data: pdfBuffer,
    standardFontDataUrl: path.join(__dirname, "../../../node_modules/pdfjs-dist/standard_fonts/")
   });
  const pdf = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    pages.push(`Start of Page(${i})\n${text}\nEnd of Page(${i})`);
  }
  return pages;
}

/**
 * @param {string} fileUrl 
 * @returns {Promise<string[]>}
 */
async function processFile(fileUrl) {
  try {
    if (!fileUrl) throw new Error("fileUrl is required");

    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const pdfData = new Uint8Array(response.data);

    return await extractPdfPages(pdfData);
  } catch (err) {
    console.error("Error processing file:", err);
    throw err;
  }
}

module.exports = processFile;
