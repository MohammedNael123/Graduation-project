import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';
import NavBar from './components/Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Hero from './components/Hero/Hero';
import HowToUse from './components/HowToUse/HowToUse';
import Reviews from './components/Reviews/Reviews';
import LoginPage from './components/Auth/LoginPage';
import SignUpPage from './components/Auth/SignUpPage';
import MyCourses from './components/MyCourses/mycourses';
import FileUploadForm from './components/MyCourses/addcourse';
import QuizMaker from './components/quizMaker/quizmaker';
import Timetable from './components/timetable/timetable';
import FilesInCourses from './components/MyCourses/filesInCourse';
import Majorcheck from './components/majorcheck/majorcheck';
import Addfiletocourse from './components/MyCourses/addfile';
import EditCourses from "./components/MyCourses/EditCourses";
import Summarizer from "./components/summary/generatesummary";
import Testme from "./components/testme/testme";
import { Link } from 'react-router-dom';

function App() {
  const [auth, setAuth] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    axios.get("https://graduation-project-c7pi.onrender.com/profile", { withCredentials: true })
      .then(res => {
        if (res.data.email) {
          setAuth(true);
          setProfile({ name: res.data.name, email: res.data.email , id : res.data.id});
        } else {
          setAuth(false);
          setProfile(null);
        }
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setAuth(false);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false); 
      });
  }, []);

  if (loading) {
    return ( 
      <>
       {profile ?       
         <NavBar profile={profile} />
         : 
          <NavBar profile={""}/>
         }
    
    <div class="fixed inset-0 flex items-center justify-center bg-white z-50">
  <div class="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
</div>

      </>
    )
  }

  return (
    <Router>
      <div className="App">
        {profile ?       
         <NavBar profile={profile} />
         : 
          <NavBar profile={""}/>
         }
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Hero /><HowToUse /><Reviews /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/majorcheck" element={<Majorcheck />} />

          {/* Private Routes */}
          {auth ? (
            <>
              <Route path="/MyCourses" element={<MyCourses />} />
              <Route path="/addCourse" element={<FileUploadForm />} />
              <Route path="/QuizMaker" element={<QuizMaker />} />
              <Route path="/FilesInCourses" element={<FilesInCourses />} />
              <Route path="/Timetable" element={<Timetable />} />
              <Route path="/addFile" element={<Addfiletocourse />} />
              <Route path="/EditCourse" element={<EditCourses />} />
              <Route path="/Summarizer" element={<Summarizer />} />
              <Route path="/TestMe" element={<Testme />} />
              
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <Link to="/terms" className="text-sm hover:underline">Terms and Services</Link>
          <span className="text-sm text-gray-400">© 2025 Made by Darsni Group.</span>
        </div>
      </div>
    </Router>
  );
}

export default App;
