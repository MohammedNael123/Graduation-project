const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");

const router = express.Router();

router.use(cors());
router.use(express.json());

//const genAI = new GoogleGenerativeAI("AIzaSyAIzGbi2qZcr6KMBvCiUC26NNHbhRun0M8");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Endpoint to generate the quiz
router.post("/api/generate-quiz", async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const numQuestions = Math.min(parseInt(req.body.NumberOfQuestion) || 5, 10);

    const fullText = await processFile(fileUrl);

    const quiz = await generateQuiz(fullText, numQuestions);
    res.json(quiz);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function generateQuiz(text, numQuestions) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    const prompt = `Generate a multiple-choice quiz from this text:\n\n${text}\n\nInclude ${numQuestions} questions with 5 answer choices each, marking the correct one. Format as JSON like this:
    {
      "questions": [
        {
          "question": "What is X?",
          "options": ["A", "B", "C", "D", "E"],
          "answer": "A"
        }
      ]
    } Output only valid JSON without any additional text or markdown formatting.`;

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();

    // Clean markdown formatting
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}

// Export the router as CommonJS module
module.exports = router;
