const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const bcrypt = require("bcrypt");

router.use(express.json());

router.post("/sign_up", async (req,res)=>{
  console.log("signup request : ",req.body);
  const {name,email,password} = req.body;
  const {data:existingUser,error:userError} = await supabase
  .from("auth.users")
  .select("email")
  .eq("email",email)
  .single();

  if(existingUser){
    return res.json({message:"user is already registered!"});
  }
  
  try {
    const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    });

    if (authError) {
        console.error("Auth Signup Error:", authError.message);
        return res.json({ message: authError.message });
    }

    res.json({message: "Signup successful!"});

} catch (error) {
    console.log("Unexpected Error:", error);
    res.json({ message: "Internal Server Error" });
}
});



module.exports = router;