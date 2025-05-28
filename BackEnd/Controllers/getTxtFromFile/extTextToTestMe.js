const axios = require("axios");
const { getDocument, GlobalWorkerOptions } = require("pdfjs-dist");

GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");

/**
 * @param {Uint8Array} pdfBuffer
 * @returns {Promise<string[]>} 
 */
async function extractPdfPages(pdfBuffer) {
  const loadingTask = getDocument({ data: pdfBuffer });
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
