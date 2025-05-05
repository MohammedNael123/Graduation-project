const { getDocument } = require("pdfjs-dist");
const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const { URL } = require('url');

const ILovePDFApi  = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');

const ilovepdf = new ILovePDFApi(
  process.env.ILOVEPDF_PUBLIC_KEY,
  process.env.ILOVEPDF_PRIVATE_KEY
);

const textCache = new Map();

async function getfilepath(fileUrl) {
  try {
    const parsedUrl = new URL(fileUrl);
    const filename = path.basename(parsedUrl.pathname);
    const tempDir = path.join(__dirname, "..", "..", "..", "BackEnd", "Controllers", "getTxtFromFile", "tmp");
    const filePath = path.join(tempDir, filename);

    await fs.ensureDir(tempDir); 

    const fileExists = await fs.pathExists(filePath); 
    if (fileExists) {
      console.log("File already exists!");
      return filePath;
    }

    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    await fs.writeFile(filePath, response.data);
    return filePath;

  } catch (err) {
    console.error("Error downloading file:", err);
    throw err;
  }
}


function makeoutputpath(filePath){
  const basename = path.basename(filePath,path.extname(filePath));
  const outputDir = path.join(
    __dirname,
     "..", "..", "..", "BackEnd", "Controllers", "getTxtFromFile", "tmp"
  )
  return path.join(outputDir,`${basename}.pdf`);
}

async function convertOfficeToPdf(filePath) {
  const outputpath = makeoutputpath(filePath)
  const task = ilovepdf.newTask('officepdf');

  await task.start();

  const file = new ILovePDFFile(filePath);
  await task.addFile(file);

  await task.process();

  const pdfBuffer = await task.download();

  await fs.writeFile(outputpath, pdfBuffer);
  console.log(`Converted ${path.basename(filePath)} → ${outputpath}`);
  return pdfBuffer;
}

async function extractPdfPages(pdfBuffer) {
  const loadingTask = getDocument(pdfBuffer);
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

async function getTextFromFile(filePath) {
  try {
    if (!filePath) {
      throw new Error("Please choose a file!");
    }

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
      const data = fs.readFileSync(filePath);
      const pdfData = new Uint8Array(data);
      return await extractPdfPages(pdfData);
    } else if (['.doc', '.docx', '.ppt', '.pptx'].includes(ext)) {
      const pdfBuf = await convertOfficeToPdf(filePath); 
      const pdfData = new Uint8Array(pdfBuf)
      return await extractPdfPages(pdfData);
    }
    throw new Error(`Unsupported file extension: ${ext}`);
  } catch (err) {
    console.error("Error in getTextFromFile:", err);
    throw err; 
  }
}

async function processFile(fileUrl) {
  // 1) Return cached if available
  if (textCache.has(fileUrl)) {
    return textCache.get(fileUrl);
  }

  try {
    // 2) Otherwise process as before
    const filepath   = await getfilepath(fileUrl);
    const fileText   = await getTextFromFile(filepath);

    // clean up temp files
    await fs.remove(filepath);
    await fs.remove(makeoutputpath(filepath));

    // 3) Cache the result
    textCache.set(fileUrl, fileText);
    if (textCache.has(fileUrl)) {
      console.log("✅ Cache hit");
    } else {
      console.log("⏳ Processing new file...");
    }

    return fileText;
  } catch (err) {
    console.error("Error processing file:", err);
    throw err;
  }
}

module.exports = processFile;