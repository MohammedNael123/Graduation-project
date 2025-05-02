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
    const filePath = path.join("tmp ", filename);

    await fs.ensureDir("tmp ");

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

async function getTextFromFile(filePath) {
  try {
    if (!filePath) {
      console.log("اختيار ملف الرجاء");
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
            console.error("خطا في قراءه الملف");
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
    //get from supabase
    const filepath = await getfilepath(fileUrl);
    const fileText = await getTextFromFile(filepath);
    fs.remove(filepath);
    return (fileText);

  } catch (err) {
    console.error("Error processing file:", err);
    return "can't read file";
  }
}

module.exports = processFile;
