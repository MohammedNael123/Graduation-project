import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaEllipsisV, FaBookOpen, FaRegClock } from "react-icons/fa";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showOptions, setShowOptions] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const getCourses = async () => {
      try {
        const res = await axios.get("https://graduation-project-c7pi.onrender.com/getCourses", { 
          withCredentials: true 
        });
        setCourses(res.data);
      } catch (err) {
        setError("Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.post(`https://graduation-project-c7pi.onrender.com/deleteCourse/${courseId}`, null, {
          withCredentials: true
        });
      } catch (err) {
        window.location.reload();

      }
    }
  };

  const handleEdit = (courseId, courseName) => {
    navigate("/EditCourse", { 
      state: { courseId, courseName } 
    });
  };

  const handleCourseNavigation = (courseId, courseName) => {
    navigate("/filesInCourses", { 
      state: { course: courseId, courseName } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-6 relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"
          >
            My Learning Universe
          </motion.h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Organize your knowledge journey with AI-powered course management
          </p>
        </div>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex items-center justify-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full text-center py-6"
          >
            <div className="inline-flex items-center p-4 text-red-700 bg-red-100/90 backdrop-blur-sm rounded-xl shadow-sm">
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
              >
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: "white" }}
                />

                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <FaBookOpen className="w-6 h-6 text-indigo-600" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOptions(showOptions === course.id ? null : course.id);
                      }}
                      className="p-2 hover:bg-gray-100/50 rounded-lg text-gray-600"
                    >
                      <FaEllipsisV className="w-5 h-5" />
                    </button>
                  </div>

                  {showOptions === course.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-14 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 min-w-[160px] z-30"
                    >
                      <button 
                        onClick={() => handleEdit(course.id, course.name)}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50/50 rounded-md flex items-center gap-2"
                      >
                        <FaEdit className="text-indigo-600" />
                        Edit Course
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50/50 rounded-md flex items-center gap-2"
                      >
                        <FaTrash className="text-red-500" />
                        Delete Course
                      </button>
                    </motion.div>
                  )}

                  <div className="flex-1 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 line-clamp-3 text-sm">
                      {course.description || "Dive into comprehensive learning materials..."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleCourseNavigation(course.id, course.name)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Explore Content
                      <span className="text-lg">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
       
       {!loading ? 
           <motion.div 
           whileHover={{ scale: 1.02 }}
           className="h-full"
         >
           <Link
             to="/addCourse"
             className="group h-full flex items-center justify-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-indigo-400 relative overflow-hidden"
           >
             <div className="space-y-4 text-center p-6 w-full">
               <div className="w-14 h-14 bg-indigo-100/50 rounded-full flex items-center justify-center mx-auto transition-all group-hover:bg-indigo-200/50 group-hover:scale-110">
                 <FaPlus className="w-7 h-7 text-indigo-600 group-hover:text-indigo-700" />
               </div>
               <p className="text-lg font-semibold text-gray-700 group-hover:text-indigo-700">
                 Create New Course
               </p>
             </div>
           </Link>
         </motion.div> : <></>
      } 
       
        </div>
      </motion.div>

    </div>
  );
};

export default MyCourses;