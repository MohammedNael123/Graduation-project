const express = require("express");
const Dropbox = require("dropbox");
const fs = require("fs-extra");
const multer = require("multer");
const path = require("path");
const functions = require("../Functions");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const dpx = new Dropbox.Dropbox({ accessToken: process.env.DPX_TOKEN, fetch: fetch });

const TMP_DIR = "/tmp";
fs.ensureDirSync(TMP_DIR); // Ensure /tmp exists

const router = express();
router.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TMP_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now().toString();
    const fileExt = path.extname(file.originalname);
    cb(null, uniqueName + fileExt);
  }
});

const upload = multer({ storage });

router.post("/upload/:courseId", upload.single("file"), async (req, res) => {
  console.log("In the upload API");
  const userId = req.session.user?.id;
  const courseId = req.params.courseId;
  const file = req.file;

  if (!userId) {
    return res.status(401).json({ message: "You need to login to upload a file!" });
  }

  try {
    const File = await functions.uploadfiledpx(courseId, file);
    if(File){
    // Update Supabase timestamp
    const { error } = await supabase
      .from('UserCourses')
      .update({ updated_at: new Date() })
      .eq('id', courseId);
    if (error) throw error;
    }
    else return 0;

    // Optional: delete temp file after upload
    await fs.remove(file.path);
    console.log("Temp file deleted:", file.path);
    
    return res.status(200).json({ message: "File uploaded successfully." , result:1});

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "File upload failed",
      details: error.message
    });
  }
});

module.exports = router;