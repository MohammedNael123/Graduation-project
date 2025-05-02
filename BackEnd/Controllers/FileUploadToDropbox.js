const express = require("express");
const Dropbox = require("dropbox");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const functions = require("../Functions");
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const dpx_token = process.env.DPX_TOKEN;


const dpx = new Dropbox.Dropbox({accessToken: dpx_token,
  fetch:fetch
});



const router = express();
router.use(express.json());

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,"uploads/");
    },
    filename : function (req,file,cb){
        const uniquename = Date.now().toString();
        const fileExt = path.extname(file.originalname);
        cb(null,uniquename+fileExt);
    }
})

const upload = multer({storage: storage});


router.post("/upload/:courseId", upload.single("file"), async (req, res) => {
  console.log("im in the upload api");
  const userId = req.session.user?.id;
  const courseId = req.params.courseId;
  const file = req.file;

  if (!userId) {
    console.log("you need to login to upload a file!");
    return res.status(401).json({ message: "You need to login to upload a file!" });
  }

  try {
    await functions.uploadfiledpx(courseId, file);
    
    // Add database update
    const { error } = await supabase
      .from('courses')
      .update({ updated_at: new Date() })
      .eq('id', courseId);

    if (error) throw error;

    console.log("File Uploaded successfully.");
    return res.status(200).json();
    
  } catch (error) {
    console.error("Error uploading the file:", error);
    return res.status(500).json({ 
      error: "File upload failed",
      details: error.message 
    });
  }
});
module.exports = router;