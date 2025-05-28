const express = require("express");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

router.use(express.json());
// app.use(session({
//   secret: "my secret",
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: true,            
//     sameSite: "none"         
//   }
// }));




// 
router.get("/getCourses", async (req, res) => {
    const userId = req.session.user?.id;
    if (!userId) {
        console.error("User Not Logged in!");
        return res.status(401).json({ message: "Please Login!" });
    }
    try {
        const { data: userCourses, error: userCoursesError } = await supabase
            .from("weak_profiles_courses")
            .select("course_id")
            .eq("user_id", userId);

        if (userCoursesError) {
            res.status(204).json({ message: "No courses found." });
            throw userCoursesError
        }

        const courseIds = userCourses.map(item => item.course_id);

        const { data: courses, error: courseError } = await supabase
            .from("UserCourses")
            .select("id, name")
            .in("id", courseIds);

        if (courseError) {
            res.status(204).json({ message: "No courses found." });
            throw courseError;
        }

        return res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ message: "Error fetching the courses." });
    }
});

router.get("/getfiles", async (req, res) => {
    const courseId = req.query.course;
    const userId = req.session.user?.id;
    if (!userId) {
        console.erorr("User Not logged in!");
        return res.status(401).json("Please login!");
    }

    try {

        const { data: coursesFiles, error: errorFiles } = await supabase
            .from("weak_courses_pdf_files")
            .select("pdf_file_id")
            .eq("courses_id", courseId);

        if (errorFiles || !coursesFiles || coursesFiles.length === 0) {
            console.error("No files or error while fetching file IDs");
            return res.status(404).json({ error: "No files found for this course" });
        }

        const fileIds = coursesFiles.map(item => item.pdf_file_id);

        const { data: dataFiles, error: errorFile } = await supabase
            .from("uploaded_materials")
            .select("id, file_url")
            .in("id", fileIds);

        if (errorFile || !dataFiles) {
            console.error("Error fetching files from uploaded_materials");
            return res.status(500).json({ error: "Error fetching file details" });
        }

        const formattedFiles = dataFiles.map(file => ({
            id: file.id,
            filename: file.file_url.split("/").pop(),
            url: file.file_url
        }));

        return res.json(formattedFiles);

    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/getMessages", async (req, res) => {
    const fileId = req.query.file;
    const userId = req.session.user?.id;

    if (!userId) {
        console.erorr("User Not logged in!");
        return res.status(401).json("Please login!");
    }

    try {
        const { data: pdfMessages, error: errorPdfMessages } = await supabase
            .from("pdf_messages")
            .select("message_id")
            .eq("pdf_file_id", fileId);

        if (errorPdfMessages) {
            console.error("No Messages or error while fetching Message IDs");
            return res.status(404).json({ error: "No messages found for this file" });
        }

        const messagesId = pdfMessages.map(item => item.message_id);

        const { data: dataMessages, error: errorMessages } = await supabase
            .from("messages")
            .select("message_text, sender")
            .in("id", messagesId);

        if (errorMessages) {
            console.error("Error fetching messages from messages");
            return res.status(500).json({ error: "Error fetching message details" });
        }

        const organisedMessages = dataMessages.map(message => ({
            message: message.message_text,
            sender: message.sender,
        }));

        return res.json(organisedMessages);

    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
