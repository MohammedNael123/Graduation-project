const express = require("express");
const session = require("express-session");
const {createClient} = require("@supabase/supabase-js");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const router = express.Router();

router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

router.post("/EditCourseName", async (req, res) => {
    const userId = req.session.user?.id;
    const { courseId, newName } = req.body;
  
    if (!userId || !courseId || !newName) {
      return res.status(400).json({ error: "Missing data." });
    }
  
    const { error: errorWhileEditing } = await supabase
      .from("courses")
      .update({ name: newName })
      .eq("id", courseId);
  
    if (errorWhileEditing) {
      return res.status(500).json("error while updating the name try again later");
    } else {
      return res.status(200).json("updated");
    }
  });
  
  

module.exports = router;