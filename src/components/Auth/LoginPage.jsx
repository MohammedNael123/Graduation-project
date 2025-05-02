
import axios from 'axios';
import React, { useState , useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

import './auth.css';

const LogInPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userCourses , setCourses] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    const getCourses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/getCourses", { withCredentials: true });
        setCourses(res.data);

      } catch (err) {
        console.log("failed to fetch courses")
      }
    };

    getCourses();
  }, []);


  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
  
    try {
      console.log("Attempting login...");
  
      const res = await axios.post("http://localhost:5000/log_in", formData, {
        headers: { "Content-Type": "application/json" },
      });
  
      if (res.data.success) {
        setMessage("Login successful!");
        console.log("User logged in:", res.data);
  
        // نحفظ بيانات المستخدم
        localStorage.setItem("user", JSON.stringify(res.data.user));
  
        // نسحب الكورسات بعد تسجيل الدخول
        const coursesRes = await axios.get("http://localhost:5000/getCourses", {
          withCredentials: true
        });
  
        const courses = coursesRes.data;
        if (courses.length > 0) {
          window.location.href = '/mycourses';
        } else {
          window.location.href = '/addCourse';
        }
  
      } else {
        setMessage(res.data.message || "Login failed! Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage(error.response?.data?.message || "Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6
          transition-all duration-300 hover:shadow-2xl">
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-500">Sign in to continue to your account</p>
          </div>
  
          {message && (
            <div className={`p-4 rounded-xl ${message.includes('failed') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-emerald-50 text-emerald-700'}`}>
              {message}
            </div>
          )}
  
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <FiMail className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-gray-200 rounded-xl
                    focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
  
              <div className="relative">
                <FiLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-gray-200 rounded-xl
                    focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
  
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
                text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Continue
                  <FiArrowRight className="text-xl" />
                </>
              )}
            </button>
          </form>
  
  
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    );
};

export default LogInPage;
