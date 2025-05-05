const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extTextToTestMe.js");

const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.get("/api/pdf-proxy", async (req, res) => {
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) return res.status(400).send("Missing url");

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    res
      .header("Access-Control-Allow-Origin", "*")
      .header("Content-Type", "application/pdf")
      .send(response.data);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/api/test-me", async (req, res) => {
  try {
    const { fileUrl, pageNumber, message } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: "fileUrl is required." });
    }

    const fullText = await processFile(fileUrl);
    if (!Array.isArray(fullText) || fullText.length === 0) {
      console.error("error processing the file!");
      return res.status(500).json({ error: "Failed to process file." });
    }

    const discussion = await generateDiscussion(fullText, pageNumber, message);

    return res.json({ reply: discussion });
  } catch (err) {
    console.error("Error in /api/test-me:", err);
    return res.status(500).json({ error: err.message });
  }
});

async function generateDiscussion(fullText, pageNumber, message) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21",
    });
    const pageText = fullText[pageNumber - 1];
    console.log("pagenumber is : ", pageNumber);
    const fallbackContext = fullText
      .slice(Math.max(0, pageNumber - 2), pageNumber + 2)
      .join(" | ");

    const prompt = `
    You are a multilingual assistant trained to mirror users' linguistic patterns.

    Text from page ${pageNumber}:
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
   "[Dialect-appropriate apology] I can't help with this based on page ${pageNumber}."
  
    Response (mirror ${message}'s dialect/language):
   `;

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    console.log(rawText);
    return rawText;
  } catch (err) {
    console.error(err);
  }
}

module.exports = router;
