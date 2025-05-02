const express = require("express");
const session = require("express-session");
const router = express.Router();
const functions = require("../Functions.js");
const multer = require("multer");
const path = require("path");

router.use(express.json());
router.use(session({
  secret:"my secret",
  resave: false,
  saveUninitialized:true,
  cookie:{secure:false}
}));

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

router.post("/createCourse",upload.single("file"), async (req, res)=>{
      const user = req.session.user;
      console.log("the session in create course user info : ", req.session.user)
      if(user.id===""){
          console.log({message:"please login first!"});
          return res.json({message:"please login first!"});
      }
       const CourseName = req.body.name;
       const file = req.file;
      const userId = user.id;
      console.log("tha info from addpage : ",CourseName,userId)
      if(!CourseName && !file){
          res.send("the course name and file cant be Empty!");
          console.log("the course name and file cant be Empty!");
      }
        const course = await functions.createCourses(CourseName,userId);
        if(!course){
            console.log("somthing went wrong!");
            return res.status(500).send("somthing went wrong!");
        }
        console.log("the course id : ",course);
        await functions.uploadfiledpx(course,file);
        console.log("Course created successfuly it name : ",CourseName);
        return res.status(200).send(`Course created successfuly it name : ${CourseName}`);      
  });

module.exports = router;