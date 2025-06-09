const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(express.json());


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
    const { full_name } = req.body;
    if (!userId) {
      console.error("User not logged in!");
      return res.status(401).json({ message: "Not logged in!" });
    }


    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: full_name })
      .eq("id", userId);


    if (error) {
      console.error("Error editing username!", error.message);
      return res.status(500).json({ message: "Error editing username!" });
    }

    req.session.user={
      id: req.session.user?.id,
      name: full_name,
      email: req.session.user?.email,
      role: req.session.user?.role
    };
    req.session.save((err)=>{
      if(err){
      console.error("session not saved!");
      return res.status(500).json("session save failed!");
  }});
    return res.status(200).json({ message: "Profile updated successfully." });

  } catch (err) {
    console.error("Unexpected error occurred", err);
    return res.status(500).json({ message: "Internal server error!" });
  }
});


module.exports = router;
