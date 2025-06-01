const express = require("express");
const cors = require("cors");
//const session = require("express-session");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extTextToTestMe.js");
const path = require("path");
const fs = require("fs-extra");
const { URL } = require('url');
const functions = require("../Utilitis/Functions.js")

const ILovePDFApi = require('@ilovepdf/ilovepdf-nodejs');
const ILovePDFFile = require('@ilovepdf/ilovepdf-nodejs/ILovePDFFile');

const ilovepdf = new ILovePDFApi(
  process.env.ILOVEPDF_PUBLIC_KEY,
  process.env.ILOVEPDF_PRIVATE_KEY
);

const router = express.Router();
router.use(cors());
router.use(express.json());
// router.use(session({
//   secret:"my secret",
//   resave: false,
//   saveUninitialized:true,
//   cookie:{secure:false}
// }));

async function downloadToTemp(fileUrl) {
  const parsed = new URL(fileUrl);
  const filename = path.basename(parsed.pathname);
  const tmpDir = path.join(__dirname, "..", "..", "..", "BackEnd", "Controllers", "getTxtFromFile", "tmp");
  await fs.ensureDir(tmpDir);
  const outPath = path.join(tmpDir, filename);
  if (!await fs.pathExists(outPath)) {
    const resp = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    await fs.writeFile(outPath, resp.data);
  }
  return outPath;
}

async function convertOfficeToPdf(filePath) {
  const task = ilovepdf.newTask('officepdf');
  await task.start();
  await task.addFile(new ILovePDFFile(filePath));
  await task.process();
  const pdfBuf = await task.download();
  return pdfBuf;
}

router.get("/api/file-proxy", async (req, res) => {
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send("Missing url");

    const ext = path.extname(new URL(fileUrl).pathname).toLowerCase();
    let pdfBuffer;

    if (ext === ".pdf") {
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
      pdfBuffer = response.data;
    } else if ([".doc", ".docx", ".ppt", ".pptx"].includes(ext)) {
      const officePath = await downloadToTemp(fileUrl);
      pdfBuffer = await convertOfficeToPdf(officePath);
      await fs.remove(officePath);
    } else {
      return res.status(415).send("Unsupported file type");
    }
    res
      .header("Access-Control-Allow-Origin", "*")
      .header("Content-Type", "application/pdf")
      .send(pdfBuffer);

  } catch (err) {
    console.error("file-proxy error:", err);
    res.sendStatus(500);
  }
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/api/test-me", async (req, res) => {
  const userId = req.session.user?.id;
  try {
    let { fileUrl, fileId, pageNumber, message } = req.body;

    if (!fileUrl || !fileId) {
      return res.status(400).json({ error: "fileUrl is required!. || FileId is required!." });
    }

    const proxyUrl = `https://graduation-project-c7pi.onrender.com/api/file-proxy?url=${encodeURIComponent(fileUrl)}`;
    fileUrl = proxyUrl;
    const fullText = await processFile(fileUrl);
    console.log("the fulltext : ",fullText,"\nthe message : ",message);
    if (!Array.isArray(fullText) || fullText.length === 0) {
      console.error("error processing the file!");
      return res.status(500).json({ error: "Failed to process file." });
    }

    const discussion = await generateDiscussion(fullText, fileId, pageNumber, message, userId);

    return res.json({ reply: discussion });
  } catch (err) {
    console.error("Error in /api/test-me:", err);
    return res.status(500).json({ error: err.message });
  }
});

async function generateDiscussion(fullText, fileId, pageNumber, message, userId) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
    const pageText = fullText[pageNumber - 1];
    const fallbackContext = fullText
      .slice(Math.max(0, pageNumber - 2), pageNumber + 2)
      .join(" | ");

    //   const prompt = `
    //   You are a multilingual assistant trained to mirror users' linguistic patterns.

    //   Text from page ${pageNumber}:
    //   ---
    //   ${pageText}
    //   ---

    //   Surrounding context:
    //   ${fallbackContext}

    //   User's query (language/dialect to MIRROR):
    //   "${message}"

    //  Your requirements:
    //   1. Respond in EXACTLY the same language/dialect as the query ("${message}") 
    //   2. Preserve regional expressions, idioms, and syntactic patterns
    //   3. Provide deep analysis with:
    //     - Contextual explanations
    //     - Culturally relevant analogies
    //     - Logical inferences
    //   4. If information is unavailable, respond IN USER'S DIALECT:
    //  "[Dialect-appropriate apology] I can't help with this based on page ${pageNumber}."

    //   Response (mirror ${message}'s dialect/language):
    //  `;

    const prompt = `
You are a multilingual assistant trained to mirror users' linguistic patterns.

Source text:
---
${pageText}
---

Surrounding context:
${fallbackContext}

User's query (language/dialect to MIRROR):
"${message}"

Your requirements:
1. Respond in EXACTLY the same language/dialect as the query ("${message}") 
2. Preserve regional expressions, idioms, and syntactic patterns
3. Provide deep analysis with:
   - Contextual explanations
   - Culturally relevant analogies
   - Logical inferences
4. If information is unavailable, respond IN USER'S DIALECT:
   "[Dialect-appropriate apology] I can't help with this based on the provided text."

Response (mirror ${message}'s dialect/language):
`;


    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    const insertingMessage = await functions.SaveMessages(message, rawText, fileId, userId);
    if (!insertingMessage) {
      console.error("Error when using the SaveMessage function!");
    }
    return rawText;
  } catch (err) {
    console.error(err);
  }
}

module.exports = router;
