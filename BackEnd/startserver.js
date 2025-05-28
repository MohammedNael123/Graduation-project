const express = require("express");
const cors = require('cors');
const session = require("express-session");
const sign_up = require("./Controllers/UserContollers/SignUpController");
const log_in = require("./Controllers/UserContollers/LogInController");
const User = require("./Controllers/UserContollers/UserController");
const logout = require("./Controllers/UserContollers/LogOutController");
const createCourese = require("./Controllers/CoursesControllers/createCourse");
//const Dashboard = require("../BackEnd/Controllers/CoursesControllers/");
const genQuiz = require('./Controllers/AiTools/Generate-quiz.js');
const genTimeTable = require('./Controllers/AiTools/Generate-TimeTable.js');
const deletecourse = require("./Controllers/CoursesControllers/DeleteCourse.js");
const addFileToCourse = require("./Controllers/FilesControllers/FileUploadToDropbox.js");
const editCourse = require("./Controllers/CoursesControllers/editcourse.js")
const generatesummary = require("./Controllers/AiTools/summarization.js");
const testme = require("./Controllers/AiTools/testMe.js");
const majorcheck = require("./Controllers/AiTools/major check12.js");
const UserProfile = require("./Controllers/UserContollers/userprofile.js");

//For Dropbox Refresh Token 
const { refreshDropboxToken } = require("./Controllers/FilesControllers/updateDPXtoken.js");
const { isTokenValid } = require("./Controllers/Utilitis/Functions.js")

isTokenValid();
refreshDropboxToken();
isTokenValid();

setInterval(refreshDropboxToken, 3 * 60 * 60 * 1000);

const app = express();

app.set('trust proxy', 1); 

app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,            
    sameSite: "none"         
  }
}));


app.use(cors({
  origin: ["https://darisni.netlify.app", "http://localhost:3000"],
  methods: ["POST", "GET"],
  credentials: true
}));

app.use((req,res,next)=>{
  if(!req.session.user){
    req.session.user ={
      id: "",
      email: "",
      name: "",
    } 
    console.log('Session initialized with default values');
  }
  next();
});

app.use("/" , sign_up);
app.use("/" , log_in);
app.use("/" , User);
app.use("/" , logout);
app.use("/" , createCourese);
//app.use("/" , Dashboard);
app.use("/" , genQuiz);
app.use("/" , genTimeTable);
app.use("/" , deletecourse);
app.use("/" , addFileToCourse);
app.use("/" , editCourse);
app.use("/" , generatesummary);
app.use("/" , testme);
app.use("/" , majorcheck);
app.use("/" , UserProfile);



const Port = 5000;
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
  });
  
