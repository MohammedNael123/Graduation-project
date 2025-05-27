const express = require("express");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

router.use(express.json());
router.use(session({
  secret:"my secret",
  resave: false,
  saveUninitialized:true,
  cookie:{secure:false}
}));

// Middleware for session


// 
router.get("/getCourses", async (req, res) => {
    
    console.log("In the get courses api !!");
    const userId = req.session.user?.id;
    console.log("the user id is : ",userId);
    if (!userId) {
        console.log("Please Login!");
        return res.status(401).json({ message: "Please Login!" });
    }

    try {
        // Get the user's course IDs from weak_profiles_courses
        const { data: userCourses, error : userCoursesError } = await supabase
            .from("weak_profiles_courses")
            .select("course_id")
            .eq("user_id", userId);

        //if (error) throw error;
        if (userCoursesError) {
            return res.status(200).json({ message: "No courses found." });
        }

        const courseIds = userCourses.map(item => item.course_id); // Extract course IDs

        // Get course details from courses table
        const { data: courses, error: courseError } = await supabase
            .from("UserCourses")
            .select("id, name") // Select the needed columns
            .in("id", courseIds); // Fetch courses that match the user's courses

        if (courseError) throw courseError;

        console.log("Courses retrieved:", courses);
        return res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(500).json({ message: "Error fetching the courses.", error });
    }
});

router.get("/getfiles", async (req, res) => {
    const courseId = req.query.course;
    const userId = req.session.user?.id;
    if(!userId){
        console.log("must login!");
        return res.status(401).json("must be logged in");
    }

    try {

        const { data: coursesFiles, error: errorFiles } = await supabase
            .from("weak_courses_pdf_files")
            .select("pdf_file_id")
            .eq("courses_id",courseId);

        if (errorFiles || !coursesFiles || coursesFiles.length === 0) {
            console.log("No files or error while fetching file IDs");
            return res.status(404).json({ error: "No files found for this course" });
        }

        const fileIds = coursesFiles.map(item => item.pdf_file_id);

        const { data: dataFiles, error: errorFile } = await supabase
            .from("uploaded_materials")
            .select("id, file_url")
            .in("id", fileIds);

        if (errorFile || !dataFiles) {
            console.log("Error fetching files from uploaded_materials");
            return res.status(500).json({ error: "Error fetching file details" });
        }

        // تجهيز البيانات للفرونت
        const formattedFiles = dataFiles.map(file => ({
            id: file.id,
            filename: file.file_url.split("/").pop(), // اسم الملف فقط
            url: file.file_url
        }));

        return res.json(formattedFiles);

    } catch (error) {
        console.log("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/getMessages", async (req, res) => {
    const fileId = req.query.file;
    const userId = req.session.user?.id;

    if (!userId) {
        console.log("must login!");
        return res.status(401).json("must be logged in");
    }

    try {
        // جلب message_id المرتبطة بالملف
        const { data: pdfMessages, error: errorPdfMessages } = await supabase
            .from("pdf_messages")
            .select("message_id")
            .eq("pdf_file_id", fileId);

        if (errorPdfMessages) {
            console.log("No Messages or error while fetching Message IDs");
            return res.status(404).json({ error: "No messages found for this file" });
        }

        const messagesId = pdfMessages.map(item => item.message_id);

        // جلب نص الرسالة ونوع المرسل (sender) لكل رسالة
        const { data: dataMessages, error: errorMessages } = await supabase
            .from("messages")
            .select("message_text, sender")
            .in("id", messagesId);

        if (errorMessages) {
            console.log("Error fetching messages from messages");
            return res.status(500).json({ error: "Error fetching message details" });
        }

        // تجهيز البيانات للفرونت مع sender
        const organisedMessages = dataMessages.map(message => ({
            message: message.message_text,
            sender: message.sender,  // user or ai
        }));

        return res.json(organisedMessages);

    } catch (error) {
        console.log("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Start server
module.exports = router;
