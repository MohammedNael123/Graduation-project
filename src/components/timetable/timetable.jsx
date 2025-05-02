import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFile, FaRegFilePdf, FaDownload } from "react-icons/fa";

const Timetable = () => {
  const location = useLocation();
  const courseId = location.state?.courseId;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !startDate || !startTime || !endDate || !endTime) {
      setError('Please fill all fields');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      const response = await fetch('https://graduation-project-c7pi.onrender.com/api/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileUrl: selectedFile,
          DateOfStart: startDate,
          TimeOfStart: startTime,
          DateOfEnd: endDate,
          TimeOfEnd: endTime
        }),
      });

      if (!response.ok) throw new Error('Failed to generate timetable');
      
      const data = await response.text();
      setHtmlCode(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const getFiles = async () => {
      try {
        const res = await axios.get(`https://graduation-project-c7pi.onrender.com/getfiles?course=${courseId}`, {
          withCredentials: true,
        });
        const processedFiles = res.data.map(file => ({
          ...file,
          filename: file.url.split('/').pop().split('?')[0],
        }));
        setFiles(processedFiles);
      } catch (err) {
        setError("Failed to fetch files. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) getFiles();
  }, [courseId]);

  const createPreviewUrl = () => {
    if (!htmlCode) return '';
    const blob = new Blob([htmlCode], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            AI Timetable Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Create smart study schedules with AI-powered planning
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {files.map((file) => (
              <motion.label 
                key={file.id}
                whileHover={{ scale: 1.02 }}
                className={`flex-shrink-0 m-4 p-6 bg-white rounded-xl shadow-lg border-2 cursor-pointer transition-all
                  ${selectedFile === file.url 
                    ? 'border-indigo-500 bg-indigo-50 scale-105'
                    : 'border-gray-200 hover:border-indigo-300'}`}
                style={{ minWidth: '250px' }}
              >
                <input
                  type="radio"
                  name="file-selector"
                  value={file.url}
                  checked={selectedFile === file.url}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="hidden"
                />
                
                <div className="relative">
                  <div className={`absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center
                    ${selectedFile === file.url ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="relative mb-4 text-indigo-600">
                      <FaFile className="text-5xl" />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-1 right-1 text-red-500 bg-white rounded-full p-1 hover:text-red-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaRegFilePdf className="text-xl" />
                      </a>
                    </div>

                    <div className="text-center">
                      <p className={`font-medium text-sm line-clamp-2 ${
                        selectedFile === file.url ? 'text-indigo-700' : 'text-gray-700'
                      }`}>
                        {file.filename}
                      </p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {Math.round(Math.random() * 5 + 1)} MB
                      </span>
                    </div>
                  </div>
                </div>
              </motion.label>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {['startDate', 'startTime', 'endDate', 'endTime'].map((field, idx) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {['Start Date', 'Start Time', 'End Date', 'End Time'][idx]}
                </label>
                <input
                  type={field.includes('Date') ? 'date' : 'time'}
                  value={eval(field)}
                  onChange={(e) => eval(`set${field.charAt(0).toUpperCase() + field.slice(1)}(e.target.value)`)}
                  className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  disabled={isUploading}
                />
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
              hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isUploading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                Generating Schedule...
              </div>
            ) : 'Generate Smart Timetable'}
          </motion.button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-100 text-red-700 rounded-xl border border-red-200 text-sm"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {htmlCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Generated Timetable</h3>
              <iframe 
                src={createPreviewUrl()}
                className="w-full h-96 border-2 border-indigo-200 rounded-xl bg-white"
                title="Generated Timetable"
              />
              <motion.a
                whileHover={{ scale: 1.05 }}
                href={createPreviewUrl()}
                download="timetable.html"
                className="mt-4 inline-flex items-center justify-center px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Download Timetable
              </motion.a>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-4 text-center">
          {[
            { 
              icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
              title: 'AI-Powered Accuracy',
              text: 'Smart conversion using latest AI models'
            },
            {
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
              title: 'Secure Processing',
              text: 'Automatic file deletion after conversion'
            },
            {
              icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              title: 'Lightning Fast',
              text: 'Process files in seconds'
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-4 bg-indigo-50 rounded-xl border border-indigo-200"
            >
              <svg className="w-6 h-6 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
              </svg>
              <h3 className="mt-2 font-medium text-indigo-700">{feature.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Timetable;