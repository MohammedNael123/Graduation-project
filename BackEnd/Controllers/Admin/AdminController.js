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


router.get("/get_users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({ message: "Error fetching users." });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});


router.post("/deleteUser/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: `User ${userId} deleted` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/updateUser/:id", async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, role } = req.body;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, email, role })
      .eq("id", userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: `User ${userId} updated` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/get_courses", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("joined_courses_with_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching courses with users:", error.message);
      return res.status(500).json({ message: "Error fetching courses." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});


module.exports = router;
