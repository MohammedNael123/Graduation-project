const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(express.json());


// router.post("/log_in", async (req, res) => {
//   console.log("login request : ", req.body);
//   const { email, password } = req.body;
//   const { data: existingUser, error: userError } = await supabase
//     .from("profiles")
//     .select("email")
//     .eq("email", email)
//     .single();

//   if (!existingUser) {
//     return res.json({ message: "user is not registered!" });
//   }

//   if (!email || !password) {
//     return res.json({ message: "Email and password are required." });
//   }
//   try {

//     // 2️⃣ Attempt to log in using Supabase Auth
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     console.log("the user id : ",data.user.id);
//     if (error) {
//       // If login fails, return an appropriate message
//       if (error.message == "Invalid login credentials") {
//         console.log("eroor:" + error.message);
//         return res.json({ message: "Invalid email or password." });
//       }
//       return res.json({ message: "Email not found. Please register." });
//     }

//     const { data: getEmail, error: getEmailError } = await supabase
//       .from("profiles")
//       .select("email")
//       .eq("id", data.user.id)
//       .single();
//     console.log("email : ",getEmail.email);
//       const { data: getName, error: getNameError } = await supabase
//       .from("profiles")
//       .select("full_name")
//       .eq("id", data.user.id)
//       .single();
//     console.log("full_name : ",getName.full_name);
//     if (getEmailError || getNameError) {
//       console.error("Error fetching profile data: ",(getNameError.message || getEmailError.message));
//       return res.json({ message: "failed to fetch user profile." });
//     }

//     console.log("in the login api the user cerds is : ",getEmail.email);
//     req.session.user ={
//       id: data.user.id,
//       email: getEmail.email,
//       name: getName.full_name,
//     } 
//     req.session.save();
//     console.log("lgoin api session info : ",req.session.user);

//     console.log("name of the testing supabase is : " + getName.full_name);
//     return res.json({
//       message: "Login successful!",
//       user: {
        
//         email: getEmail.email,
        
//         full_name: getName.full_name,
//       },
//       success: true,
      
//     });
//   } catch (error) {
//     console.log("somthing went wrong : ",error.message);
//     return res.json({ message: "Something went wrong!", error: error.message });
//   }
// });

router.post("/log_in", async (req, res) => {
  console.log("Login request:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
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
      return res.status(500).json({ message: "Unexpected error: No user data returned." });
    }

    console.log("User logged in:", data.user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError.message);
      return res.status(500).json({ message: "Failed to fetch user profile." });
    }

    console.log("User full name:", profile.full_name);

    req.session.user = {
      id: data.user.id,
      email: data.user.email,
      name: profile.full_name,
    };

    console.log("Session info:", req.session.user);

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
