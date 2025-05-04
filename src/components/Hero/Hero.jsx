
import "./Hero.css"; 
import React, { useState , useEffect } from "react";
import axios from "axios"; 


const Hero = () => {

    const [auth, setAuth] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
  
  useEffect(() => {
  axios.get("http://localhost:5000/profile", { withCredentials: true })
        .then(res => {
      if (res.data.email) {
        setAuth(true);
        setProfileName(res.data.name);
        setProfileEmail(res.data.email);
      } else {
        setAuth(false);
        setProfileName("");
      }
    })
    .catch(err => {
      console.error("Error fetching profile:", err);
    });
}, []); 


  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-heading">Transform Your Study Experience with AI</h1>
        <p className="hero-subheading">Upload your PDFs and let our AI-powered platform help you study smarter, faster, and more efficiently!</p>
        
        {profileName ?

                <a href="/addCourse" className="hero-cta-button">Get Started</a>

        :
        <a href="/signup" className="hero-cta-button">Get Started</a>
      }
    
    
     </div>
    </section>
  );
};

export default Hero;
