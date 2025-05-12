const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js"); 

const router = express.Router();
router.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyAIzGbi2qZcr6KMBvCiUC26NNHbhRun0M8");

// دالة مساعدة للرسائل متعددة اللغات
const getMessage = (language, englishMsg, arabicMsg) => {
  return language === "ar" ? arabicMsg : englishMsg;
};

router.post("/api/major-definition", async (req, res) => {
  try {
    const { major, language = "en" } = req.body;

    if (!major) {
      return res.status(400).json({ 
        error: getMessage(language, "Major is required.", "التخصص مطلوب.")
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = getMessage(language,
      `Provide a comprehensive definition of ${major} major including:
      1- General definition
      2- Core required skills
      3- Career opportunities
      4- Expected challenges
      5- Related majors

      Respond in JSON format:
      {
        "definition": "Major definition",
        "skills": ["Skill 1", "Skill 2"],
        "careers": ["Career 1", "Career 2"],
        "challenges": ["Challenge 1", "Challenge 2"],
        "relatedMajors": ["Major 1", "Major 2"]
      }`,
      `قدم تعريفًا شاملًا لتخصص ${major} يتضمن:
      1- التعريف العام للتخصص
      2- المهارات الأساسية المطلوبة
      3- الفرص الوظيفية
      4- التحديات المتوقعة
      5- التخصصات ذات الصلة

      أجب بصيغة JSON كالتالي:
      {
        "definition": "تعريف التخصص",
        "skills": ["المهارة 1", "المهارة 2"],
        "careers": ["الوظيفة 1", "الوظيفة 2"],
        "challenges": ["التحدي 1", "التحدي 2"],
        "relatedMajors": ["التخصص 1", "التخصص 2"]
      }`
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = cleanJsonResponse(text);
    
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Error getting major definition:", error);
    res.status(500).json({ 
      error: getMessage(language, 
        "Failed to get major definition", 
        "فشل الحصول على تعريف التخصص")
    });
  }
});

router.post("/api/generate-test", async (req, res) => {
  try {
    const { major, language = "en" } = req.body;

    if (!major) {
      return res.status(400).json({ 
        error: getMessage(language, "Major is required.", "التخصص مطلوب.")
      });
    }

    // التحقق من صحة التخصص
    const validationModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const validationPrompt = getMessage(language,
      `Is "${major}" a known academic major in universities? Answer with "yes" or "no" only without any additional explanation.`,
      `هل "${major}" هو تخصص دراسي معروف في الجامعات؟ أجب بـ "نعم" أو "لا" فقط بدون أي شرح إضافي.`
    );

    const validationResult = await validationModel.generateContent(validationPrompt);
    const validationResponse = await validationResult.response;
    const validationText = validationResponse.text().toLowerCase().trim();

    // إذا كان التخصص غير معروف
    if (validationText.includes('no') || validationText.includes('لا')) {
      return res.status(400).json({ 
        error: getMessage(language,
          `Sorry, we don't recognize the '${major}' major. Please check the spelling or try another major.`,
          `عذرًا، لا نعرف تخصص '${major}'. يرجى التأكد من الكتابة الصحيحة أو تجربة تخصص آخر.`
        )
      });
    }

    // إنشاء الاختبار
    const testModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const testPrompt = getMessage(language,
      `Generate a very simple beginner-friendly test for ${major} major consisting of 10 questions:
      - 6 questions (60%) about basic major fundamentals (simple general knowledge)
      - 4 questions (40%) about personal interests and aptitudes
      
      Question specifications:
      1- All questions should be very easy and suitable for beginners
      2- Use simple clear language
      3- Each question should have 4 options
      4- Fundamental questions should focus on simple general knowledge about the major
      5- Interest questions should be simple and straightforward
      
      Specify question type (fundamentals|interests) in a "type" field.
      
      Respond in JSON format:
      {
        "questions": [
          {
            "question": "Simple and clear question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "type": "fundamentals|interests"
          },
          ...
        ]
      }`,
      `أنشئ اختبارًا بسيطًا جدًا للمبتدئين لتخصص ${major} يتكون من 10 أسئلة:
      - 6 أسئلة (60%) عن أساسيات التخصص (معلومات عامة بسيطة)
      - 4 أسئلة (40%) عن الميول والاهتمامات الشخصية
      
      مواصفات الأسئلة:
      1- جميع الأسئلة يجب أن تكون سهلة جدًا ومناسبة للمبتدئين
      2- استخدام لغة بسيطة واضحة
      3- كل سؤال يجب أن يحتوي على 4 خيارات
      4- الأسئلة الأساسية تركز على معلومات عامة بسيطة عن التخصص
      5- أسئلة الميول بسيطة وغير معقدة
      
      حدد نوع السؤال (أساسيات أو ميول) في حقل "type".
      
      الإخراج بصيغة JSON كالتالي:
      {
        "questions": [
          {
            "question": "نص السؤال البسيط والواضح",
            "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
            "type": "أساسيات|ميول"
          },
          ...
        ]
      }`
    );

    const testResult = await testModel.generateContent(testPrompt);
    const testResponse = await testResult.response;
    const testText = testResponse.text();
    const cleanedText = cleanJsonResponse(testText);
    
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Error generating test:", error);
    res.status(500).json({ 
      error: getMessage(language,
        "An error occurred while generating the test. Please try again.",
        "حدث خطأ أثناء إنشاء الاختبار. يرجى المحاولة مرة أخرى."
      )
    });
  }
});

router.post("/api/generate-recommendation", async (req, res) => {
  try {
    const { major, answers, language = "en" } = req.body;

    if (!major || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        error: getMessage(language,
          "Major and answers are required.",
          "التخصص والإجابات مطلوبة."
        )
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = getMessage(language,
      `Based on student's answers for ${major} major questions:
      ${JSON.stringify(answers, null, 2)}
      
      Please:
      1- Analyze answers for fundamentals questions (60%)
      2- Analyze answers for interests questions (40%)
      3- Provide comprehensive evaluation of major suitability
      4- Suggest improvements if results are moderate
      5- Suggest alternative majors if results are weak
      6- Provide recommended resources to learn more
      
      Use simple clear language suitable for beginners.
      
      Respond in JSON format:
      {
        "fundamentalsAnalysis": "Fundamentals analysis",
        "interestsAnalysis": "Interests analysis",
        "recommendation": "Detailed recommendation",
        "improvementTips": ["Tip 1", "Tip 2"],
        "alternativeMajors": ["Major 1", "Major 2"],
        "resources": ["Resource 1", "Resource 2"]
      }`,
      `بناءً على إجابات الطالب على أسئلة تخصص ${major}:
      ${JSON.stringify(answers, null, 2)}
      قم بما يلي:
      1- حلل الإجابات على أسئلة الأساسيات (60%)
      2- حلل الإجابات على أسئلة الميول (40%)
      3- قدم تقييمًا شاملًا لمدى ملائمة التخصص للطالب
      4- اقترح تحسينات إذا كانت النتائج متوسطة
      5- اقترح تخصصات بديلة إذا كانت النتائج ضعيفة
      6- قدم موارد مقترحة للتعمق في التخصص
      
      استخدم لغة بسيطة واضحة ومناسبة للمبتدئين.
      
      الإخراج بصيغة JSON كالتالي:
      {
        "fundamentalsAnalysis": "تحليل فهم الأساسيات",
        "interestsAnalysis": "تحليل توافق الميول",
        "recommendation": "توصية مفصلة",
        "improvementTips": ["نصيحة 1", "نصيحة 2"],
        "alternativeMajors": ["تخصص 1", "تخصص 2"],
        "resources": ["رابط 1", "رابط 2"]
      }`
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = cleanJsonResponse(text);
    
    res.json(JSON.parse(cleanedText));
  } catch (error) {
    console.error("Error generating recommendation:", error);
    res.status(500).json({ 
      error: getMessage(language,
        "Failed to generate recommendation",
        "فشل إنشاء التوصية"
      )
    });
  }
});

function cleanJsonResponse(text) {
  try {
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonString = text.slice(jsonStart, jsonEnd);
    
    return jsonString
      .replace(/```json|```/g, '')
      .replace(/\n/g, '')
      .replace(/\t/g, '')
      .replace(/\\'/g, "'")
      .trim();
  } catch (e) {
    console.error("Error cleaning JSON:", e);
    return '{}';
  }
}

module.exports = router;