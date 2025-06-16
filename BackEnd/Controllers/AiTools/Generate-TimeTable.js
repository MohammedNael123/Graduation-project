const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const processFile = require("../getTxtFromFile/extText.js");
const router = express.Router();

router.use(cors());
router.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post("/api/generate-timetable", async (req, res) => {
  try {
    const { fileUrl, DateOfStart, TimeOfStart, DateOfEnd, TimeOfEnd , language } = req.body;
    const fullText = await processFile(fileUrl);
    const timetableHtml = await generateTimetable(fullText, DateOfStart, TimeOfStart, DateOfEnd, TimeOfEnd, language);
    
    res.header("Content-Type", "text/html");
    res.send(timetableHtml);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

function sanitizeHtml(rawText) {
  let cleaned = rawText.replace(/```html/gi, '');
  cleaned = cleaned.replace(/```/g, '');
  
  cleaned = cleaned.replace(/\n/g, '');
  
  cleaned = cleaned
    .trim()
    .replace(/^html/, '') // In case response starts with 'html'
    .replace(/<\/?markdown>/g, ''); // Handle any markdown tags

  return cleaned;
}

async function generateTimetable(text, startDate, startTime, endDate, endTime, language) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GiminiAiModel });

     const prompt = ` 
You are an AI that must produce a study timetable entirely in HTML with no additional commentary or formatting. Your output should be a complete HTML document that starts with the <!DOCTYPE html> declaration and includes all necessary HTML, head, and body tags. The structure must be like this:

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Study Plan 18.650 MIT - Introduction</title>
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
    <h1>Study Plan 18.650 MIT - Introduction</h1>
    <p class="current-time">Current Time: 2:33 PM</p>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Topic</th>
                <th>Focus</th>
            </tr>
        </thead>
        <tbody>
            <tr> 
                <td>2025/3/13</td>
                <td>2:33 - 2:58 PM</td>
                <td>25 minutes</td>
                <td>Course Overview and Motivation (Slides 1–10)</td>
                <td>Understand course goals, logistics, prerequisites, and the question "Why statistics?". Grasp the role of randomness. Distinguish between probability and statistics.</td>
            </tr>
            <tr class="break">
                <td>2:58 - 3:03 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break. Stretch and grab some water.</td>
            </tr>
            <tr>
                <td>3:03 - 3:28 PM</td>
                <td>25 minutes</td>
                <td>Probability Review (Slides 11–14)</td>
                <td>Revisit probability basics. Understand examples and definitions. Focus on known vs unknown processes (probability vs statistics).</td>
            </tr>
            <tr class="break">
                <td>3:28 - 3:33 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break.</td>
            </tr>
            <tr>
                <td>3:33 - 3:58 PM</td>
                <td>25 minutes</td>
                <td>Statistics and Modeling (Slides 15–16)</td>
                <td>Core idea: complex process = simple process + random noise. Relate to real-world problems.</td>
            </tr>
            <tr class="break">
                <td>3:58 - 4:03 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break.</td>
            </tr>
            <tr>
                <td>4:03 - 4:28 PM</td>
                <td>25 minutes</td>
                <td>Kissing Example (Inference) (Slides 17–24)</td>
                <td>Work carefully. Understand: setup, experimental design, estimator (sample mean), assumptions (random variable, Bernoulli, independence). Analyze critically.</td>
            </tr>
            <tr class="break">
                <td>4:28 - 4:33 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break.</td>
            </tr>
            <tr>
                <td>4:33 - 4:58 PM</td>
                <td>25 minutes</td>
                <td>LLN, CLT, and Outcomes (Slides 25–29)</td>
                <td>Understand LLN and CLT in context. How they justify the sample mean and enable confidence intervals.</td>
            </tr>
            <tr class="break">
                <td>4:58 - 5:03 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break.</td>
            </tr>
            <tr>
                <td>5:03 - 5:28 PM</td>
                <td>25 minutes</td>
                <td>Hoeffding’s Inequality and Convergence (Slides 30–35)</td>
                <td>Hoeffding as an alternative to CLT (for small samples). Review types of convergence (a.s., in probability, in distribution, in Lp). Focus on concepts.</td>
            </tr>
            <tr class="break">
                <td>5:28 - 5:33 PM</td>
                <td>5 minutes</td>
                <td>*Break*</td>
                <td>Short break.</td>
            </tr>
            <tr>
                <td>5:33 - 5:58 PM</td>
                <td>25 minutes</td>
                <td>Arrival Time Example (Slides 36–45)</td>
                <td>Focus on how Delta Method and Slutsky’s Theorem are applied. Review available steps.</td>
            </tr>
        </tbody>
    </table>
</body>
</html>

Do not include any text outside of the HTML code. Your output must contain only the HTML as shown, with no markdown formatting or commentary.

Based on these (${startDate}, ${startTime}, ${endDate}, ${endTime}, ${language}) and this text: ${text}, you must change the values of start time, end time, dates, title, and everything else as needed.

You must not exceed the end time. If break times are not essential, do not include them, but never exceed the end time. Space out the study periods according to the start date and the end date.
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




