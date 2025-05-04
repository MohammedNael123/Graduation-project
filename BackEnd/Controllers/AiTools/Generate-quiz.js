const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");
const { jsonrepair } = require("jsonrepair");

const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyAIzGbi2qZcr6KMBvCiUC26NNHbhRun0M8");

// Endpoint to generate the quiz
router.post("/api/generate-quiz", async (req, res) => {
  try {
    const { fileUrl, NumberOfQuestion } = req.body;
    const numQuestions = Math.min(parseInt(NumberOfQuestion) || 5, 30);

    const fullText = await processFile(fileUrl);

    const quiz = await generateQuiz(fullText, numQuestions);
    res.json(quiz);
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message });
  }
});


async function generateQuiz(text, numQuestions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    const prompt = `
Generate a creative, non-duplicated multiple-choice AND true/false quiz from the following text:

"${text}"

Rules:
- Create ${numQuestions} questions total.
- Some should be multiple-choice (4 options), and some should be true/false.
- Mark the correct answer clearly.
- Output ONLY valid JSON, no explanation, no markdown formatting.

Format:

{
  "questions": [
    {
      "question": "What is X?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    },
    {
      "question": "Is X true?",
      "options": ["True", "False"],
      "answer": "True"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();

    // تنظيف أولي
    let cleanedText = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // محاولة إصلاح JSON
    const repairedJSON = jsonrepair(cleanedText);

    const quizData = JSON.parse(repairedJSON);

    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}


module.exports = router;
