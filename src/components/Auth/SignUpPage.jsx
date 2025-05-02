// SignUpPage.jsx
import axios from "axios";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const SignUpPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/sign_up", formData);
      setMessage(res.data.message);
      window.location.href = '/login';

    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6
        transition-all duration-300 hover:shadow-2xl">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Get Started
          </h1>
          <p className="text-gray-500">Create your account to continue</p>
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
              <FiUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                name="name"
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-gray-200 rounded-xl
                  focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

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

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" id="terms" required 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="terms">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and 
              {' '}<a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700
              text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Create Account
                <FiArrowRight className="text-xl" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;