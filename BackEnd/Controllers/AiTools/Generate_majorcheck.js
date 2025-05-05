import React, { useState ,useEffect  } from 'react';
import axios from 'axios';
import Majorcheck from './majorcheckcomponent';

const QuizMaker = () => {
  const [formData, setFormData] = useState({
    track: '',
    language: 'en',
    NumberOfQuestion: 15
  });
  const [questions, setQuestions] = useState([]);
  const [definition, setDefinition] = useState('');
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-questions', formData);
      setQuestions(response.data.questions || []);
      setDefinition(response.data.definition || '');
      setTopics(response.data.topics || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          🎓 Major Fit Checker 🎓
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter a Major (e.g., IT, Medical, Engineering)
          </label>
          <input
            type="text"
            name="track"
            value={formData.track}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Number of Questions (10-15)
            </label>
            <input
              type="number"
              name="NumberOfQuestion"
              min="10"
              max="15"
              value={formData.NumberOfQuestion}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border-2 border-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition"
        >
          {loading ? 'Generating...' : 'Check My Fit'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}
      </form>

      {(definition || topics) && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100 mb-6">
          <h3 className="text-xl font-bold text-blue-700 mb-2">🧾 About this Major:</h3>
          {definition && <p className="mb-4 text-gray-800">{definition}</p>}
          {topics && (
            <>
              <h4 className="font-semibold mb-1 text-blue-600">📚 Example Courses:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {topics.split(',').map((topic, idx) => (
                  <li key={idx}>{topic.trim()}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-blue-100">
          <Majorcheck questions={questions} />
        </div>
      )}
    </div>
  );
};

export default QuizMaker;

// routes/quizRoutes.js
const express = require("express");
const majorcheck = require("majorcheck");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");

const router = express.Router();

router.use(majorcheck());
router.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyAIzGbi2qZcr6KMBvCiUC26NNHbhRun0M8");

function getExamples(track, language) {
  const examples = {
    it: {
      en: {
        intro: "Information Technology focuses on computer systems, networks, and data management.",
        topics: "programming basics, networks, databases, cybersecurity"
      },
      ar: {
        intro: "يركز تخصص تكنولوجياالمعلومات على أنظمة الحاسوب والشبكات وإدارة البيانات.",
        topics: "أساسيات البرمجة، الشبكات، قواعد البيانات، الأمن السيبراني"
      }
    },
    medical: {
      en: {
        intro: "The medical field involves the study of human health, anatomy, and clinical practice.",
        topics: "human anatomy, physiology, medical terminology"
      },
      ar: {
        intro: "يشمل المجال الطبي دراسة صحة الإنسان والتشريح والممارسة السريرية.",
        topics: "التشريح البشري، الفسيولوجيا، المصطلحات الطبية"
      }
    },
    engineering: {
      en: {
        intro: "Engineering applies science and mathematics to solve real-world problems.",
        topics: "physics, mathematics, design principles"
      },
      ar: {
        intro: "تطبق الهندسة العلوم والرياضيات لحل المشكلات العملية.",
        topics: "الفيزياء، الرياضيات، مبادئ التصميم،الرسم الهندسي"
      }
    }
  };

  return examples[track.toLowerCase()]?.[language] || examples.it[language];
}

router.post("/api/generate-questions", async (req, res) => {
  try {
    const { track, language = "en" } = req.body;
    const numQuestions = Math.max(parseInt(req.body.NumberOfQuestion) || 15, 10);

    if (!track) {
      return res.status(400).json({ error: "Track is required (e.g., medical, engineering, IT)" });
    }

    const result = await generateQuestions(track, numQuestions, language);
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

async function generateQuestions(track, numQuestions, language) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });
    const examples = getExamples(track, language);
    const { intro, topics } = examples;

    let prompt = "";

    if (language === "ar") {
      prompt = `
قم بإنشاء ${numQuestions} سؤال اختيار من متعدد (MCQ) لتقييم ميول واهتمامات طالب في مجال ${track}.
تعريف التخصص: ${intro}

يجب أن تحتوي الأسئلة على:
1. (60%) أسئلة حول أساسيات المجال، مثل: ${topics}.
2. (40%) أسئلة حول الرغبات والميول الشخصية المتعلقة بالتخصص.

كل سؤال يحتوي على 3 أو 4 خيارات مختلفة دون وجود إجابة صحيحة أو خاطئة.

وفي النهاية، أضف توصية قصيرة توضح مدى ملاءمة هذا التخصص بناءً على هذه الأسئلة.

الصيغة المطلوبة:
{
  "questions": [
    {
      "question": "نص السؤال هنا",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3"]
    }
  ],
  "recommendation": "..."
}
`;
    } else {
      prompt = `
Generate ${numQuestions} multiple choice questions (MCQs) to assess a student's interest and readiness for the ${track} field.
Field definition: ${intro}

Include:
1. (60%) Basic foundational questions, e.g.: ${topics}.
2. (40%) Interest and preference-related questions.

Each question should have 3-4 distinct options without correct or wrong answers.

At the end, include a short recommendation message.

Respond only in this JSON format:
{
  "questions": [
    {
      "question": "Sample?",
      "options": ["A", "B", "C", "D"]
    }
  ],
  "recommendation": "..."
}
`;
    }

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);

    return {
      ...parsed,
      definition: intro,
      topics: topics
    };
  } catch (error) {
    console.error("Error in generateQuestions:", error);
    throw error;
  }
}

module.exports = router;
