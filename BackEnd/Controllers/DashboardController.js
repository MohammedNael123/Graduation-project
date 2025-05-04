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
router.use(session({
    secret: "your_secret_key", // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

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
        console.log("in the try in get courses");
        const { data: userCourses, error : userCoursesError } = await supabase
            .from("weak_profiles_courses")
            .select("course_id")
            .eq("user_id", userId);

            console.log("in the try 1 in get courses");

        //if (error) throw error;
        if (userCoursesError) {
            return res.status(200).json({ message: "No courses found." });
        }
        console.log("in the try 2 in get courses");

        const courseIds = userCourses.map(item => item.course_id); // Extract course IDs

        // Get course details from courses table
        const { data: courses, error: courseError } = await supabase
            .from("courses")
            .select("id, name") // Select the needed columns
            .in("id", courseIds); // Fetch courses that match the user's courses
            console.log("in the try 3 in get courses");

        if (courseError) throw courseError;
        console.log("in the try 4 in get courses");

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
            .from("pdf_files")
            .select("id, file_url")
            .in("id", fileIds);

        if (errorFile || !dataFiles) {
            console.log("Error fetching files from pdf_files");
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



// Start server
module.exports = router;
