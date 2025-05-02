const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { decode } = require("punycode");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const functions = require("../Functions.js");


router.use(express.json());
router.use(session({
  secret:"my secret",
  resave: false,
  saveUninitialized:true,
  cookie:{secure:false}
}));

// const verifyUser = (req, res, next) => {
//      // Getting token from cookies
  
//     if (!token) {
//       console.log("token : " + token);  // Should print undefined if token is not present
//       return res.status(401).json({ Error: "No token provided." });
//     }
  
//     jwt.verify(token, "jwt-secret-key", (err, decoded) => {
//       if (err) {
//         console.log("Error verifying token: ", err);
//         return res.status(401).json({ Error: "Invalid or expired token." });
//       } else {
//         req.name = decoded.name;
//         req.id = decoded.id;
//         next();
//       }
//     });
//   };
  
  router.get("/profile", async (req, res) => {
    //console.log("the user in profiles api is : ",req.session.user)
    if (!req.session.user) {
        console.log("Not Logged in!");
        return res.json({ message: "NOT logged in!" });
    }
    /*console.log("The user is:", req.session.user);
    console.log("the name : ",req.session.user.name)*/
    return res.json({
      email : req.session.user.email,
      name : req.session.user.name,
      id : req.session.user.id
    });
  
  });

  
  
  
  // Sample route protected by the verifyUser middleware
  // router.get("/", verifyUser, (req, res) => {
  //   return res.json({ Status: "Success", name: req.name });
  // });
  
  // Middleware setup
  // router.use(cookieParser());

module.exports = router ;