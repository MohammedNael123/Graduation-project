const express = require("express");
const cors = require('cors');
const session = require("express-session");
const sign_up = require("./Controllers/SignUpController");
const log_in = require("../BackEnd/Controllers/LogInController");
const User = require("../BackEnd/Controllers/UserController");
const logout = require("../BackEnd/Controllers/LogOutController");
const createCourese = require("../BackEnd/Controllers/createCourse");
const Dashboard = require("../BackEnd/Controllers/DashboardController");
const functions = require("../BackEnd/Functions");
const genQuiz = require('./Controllers/AiTools/Generate-quiz.js');
const genTimeTable = require('./Controllers/AiTools/Generate-TimeTable.js');
const deleteCourse = require('./Controllers/DeleteCourse.js');
const testme = require('./Controllers/AiTools/testMe.js');
const fileUpload = require('./Controllers/FileUploader.js');

const app = express();

app.use(session({
  secret:"my secret",
  resave: false,
  saveUninitialized:true,
  cookie: {
    secure: false,
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
app.use("/" , fileUpload);
app.use("/" , Dashboard);
app.use("/" , genQuiz);
app.use("/" , genTimeTable);
app.use("/" , deleteCourse);
app.use("/" , testme);



const Port = 5000;
app.listen(Port, () => {
    console.log(`Server is running on http://localhost:${Port}`);
  });
  