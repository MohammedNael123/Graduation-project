import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { FaFile, FaRegFilePdf } from "react-icons/fa";

export default function DocumentSummarizer() {
  const location = useLocation();
  const courseId = location.state?.courseId;
  const [lang, setLang] = useState('ar');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('https://graduation-project-c7pi.onrender.com/api/generate-summarization', {
        fileUrl: selectedFile,
        lang
      });
      
      setSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate summary');
    } finally {
      setLoading(false);
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
      }
    };

    if (courseId) getFiles();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8"
      >
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Smart Document Summarizer
          </h1>
          <p className="text-gray-600 text-lg">
            Transform lengthy documents into concise, structured summaries
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Document</h3>
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
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Summary Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-white"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
                hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                  Generating Summary...
                </div>
              ) : 'Generate Summary'}
            </motion.button>
          </div>
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

        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 prose max-w-none"
          >
            <div dangerouslySetInnerHTML={{ __html: summary }} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}