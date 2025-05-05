const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const functions = require("../Functions");

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
  console.log("im in the upload api")
  const userId = req.session.user?.id;
  const courseId = req.params.courseId;
  const file = req.file;
  console.log("the user id  nad course id : ",userId,"\n",courseId)
  if(!userId){
    console.log("you need to login to upload a file!");
    return res.status().json({message:"you need to login to upload a file!"});
  }

    try{
      await functions.uploadfiledpx(courseId,file);
      fs.unlinkSync(file.path);
      console.log("file deleted successfuly");
      return res.status(200).json("uploaded successfuly");
    } catch(error){
      console.log("error uploading the file!");
      return res.status(500).json("error");
    }
  });

module.exports = router;