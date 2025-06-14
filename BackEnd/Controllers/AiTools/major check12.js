const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * @param {string} major 
 * @param {string} language 
 * @returns {Promise<boolean>} 
 */
async function validateMajor(major, language = "en") {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GiminiAiModel });
    const prompt = language === "ar" 
      ? `هل "${major}" تخصص أكاديمي معترف به في الجامعات العالمية؟ أجب بـ "نعم" أو "لا" فقط دون أي شرح إضافي.`
      : `Is "${major}" an officially recognized academic major in global universities? Answer with "yes" or "no" only without any additional explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().toLowerCase().trim();
    
    return text.includes("نعم") || text.includes("yes");
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}


router.post("/api/major-definition", async (req, res) => {
  const { major, language = "en" } = req.body;

  try {
    if (!major || typeof major !== "string") {
      return res.status(400).json({ 
        error: language === "ar" ? "يجب تقديم اسم تخصص صحيح." : "Valid major name is required."
      });
    }

    const isValidMajor = await validateMajor(major, language);
    if (!isValidMajor) {
      return res.status(400).json({
        error: language === "ar" 
          ? `"${major}" ليس تخصصًا أكاديميًا معترفًا به. يرجى التحقق من الاسم.`
          : `"${major}" is not a recognized academic major. Please verify the name.`
      });
    }

    const model = genAI.getGenerativeModel({ model: process.env.GiminiAiModel });
    const prompt = language === "ar" ? 
      `قدم تعريفًا أكاديميًا دقيقًا لتخصص ${major} مع:
      1- تعريف واضح (فقرة واحدة)
      2- 3 مهارات أساسية مطلوبة
      3- 3 مسارات وظيفية رئيسية
      4- 3 تخصصات ذات صلة
      
      المخرجات بصيغة JSON:
      {
        "definition": "النص",
        "skills": ["...", "...", "..."],
        "careers": ["...", "...", "..."],
        "relatedMajors": ["...", "...", "..."]
      }` 
      : 
      `Provide an academic definition of ${major} including:
      1- Clear definition (one paragraph)
      2- 3 core required skills
      3- 3 main career paths
      4- 3 related majors
      
      Respond in JSON:
      {
        "definition": "text",
        "skills": ["...", "...", "..."],
        "careers": ["...", "...", "..."],
        "relatedMajors": ["...", "...", "..."]
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json(parseMajorDefinition(text, language));
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: language === "ar" 
        ? "حدث خطأ في الخادم. يرجى المحاولة لاحقًا." 
        : "Server error. Please try again later." 
    });
  }
});

router.post("/api/generate-test", async (req, res) => {
  const { major, language = "en" } = req.body;

  try {
    if (!major || typeof major !== "string") {
      return res.status(400).json({ 
        error: language === "ar" ? "يجب تقديم اسم تخصص صحيح." : "Valid major name is required."
      });
    }

    const isValidMajor = await validateMajor(major, language);
    if (!isValidMajor) {
      return res.status(400).json({
        error: language === "ar" 
          ? `"${major}" ليس تخصصًا أكاديميًا معترفًا به. يرجى التحقق من الاسم.`
          : `"${major}" is not a recognized academic major. Please verify the name.`
      });
    }

    const model = genAI.getGenerativeModel({ model: process.env.GiminiAiModel });
    const prompt = language === "ar" ?
      `أنشئ اختبارًا قصيرًا (5 أسئلة فقط) لتخصص ${major}:
      - 3 أسئلة عن المفاهيم الأساسية
      - سؤالان عن الميول الشخصية
      
      مواصفات الأسئلة:
      1- كل الأسئلة يجب أن تكون واضحة وسهلة
      2- كل سؤال يجب أن يحتوي على 4 خيارات
      3- تحديد نوع السؤال (أساسيات/ميول)
      
      الإخراج بصيغة JSON:
      {
        "questions": [
          {
            "question": "نص السؤال",
            "options": ["...", "...", "...", "..."],
            "type": "أساسيات|ميول",
            "correctIndex": 0
          }
        ]
      }`
      :
      `Generate a short test (5 questions only) for ${major} major:
      - 3 questions about core concepts
      - 2 questions about personal aptitudes
      
      Specifications:
      1- All questions should be clear and simple
      2- Each question must have 4 options
      3- Specify question type (fundamentals|interests)
      
      Respond in JSON:
      {
        "questions": [
          {
            "question": "Question text",
            "options": ["...", "...", "...", "..."],
            "type": "fundamentals|interests",
            "correctIndex": 0
          }
        ]
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json(parseTestQuestions(text, language));
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ 
      error: language === "ar" 
        ? "حدث خطأ في الخادم. يرجى المحاولة لاحقًا." 
        : "Server error. Please try again later." 
    });
  }
});


function parseMajorDefinition(text, language) {
  try {
    const cleaned = cleanJsonResponse(text);
    const data = JSON.parse(cleaned);
    
    const requiredFields = ["definition", "skills", "careers", "relatedMajors"];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing ${field} field`);
      }
    }

    return {
      success: true,
      majorDefinition: {
        definition: data.definition,
        skills: data.skills.slice(0, 3),
        careers: data.careers.slice(0, 3),
        relatedMajors: data.relatedMajors.slice(0, 3)
      }
    };
  } catch (error) {
    console.error("Parsing error:", error);
    return {
      success: false,
      error: language === "ar" 
        ? "حدث خطأ في معالجة البيانات. يرجى المحاولة مرة أخرى."
        : "Data processing error. Please try again."
    };
  }
}


function parseTestQuestions(text, language) {
  try {
    const cleaned = cleanJsonResponse(text);
    const data = JSON.parse(cleaned);
    
    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("No questions found");
    }

    const questions = data.questions.slice(0, 5).map(q => ({
      question: q.question,
      options: q.options.slice(0, 4), // تأكيد وجود 4 خيارات فقط
      type: q.type || (language === "ar" ? "أساسيات" : "fundamentals"),
      correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0
    }));

    return {
      success: true,
      test: {
        totalQuestions: questions.length,
        questions
      }
    };
  } catch (error) {
    console.error("Parsing error:", error);
    return {
      success: false,
      error: language === "ar" 
        ? "حدث خطأ في معالجة الأسئلة. يرجى المحاولة مرة أخرى."
        : "Questions processing error. Please try again."
    };
  }
}


function cleanJsonResponse(text) {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) {
    throw new Error("Invalid JSON format");
  }

  return text.slice(jsonStart, jsonEnd)
    .replace(/```(json)?/g, '')
    .replace(/\n/g, '')
    .trim();
}

module.exports = router;