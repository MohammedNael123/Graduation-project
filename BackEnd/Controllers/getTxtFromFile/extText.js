const express = require("express");
const cors = require("cors");
const { getDocument } = require("pdfjs-dist");
const path = require("path");
const textract = require("textract");
const axios = require("axios");
const fs = require("fs-extra");
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

async function getfilepath(fileUrl) {
  try {
    const parsedUrl = new URL(fileUrl);
    const filename = path.basename(parsedUrl.pathname);

    const TMP_DIR = "/tmp";
    const filePath = path.join(TMP_DIR, filename);

    // Ensure the /tmp directory exists
    if (!await fs.pathExists(TMP_DIR)) {
      await fs.mkdirp(TMP_DIR); // Creates the dir recursively if needed
      console.log("Created /tmp directory");
    }

    // Download the file
    const response = await axios({
      url: fileUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    // Save it to /tmp
    await fs.writeFile(filePath, response.data);
    console.log("File downloaded to:", filePath);

    return filePath;

  } catch (err) {
    console.error("Error downloading or preparing file:", err);
    throw err;
  }
}


async function getTextFromFile(filePath) {
  try {
    if (!filePath) {
      console.log("Please choose a file");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".pdf") {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const pdf = await getDocument({ data }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(" ");
      }
      return fullText;
    } else if (ext === ".doc" || ext === ".pptx" || ext === ".docx") {
      return new Promise((resolve, reject) => {
        textract.fromFileWithPath(filePath, (err, txt) => {
          if (err) {
            console.error("Error reading the file");
            reject(err);
          } else {
            resolve(txt);
          }
        });
      });
    }
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

async function processFile(fileUrl) {
  try {
    // Download the file to temporary storage
    const filepath = await getfilepath(fileUrl);

    // Extract text from the file
    const fileText = await getTextFromFile(filepath);

    // Clean up the temporary file
    fs.remove(filepath);

    return fileText;

  } catch (err) {
    console.error("Error processing file:", err);
    return "Can't read file";
  }
}

module.exports = processFile;
