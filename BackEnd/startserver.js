const express = require("express");
const cors = require('cors');
const session = require("express-session");
const sign_up = require("./Controllers/SignUpController");
const log_in = require("../BackEnd/Controllers/LogInController");
const User = require("../BackEnd/Controllers/UserController");
const logout = require("../BackEnd/Controllers/LogOutController");
const createCourese = require("../BackEnd/Controllers/createCourse");
const Dashboard = require("../BackEnd/Controllers/DashboardController");
const genQuiz = require('./Controllers/AiTools/Generate-quiz.js');
const genTimeTable = require('./Controllers/AiTools/Generate-TimeTable.js');
const deletecourse = require("./Controllers/DeleteCourse.js");
const addFileToCourse = require("./Controllers/FileUploadToDropbox.js");
const editCourse = require("./Controllers/editcourse.js")
const generatesummary = require("./Controllers/AiTools/summarization.js");
const testme = require("./Controllers/AiTools/testMe.js");
const majorcheck = require("./Controllers/AiTools/major check12.js");

const app = express();
//app.use(cookieParser());

app.set('trust proxy', 1); // مهم جدًا عند النشر على Render

app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,            // لازم يكون true لأنك تستخدم HTTPS
    sameSite: "none"         // مهم للسماح بالكوكيز عبر نطاقين مختلفين (cross-site)
  }
}));


app.use(cors({
  origin:["https://darisni.netlify.app"],
  methods:["POST","GET"],
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
app.use("/" , Dashboard);
app.use("/" , genQuiz);
app.use("/" , genTimeTable);
app.use("/" , deletecourse);
app.use("/" , addFileToCourse);
app.use("/" , editCourse);
app.use("/" , generatesummary);
app.use("/" , testme);
app.use("/" , majorcheck);



const Port = 5000;
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
  });
  