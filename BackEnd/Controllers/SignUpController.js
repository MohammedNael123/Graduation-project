const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = "https://pzonwofrcesqorzziouz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6b253b2ZyY2VzcW9yenppb3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTk2NjYsImV4cCI6MjA1Njg5NTY2Nn0.tKa2-3yA1nl3WaSQUSoOgtXss6-UiJoVdwXsKyZBbrk";
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(express.json());

router.post("/sign_up", async (req, res) => {
    console.log("signup request : ", req.body);
    const { name, email, password } = req.body;
  
    // 1. تحقق من وجود المستخدم
    const { data: existingUser, error: userError } = await supabase
      .from("auth.users")
      .select("email")
      .eq("email", email)
      .single();
  
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User is already registered!" });
    }
  
    try {
      // 2. تسجيل المستخدم
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: null,
          }
        }
      });
  
      if (authError) {
        console.error("Auth Signup Error:", authError.message);
        return res.status(400).json({ success: false, message: authError.message });
      }
  
      return res.status(200).json({ success: true, message: "Signup successful!" });
  
    } catch (error) {
      console.log("Unexpected Error:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
  


module.exports = router;