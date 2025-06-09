const express = require("express");
const cors = require('cors');
const session = require("express-session");

// Controllers
const sign_up = require("./Controllers/UserContollers/SignUpController.js");
const log_in = require("./Controllers/UserContollers/LogInController.js");
const User = require("./Controllers/UserContollers/UserController.js");
const logout = require("./Controllers/UserContollers/LogOutController.js");
const createCourese = require("./Controllers/CoursesControllers/createCourse.js");
const CourseInfo = require("./Controllers/CoursesControllers/CourseInfo.js");
const genQuiz = require('./Controllers/AiTools/Generate-quiz.js');
const genTimeTable = require('./Controllers/AiTools/Generate-TimeTable.js');
const deletecourse = require("./Controllers/CoursesControllers/DeleteCourse.js");
const addFileToCourse = require("./Controllers/FilesControllers/FileUploadToDropbox.js");
const editCourse = require("./Controllers/CoursesControllers/editcourse.js");
const deleteFile = require("./Controllers/FilesControllers/DeleteFile.js");
const generatesummary = require("./Controllers/AiTools/summarization.js");
const testme = require("./Controllers/AiTools/testMe.js");
const majorcheck = require("./Controllers/AiTools/major check12.js");
const UserProfile = require("./Controllers/UserContollers/userprofile.js");
const AdminCont = require("./Controllers/Admin/AdminController.js");
const review = require("./Controllers/UserContollers/reviewsController.js");

// Dropbox Token Utilities
const { refreshDropboxToken } = require("./Controllers/FilesControllers/updateDPXtoken.js");
const { isTokenValid } = require("./Controllers/Utilitis/Functions.js");

const app = express();

// Trust proxy (for secure cookies in production)
app.set('trust proxy', 1);

// 🔧 CORS middleware
app.use(cors({
  origin: ["https://darisni.netlify.app", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// 🔐 Session middleware
app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,           // use HTTPS in production
    sameSite: "none"        // allow cross-site cookies
  }
}));

// Optional: simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// 🌐 Routes
app.use("/", sign_up);
app.use("/", log_in);
app.use("/", User);
app.use("/", logout);
app.use("/", createCourese);
app.use("/", CourseInfo);
app.use("/", genQuiz);
app.use("/", genTimeTable);
app.use("/", deletecourse);
app.use("/", addFileToCourse);
app.use("/", editCourse);
app.use("/", deleteFile);
app.use("/", generatesummary);
app.use("/", testme);
app.use("/", majorcheck);
app.use("/", UserProfile);
app.use("/", AdminCont);
app.use("/", review);

// ⏱ Dropbox token auto-refresh
isTokenValid();
refreshDropboxToken();
setInterval(refreshDropboxToken, 3 * 60 * 60 * 1000); // Every 3 hours

// Start server
const Port = 5000;
app.listen(Port, () => {
  console.log(`🚀 Server is running at http://localhost:${Port}`);
});
