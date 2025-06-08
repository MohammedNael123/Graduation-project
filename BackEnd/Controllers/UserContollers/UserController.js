const express = require("express");
// const session = require("express-session");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { decode } = require("punycode");
const router = express.Router();
// const { createClient } = require("@supabase/supabase-js");
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);
// const functions = require("../Functions.js");


router.use(express.json());
// router.use(session({
//   secret: "my secret",
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }));

router.get("/profile", async (req, res) => {
  if (!req.session.user) {
    console.error("User Not Logged in!");
    return res.json({ message: "NOT logged in!" });
  }
  return res.json({
    email: req.session.user.email,
    name: req.session.user.name,
    role : req.session.user.name
  });

});

module.exports = router;