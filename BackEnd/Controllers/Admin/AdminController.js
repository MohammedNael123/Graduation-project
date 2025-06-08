const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.get("/counts", async (req, res) => {
  try {
    const { count: usersCount, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) throw usersError;

    const { count: coursesCount, error: coursesError } = await supabase
      .from("UserCourses")
      .select("*", { count: "exact", head: true });

    if (coursesError) throw coursesError;

    const { count: ReviewCount, error: ReviewError } = await supabase
      .from("Users_FeedBack")
      .select("*", { count: "exact", head: true });

    if (ReviewError) throw ReviewError;

    res.json({
      usersCount,
      coursesCount,
      ReviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching counts", error: error.message });
  }
});

module.exports = router;
