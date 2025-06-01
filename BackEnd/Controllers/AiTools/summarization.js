const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");

const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/api/generate-summarization" , async (req , res) => {
   try { 
    const {fileUrl , lang } = req.body;
    
    const FullText = await processFile(fileUrl);
      
    const summary = await GenerateSummarization(FullText , lang);
    res.status(200).json(summary);
   }
   catch (error) {
     console.error("Error is :" , error);
     res.status(500).json({ error : error.message });
   }
}); 

function sanitizeHtml(rawText) {
    let cleaned = rawText.replace(/```html/gi, '');
    cleaned = cleaned.replace(/```/g, '');
    
    cleaned = cleaned.replace(/\n/g, '');
    
    cleaned = cleaned
      .trim()
      .replace(/^html/, '') 
      .replace(/<\/?markdown>/g, ''); 
  
    return cleaned;
  }

async function GenerateSummarization(text, lang) {
    try {
        const model = genAI.getGenerativeModel({ model: process.env.GiminiAiModel });

        const prompt = `
        أنشئ ملخصًا HTML للنص التالي باللغة ${lang} مع الالتزام الصارم بالهيكل التالي:
        
        <!DOCTYPE html>
        <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>[عنوان الملخص هنا]</title>
            <style>
                :root {
                    --primary: #2A4365;
                    --secondary: #4299E1;
                    --accent: #F56565;
                    --light: #EBF8FF;
                    --dark: #1A365D;
                    --radius: 0.75rem;
                    --shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
                }
        
        
        
                .container {
                    max-width: 1200px;
                    margin: 2rem auto;
                    background: white;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    overflow: hidden;
                            font-family: 'Tajawal', system-ui;
                    line-height: 1.6;
                    margin: 0;
                    padding: 1rem;
                    background: #F7FAFC;
                    color: var(--dark);
                    direction: ${lang === 'ar' ? 'rtl' : 'ltr'};
               
                }
        
                .summary-header {
                    padding: 2rem;
                    background: var(--primary);
                    color: white;
                    text-align: center;
                }
        
                .content-section {
                    padding: 2rem;
                    border-bottom: 3px solid var(--secondary);
                }
        
                .key-points {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    padding: 1.5rem;
                }
        
                .timeline {
                    position: relative;
                    padding: 2rem;
                    background: var(--light);
                }
        
                .event-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                    margin-bottom: 1rem;
                    transition: transform 0.3s ease;
                }
        
                .event-card:hover {
                    transform: translateY(-5px);
                }
        
                @media (max-width: 768px) {
                    .container {
                        margin: 1rem;
                        border-radius: 0.5rem;
                    }
        
                    .key-points {
                        grid-template-columns: 1fr;
                    }
        
                    .content-section {
                        padding: 1rem;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="summary-header">
                    <h1>العنوان الرئيسي للملخص</h1>
                    <p>[وصف قصير]</p>
                </div>
        
                <div class="content-section">
                    <h2>النقاط الرئيسية</h2>
                    <div class="key-points">
                        <!-- النقاط الأساسية هنا -->
                    </div>
                </div>
        
                <div class="timeline">
                    <h2>التسلسل الزمني للأحداث</h2>
                    <!-- الأحداث الزمنية هنا -->
                </div>
        
                <div class="content-section">
                    <h2>التحولات الرئيسية</h2>
                    <!-- التحولات المهمة هنا -->
                </div>
            </div>
        </body>
        </html>
        
        المتطلبات:
        1. املأ الفراغات بالمحتوى المناسب من النص المقدم
        2. حافظ على نفس الهيكل والأنماط بدقة
        3. استخدم نفس أسماء الفئات والألوان
        4. أضف العناصر التفاعلية مثل hover effects
        5. تأكد من استجابة التصميم لكافة الأجهزة
        6. لا تغير أي شيء في الهيكل الأساسي
        
        Do not include any text outside of the HTML code. Your output must contain only the HTML as shown, with no markdown formatting or commentary.
           based on this text ${text} 
            `;

        const result = await model.generateContent(prompt);
        const rawText = await result.response.text();
        const cleanedHtml = sanitizeHtml(rawText);


        return cleanedHtml;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Error generating summary");
    }
}



module.exports = router ;