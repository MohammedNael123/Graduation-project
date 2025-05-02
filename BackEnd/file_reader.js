const express = require("express");
const cors = require("cors");
const fs = require("fs");
const pdf = require("pdfjs-dist");
const textract = require("textract");
const path = require("path");
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

const textExtract = async (filePath) => {
  let fileExt = path.extname(filePath).toLowerCase();
  let textContent = "";
  if (fileExt === ".pdf") {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdfDoc = await pdf.getDocument(data).promise;
    for (let i = 1; i <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const text = await page.getTextContent();
      textContent += text.items.map(item => item.str).join("") + "\n";
    }
    console.log(textContent);
  } else if (fileExt === ".doc" || fileExt === ".docx" || fileExt === ".ppt" || fileExt === ".pptx") {
    
    return  textract.fromFileWithPath(filePath, (error, text) => {
        if (error) {
          console.error("Error extracting text:", error);
        } else {
          console.log("Extracted text:", text);
        }
      });
  } else {
    console.log("file is error");
    return null;
  }
};

// Start the server

const port = 5000;
app.listen(port, async () => {
  console.log(`Server is listening on port: ${port}`);
  const filePath = path.join(__dirname, "uploads", "1742336241547-pipeline1.docx"); // Adjust the path as needed
  try {
    const extractedText = await textExtract(filePath);
    if (extractedText) {
      console.log("Text extraction completed successfully.");
      // You can do something with the extracted text here if needed
    }
  } catch (error) {
    console.error("Error during text extraction on server start:", error);
  }
});