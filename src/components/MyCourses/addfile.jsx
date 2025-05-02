import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';

const UploadCourseFile = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const courseId = location.state?.courseId;
  const courseName = location.state?.courseName;

  const handleUpload = async () => {
    if (!uploadedFile || !courseId) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("course_id", courseId);

    try {
      await axios.post(
        `http://localhost:5000/upload/${courseId}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      setError('Upload failed. Please try again.');
    } finally {
      navigate("/FilesInCourses", { state: { course: courseId  , courseName : courseName} });
      setIsUploading(false);
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
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
          Upload Course Material
        </h1>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className={`relative p-8 border-4 border-dashed rounded-2xl transition-all
            ${isDragging ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-indigo-200'}
            ${error ? 'border-red-500 bg-red-50' : ''}
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
            onChange={(e) => {
              setUploadedFile(e.target.files[0]);
              setError('');
            }}
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className={`p-4 rounded-full ${
                uploadedFile ? 'bg-emerald-100' : 'bg-indigo-100'
              }`}
            >
              {uploadedFile ? (
                <FaCheckCircle className="w-12 h-12 text-emerald-500" />
              ) : (
                <FaCloudUploadAlt className="w-12 h-12 text-indigo-500" />
              )}
            </motion.div>
            
            <div className="text-center space-y-2">
              <p className={`text-sm font-medium ${
                uploadedFile ? 'text-emerald-600' : 'text-gray-600'
              }`}>
                {uploadedFile ? uploadedFile.name : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-gray-400">
                {uploadedFile ? 'File ready for upload' : 'or click to browse (Max 100MB)'}
              </p>
            </div>
          </label>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!uploadedFile || isUploading}
          onClick={handleUpload}
          className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
            hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <FaCloudUploadAlt className="w-5 h-5" />
              Upload File
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UploadCourseFile;