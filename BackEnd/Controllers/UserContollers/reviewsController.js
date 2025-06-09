const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function requireAuth(req, res, next) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized: user not logged in" });
  }
  next();
}

router.post("/create_review", requireAuth, async (req, res) => {
  const userId = req.session.user.id;
  const { description, rating } = req.body;

  if (!description || !rating) {
    return res.status(400).json({ error: "Description and rating are required." });
  }

  try {
    const { error } = await supabase
      .from("Users_FeedBack")
      .insert([
        {
          description,
          rating,
          UserId: userId,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to submit review." });
    }

    return res.status(200).json({ success: true, message: "Review submitted successfully." });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
