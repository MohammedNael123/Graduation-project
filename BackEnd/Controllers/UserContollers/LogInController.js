const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(express.json());


router.post("/log_in", async (req, res) => {
  const { email , password } = req.body;

  if (!email || !password) {
    console.error("email or password is incorrect!");
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!data.user) {
      console.error("Unexpected error: No user data returned.",data.message);
      return res.status(500).json({ message: "Unexpected error: No user data returned." });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError.message);
      return res.status(500).json({ message: "Failed to fetch user profile." });
    }

    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      name: profile.full_name,
    };

    return res.json({
      message: "Login successful!",
      user: {
        email: data.user.email,
        full_name: profile.full_name,
      },
      success: true,
    });

  } catch (error) {
    console.error("Something went wrong:", error.message);
    return res.status(500).json({ message: "Something went wrong!", error: error.message });
  }
});



module.exports = router;