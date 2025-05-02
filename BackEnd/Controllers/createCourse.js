const express = require("express");
const session = require("express-session");
const router = express.Router();
const functions = require("../Functions.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const TMP_DIR = process.env.TMP_DIR || "/tmp/";
fs.ensureDirSync(TMP_DIR);

router.use(express.json());
router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  }
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => {
    const uniquename = Date.now().toString() + path.extname(file.originalname);
    cb(null, uniquename);
  }
});

const upload = multer({ storage });

router.post("/createCourse", upload.single("file"), async (req, res) => {
  const user = req.session.user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "Please login first!" });
  }

  const CourseName = req.body.name;
  const file = req.file;
  if (!CourseName || !file) {
    return res.status(400).json({ message: "The course name and file can't be empty!" });
  }

  try {
    const course = await functions.createCourses(CourseName, user.id);
    if (!course) {
      return res.status(500).send("Something went wrong!");
    }

    const filePath = path.join(TMP_DIR, file.filename);
    await functions.uploadfiledpx(course, file);

    // Delete the temp file after uploading
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    return res.status(200).send(`Course created successfully with name: ${CourseName}`);
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(500).send("An error occurred while creating the course.");
  }
});

module.exports = router;
