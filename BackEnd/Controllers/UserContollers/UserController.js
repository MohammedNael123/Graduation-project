const express = require("express");
// const session = require("express-session");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


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
    role: req.session.user.role,
  });

});

router.post("/update-profile", async (req, res) => {
  try {
    const userId = req.session.user?.id;
    const { newName } = req.body;
    if (!userId) {
      console.error("User Not Logged in!");
      return res.json({ message: "NOT logged in!" });
    }
    const { data, error } = supabase
      .from("profiles")
      .update({ full_name: newName })
      .eq("id", userId);

    if (error) {
      console.error("Error Editing username!");
      return res.status(500).json({ message: "Error Editing username!" });
    }
  } catch (err) {
    console.error("Unexpected Error Occurred");
    return res.status(500).json({ message: "Internal Server Error!" });
  }

});


module.exports = router;