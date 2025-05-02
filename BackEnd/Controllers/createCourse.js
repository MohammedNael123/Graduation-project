const express = require("express");
const session = require("express-session");
const router = express.Router();
const functions = require("../Functions.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

router.use(express.json());
router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Secure cookies in production
    sameSite: "none", // Important for cross-site cookies
  }
}));

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/"); // Use the /tmp/ folder for cloud environments
  },
  filename: function (req, file, cb) {
    const uniquename = Date.now().toString();
    const fileExt = path.extname(file.originalname);
    cb(null, uniquename + fileExt);
  }
});

const upload = multer({ storage: storage });

router.post("/createCourse", upload.single("file"), async (req, res) => {
  const user = req.session.user;
  console.log("Session user info in create course:", req.session.user);
  
  // Check if user is logged in
  if (user.id === "") {
    console.log({ message: "Please login first!" });
    return res.json({ message: "Please login first!" });
  }

  const CourseName = req.body.name;
  const file = req.file;
  const userId = user.id;

  // Check if course name and file are provided
  if (!CourseName || !file) {
    console.log("The course name and file can't be empty!");
    return res.status(400).json({ message: "The course name and file can't be empty!" });
  }

  try {
    // Create the course
    const course = await functions.createCourses(CourseName, userId);
    if (!course) {
      console.log("Something went wrong during course creation!");
      return res.status(500).send("Something went wrong!");
    }

    console.log("Course ID:", course);

    // Upload file to Dropbox
    const filePath = path.join("/tmp/", file.filename);
    await functions.uploadfiledpx(course, file);

    // Cleanup: Remove the uploaded file from /tmp after upload
    fs.unlinkSync(filePath);  // Remove the temporary file after upload

    console.log("Course created successfully with name:", CourseName);
    return res.status(200).send(`Course created successfully with name: ${CourseName}`);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("An error occurred while creating the course.");
  }
});

module.exports = router;
