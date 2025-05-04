const express = require("express");
const Dropbox = require("dropbox");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const functions = require("./Functions");
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const dpx_token = process.env.DPX_TOKEN;


const dpx = new Dropbox.Dropbox({accessToken: dpx_token,
  fetch:fetch
});



const app = express();
app.use(express.json());

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


app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("im in the upload api")
  const userId = "5a9d55d0-2c2d-4319-9609-f7584991af18" /*req.session.user?.id*/;
  if(!userId){
    console.log("you need to login to upload a file!");
    return res.status().json({message:"you need to login to upload a file!"});
  }

    try {
      
      await functions.createCourses()
   
      console.log("Uploaded file details:", req.file);
      // read file content and upload
      fs.readFile(req.file.path, async (err, fileContent) => {
        if (err) {
          console.error("Error reading file:", err);
          return res.status(500).json({ error: "Error reading file" });
        }

        try {
          console.log("in the second try upload!")
          await functions.uploadfiledpx("e0c4dee5-059d-4982-a837-75057041d12d",req.file);
          res.status(200).json({ message: "File uploaded successfully!" });
        } catch (error) {
          res.status(500).json({ error: "Failed to upload to Dropbox" });
        }
      });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

const port = 5000;
app.listen(port,()=>{
    console.log(`server is listening on port : ${port}`);
});