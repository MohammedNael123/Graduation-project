const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");
const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyAIzGbi2qZcr6KMBvCiUC26NNHbhRun0M8");

router.post("/api/generate-timetable", async (req, res) => {
  try {
    const { fileUrl, DateOfStart, TimeOfStart, DateOfEnd, TimeOfEnd } = req.body;
    const fullText = await processFile(fileUrl);
    const timetableHtml = await generateTimetable(fullText, DateOfStart, TimeOfStart, DateOfEnd, TimeOfEnd);
    
    res.header("Content-Type", "text/html");
    res.send(timetableHtml);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

function sanitizeHtml(rawText) {
  // Remove markdown code blocks
  let cleaned = rawText.replace(/```html/gi, '');
  cleaned = cleaned.replace(/```/g, '');
  
  // Remove newline characters
  cleaned = cleaned.replace(/\n/g, '');
  
  // Trim whitespace and clean up any residual markdown
  cleaned = cleaned
    .trim()
    .replace(/^html/, '') // In case response starts with 'html'
    .replace(/<\/?markdown>/g, ''); // Handle any markdown tags

  return cleaned;
}

async function generateTimetable(text, startDate, startTime, endDate, endTime) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    const prompt = ` 
    You are an AI that must produce a study timetable entirely in HTML with no additional commentary or formatting. Your output should be a complete HTML document that starts with the <!DOCTYPE html> declaration and includes all necessary HTML, head, and body tags.The structure must be like that:
           
           <!DOCTYPE html>
           <html lang="ar" dir="rtl">
           <head>
               <meta charset="UTF-8">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>خطة دراسة 18.650 MIT - المقدمة</title>
            <style>
    :root {
        --primary: #2A4365;
        --secondary: #4299E1;
        --accent: #F56565;
        --light: #EBF8FF;
        --dark: #1A365D;
        --break-color: #E2E8F0;
        --radius: 0.75rem;
    }

    body {
        font-family: 'Tajawal', system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 1rem;
        background: #F7FAFC;
        color: var(--dark);
        direction: rtl;
    }

    .container {
        max-width: 1200px;
        margin: 2rem auto;
        background: white;
        border-radius: var(--radius);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    h1 {
        color: white;
        background: var(--primary);
        padding: 2rem;
        margin: 0;
        font-size: 1.875rem;
        text-align: center;
    }

    .current-time {
        background: linear-gradient(135deg, var(--secondary), var(--primary));
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 2rem;
        margin: -1rem auto 2rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        font-weight: 500;
        width: fit-content;
        position: relative;
        z-index: 1;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        position: relative;
    }

    thead {
        position: sticky;
        top: 0;
        z-index: 2;
    }

    th {
        background: var(--primary);
        color: white;
        padding: 1.25rem;
        font-weight: 600;
        text-align: right;
        border-bottom: 3px solid var(--secondary);
    }

    td {
        padding: 1rem;
        border-bottom: 1px solid #EDF2F7;
        text-align: right;
    }

    tr:not(.break):hover {
        background: var(--light);
        transition: background 0.2s ease;
    }

    .break td {
        background: var(--break-color);
        color: #4A5568;
        font-weight: 500;
        position: relative;
    }

    .break td::before {
        content: "⏸";
        margin-left: 0.5rem;
        opacity: 0.7;
    }

    @media (max-width: 768px) {
        .container {
            margin: 1rem;
            border-radius: 0.5rem;
        }

        h1 {
            font-size: 1.5rem;
            padding: 1.5rem;
        }

        table, thead, tbody, th, td, tr {
            display: block;
        }

        thead {
            position: absolute;
            top: -9999px;
            left: -9999px;
        }

        tr {
            margin-bottom: 1rem;
            border: 1px solid #E2E8F0;
            border-radius: 0.5rem;
        }

        td {
            padding: 0.75rem 1rem;
            border: none;
            position: relative;
            padding-left: 45%;
        }

        td::before {
            content: attr(data-label);
            position: absolute;
            left: 1rem;
            width: 45%;
            padding-right: 1rem;
            font-weight: 600;
            color: var(--primary);
            text-align: left;
        }

        .break td {
            text-align: center !important;
            padding-left: 1rem;
        }

        .break td::before {
            display: none;
        }
    }

    @media (max-width: 480px) {
        body {
            padding: 0.5rem;
        }

        .container {
            margin: 0.5rem;
        }

        td {
            padding-left: 50%;
            font-size: 0.875rem;
        }

        td::before {
            width: 50%;
            font-size: 0.875rem;
        }
    }
</style>
           </head>
           <body>
               <h1>خطة دراسة 18.650 MIT - المقدمة</h1>
               <p class="current-time">الوقت الحالي: 2:33 مساءً</p>
               <table>
                   <thead>
                       <tr>
                           <th>التاريخ</th>
                           <th>الوقت</th>
                           <th>المدة</th>
                           <th>الموضوع</th>
                           <th>التركيز</th>
                       </tr>
                   </thead>
                   <tbody>
                       <tr> 
                           <td>2025/3/13</td>
                           <td>2:33 - 2:58 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>نظرة عامة على الدورة والتحفيز (الشرائح 1-10)</td>
                           <td>فهم أهداف الدورة، اللوجستيات، المتطلبات الأساسية، وسؤال "لماذا الإحصاء؟". استيعاب مفهوم العشوائية ودورها. التمييز بين الاحتمال والإحصاء.</td>
                       </tr>
                       <tr class="break">
                           <td>2:58 - 3:03 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة، تمدد، احصل على بعض الماء.</td>
                       </tr>
                       <tr>
                           <td>3:03 - 3:28 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>مراجعة الاحتمالات (الشرائح 11-14)</td>
                           <td>تحديث أساسيات الاحتمالات. فهم الأمثلة والتعريفات. التركيز على العمليات المعروفة (الاحتمال) مقابل العمليات غير المعروفة (الإحصاء).</td>
                       </tr>
                       <tr class="break">
                           <td>3:28 - 3:33 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة.</td>
                       </tr>
                       <tr>
                           <td>3:33 - 3:58 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>الإحصاء والنمذجة (الشرائح 15-16)</td>
                           <td>الفكرة الأساسية: العملية المعقدة = عملية بسيطة + ضوضاء عشوائية. الارتباط بالمشاكل الواقعية.</td>
                       </tr>
                       <tr class="break">
                           <td>3:58 - 4:03 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة.</td>
                       </tr>
                       <tr>
                           <td>4:03 - 4:28 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>مثال التقبيل (الاستدلال) (الشرائح 17-24)</td>
                           <td>العمل بعناية. فهم: إعداد المشكلة، تصميم التجربة، المقدر (متوسط العينة)، الافتراضات (متغير عشوائي، برنولي، الاستقلال). تحليل الافتراضات بشكل نقدي.</td>
                       </tr>
                       <tr class="break">
                           <td>4:28 - 4:33 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة.</td>
                       </tr>
                       <tr>
                           <td>4:33 - 4:58 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>LLN، CLT، والنتائج (الشرائح 25-29)</td>
                           <td>فهم LLN و CLT *في السياق*. كيف يبرران متوسط العينة ويمكّنان فترات الثقة.</td>
                       </tr>
                       <tr class="break">
                           <td>4:58 - 5:03 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة.</td>
                       </tr>
                       <tr>
                           <td>5:03 - 5:28 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>متباينة هوفدينغ والتقارب (الشرائح 30-35)</td>
                           <td>هوفدينغ كبديل لـ CLT (العينات الصغيرة). مراجعة *أنواع* التقارب (a.s.، في الاحتمال، في التوزيع، في Lp). التركيز على *المفاهيم*.</td>
                       </tr>
                       <tr class="break">
                           <td>5:28 - 5:33 مساءً</td>
                           <td>5 دقائق</td>
                           <td>*استراحة*</td>
                           <td>استراحة قصيرة.</td>
                       </tr>
                       <tr>
                           <td>5:33 - 5:58 مساءً</td>
                           <td>25 دقيقة</td>
                           <td>مثال وقت الوصول (الشرائح 36-45)</td>
                           <td>التركيز على كيفية تطبيق طريقة دلتا ونظرية سلوتسكي، ومراجعة الخطوات المتوفرة.</td>
                       </tr>
                   </tbody>
               </table>
           </body>
           </html>
           
           Do not include any text outside of the HTML code. Your output must contain only the HTML as shown, with no markdown formatting or commentary.
           based on these (${startDate},${startTime} ,${endDate} , ${endTime})  and this text ${text} you must change the values of start time,end time,dates,title and every thing,
           you must don't exeeds the end time , if rest time not important don't add it but don't exeeds the end time and Space out the study periods according to the start date and the end date.
           `;

    const result = await model.generateContent(prompt);
    const rawText = await result.response.text();
    const cleanedHtml = sanitizeHtml(rawText);

    return cleanedHtml;
  } catch (error) {
    console.error("Error generating timetable:", error);
    throw new Error("Failed to generate timetable");
  }
}

module.exports = router;




