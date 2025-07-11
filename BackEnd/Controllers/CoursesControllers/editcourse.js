const express = require("express");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const cors = require('cors');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const router = express.Router();

router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

router.use(cors({
  origin: ["https://darisni.netlify.app", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

router.post("/EditCourseName", async (req, res) => {
  const userId = req.session.user?.id;
  const { courseId, newName } = req.body;

  if (!userId || !courseId || !newName) {
    return res.status(400).json({ error: "Missing data." });
  }

  const { error } = await supabase
    .from("UserCourses")
    .update({ name: newName })
    .eq("id", courseId);

  if (error) {
    return res.status(500).json("error while updating the name try again later");
  }

  return res.status(200).json("updated");
});

module.exports = router;
