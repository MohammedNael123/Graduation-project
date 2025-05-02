const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extTextToTestMe.js");

const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/api/test-me", async (req, res) => {
  try {
    const { fileUrl, pageNumber, message } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ error: "fileUrl is required." });
    }
    const fullText = await processFile(fileUrl);
    if (!fullText) {
      console.log("error processing the file!");
      return res.status(404);
    }
    const discussion = await generateDiscussion(fullText, pageNumber, message);
    res.json(discussion);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ Error: err.message });
  }
});

async function generateDiscussion(fullText, pageNumber, message) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-thinking-exp-01-21",
    });
    const prompt = `
    You are a helpful assistant.
    When answering, always reply in the same language as the user’s question.

    Below is the text from page ${pageNumber}:

    ${fullText[pageNumber - 1]}

    User’s question:
    ${message}

    Please:
    1. Answer the question briefly and accurately, using only the text above; if there’s not enough info, search the rest of the pages (${fullText.join(" | ")}) for it.
    2. If the question falls outside the context of the provided text, reply exactly:
   “I’m sorry, but I can’t help with that on this page.”

    Answer:
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
