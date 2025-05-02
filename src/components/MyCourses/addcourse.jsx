import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaPlus, FaSpinner } from 'react-icons/fa';

const CourseForm = () => {
  const [courseName, setCourseName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!courseName || !uploadedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("name", courseName);
    formData.append("file", uploadedFile);

    try {
      const response = await fetch("https://graduation-project-c7pi.onrender.com/createCourse", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error('Upload failed');
      
      await response.json();
    } catch (err) {
      console.error("Error creating course:", err);
    } finally {
      setLoading(false);
      navigate("/mycourses");
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center p-4 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl"
      >
        <div className="space-y-8">
          <div className="text-center">
            <motion.h1 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2"
            >
              Create New Course
            </motion.h1>
            <p className="text-gray-600">Build your knowledge hub with AI-powered learning tools</p>
          </div>

          <div>
            <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-3">
              Course Name
            </label>
            <input
              type="text"
              id="course-name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400 text-gray-700"
              placeholder="e.g., Advanced React Development"
            />
          </div>

          <motion.div 
            whileHover={{ scale: 1.01 }}
            className={`relative p-10 border-4 border-dashed rounded-xl group transition-all duration-200
              ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'}
              ${uploadedFile ? 'border-emerald-500 bg-emerald-50' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="hidden"
              id="file-upload"
              onChange={(e) => setUploadedFile(e.target.files[0])}
              accept=".pdf,.docx,.pptx"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 rounded-full transition-all duration-200 
                  ${uploadedFile ? 'bg-emerald-100' : 'bg-indigo-100'}`}
              >
                <FaCloudUploadAlt 
                  className={`w-12 h-12 ${uploadedFile ? 'text-emerald-500' : 'text-indigo-500'}`} 
                />
              </motion.div>
              <div className="text-center space-y-2">
                <p className={`text-lg font-medium ${uploadedFile ? 'text-emerald-600' : 'text-gray-600'}`}>
                  {uploadedFile ? (
                    <>
                      <span className="font-semibold">{uploadedFile.name}</span>
                      <br />
                      <span className="text-sm">Click to change file</span>
                    </>
                  ) : (
                    <>
                      Drag & drop files or <span className="text-indigo-600">browse</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOCX, PPTX (Max 50MB)
                </p>
              </div>
            </label>
          </motion.div>

          <motion.button
            disabled={!courseName || !uploadedFile || loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
            onClick={handleUpload}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin h-6 w-6 text-white" />
                <span>Creating Course...</span>
              </>
            ) : (
              <>
                <FaPlus className="w-6 h-6 text-white" />
                <span>Create Course</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

    </div>
  );
};

export default CourseForm;