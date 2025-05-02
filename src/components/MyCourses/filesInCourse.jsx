import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaFileAlt, FaQuestionCircle, FaCalendarAlt, FaBrain, 
  FaPlus, FaFileWord, FaFilePowerpoint, FaFileImage,
  FaFileCode, FaFileArchive, FaFileAudio, FaFileVideo,
  FaFileCsv, FaFileContract, FaFileDownload, FaClock
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Test = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const courseId = location.state?.course;
    const courseName = location.state?.courseName;
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFiles = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/getfiles?course=${courseId}`, {
                    withCredentials: true,
                });
                const processedFiles = res.data.map(file => ({
                    ...file,
                    filename: file.url.split('/').pop().split('?')[0],
                    uploadedAt: new Date().toLocaleDateString() // Add actual upload date from API if available
                }));
                setFiles(processedFiles);
            } catch (err) {
                setError("Failed to fetch files. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            getFiles();
        }
    }, [courseId]);

    const handleNavigation = (path, state) => (e) => {
        e.preventDefault();
        navigate(path, { state });
    };

    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        const iconClass = "w-6 h-6 flex-shrink-0";
        
        const icons = {
            pdf: <FaFileAlt className={`${iconClass} text-red-500`} />,
            docx: <FaFileWord className={`${iconClass} text-blue-500`} />,
            pptx: <FaFilePowerpoint className={`${iconClass} text-orange-500`} />,
            default: <FaFileAlt className={`${iconClass} text-indigo-500`} />
        };

        return icons[extension] || icons.default;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 animate-bounce"></div>
                <p className="text-gray-600 font-medium">Loading course materials...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <div className="bg-red-50 p-6 rounded-2xl text-center max-w-md">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h2 className="text-red-700 font-semibold text-lg mb-3">Oops! Something went wrong</h2>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-6">
            <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNavigation("/addFile", { courseId })}
                className="fixed bottom-8 right-8 z-10 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
                <FaPlus className="text-xl" />
                <span className="sr-only">Upload File</span>
            </motion.button>

            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-8 text-white shadow-xl"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div className="mb-4 md:mb-0">
                            <nav className="flex mb-3 text-indigo-100">
                                <Link 
                                    to="/mycourses" 
                                    className="hover:text-white transition-colors flex items-center gap-2"
                                >
                                    ← Back to Courses
                                </Link>
                            </nav>
                            <h1 className="text-4xl font-bold mb-2">{courseName}</h1>
                            <p className="text-indigo-100/90 flex items-center gap-2">
                                <FaClock className="inline" /> {files.length} resources available
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNavigation("/addFile", { courseId , courseName })}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
                            >
                                <FaPlus />
                                Upload New File
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* AI Tools Section */}
                <section className="mb-14">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Smart Learning Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <AIToolCard 
                            icon="🧠"
                            title="AI Quiz Master"
                            description="Generate practice tests from your materials"
                            onClick={handleNavigation("/QuizMaker", { courseId })}
                            color="from-purple-100 to-purple-50"
                        />
                        <AIToolCard 
                            icon="⏳"
                            title="Study Planner"
                            description="Create optimal learning schedule"
                            onClick={handleNavigation("/timetable", { courseId })}
                            color="from-cyan-100 to-cyan-50"
                        />
                        <AIToolCard 
                            icon="✨"
                            title="Smart Summary"
                            description="Key points extracted automatically"
                            onClick={handleNavigation("/Summarizer", { courseId })}
                            color="from-amber-100 to-amber-50"
                        />
                    </div>
                </section>

                {/* Files Section */}
                <section className="mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Course Materials</h2>
                        <div className="flex gap-3">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-sm">
                                Sort by: Newest ↓
                            </button>
                        </div>
                    </div>

                    {files.length > 0 ? (
                        <motion.div 
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                        >
                            {files.map((file) => (
                                <FileCard 
                                    key={file.id}
                                    filename={file.filename}
                                    url={file.url}
                                    uploadedAt={file.uploadedAt}
                                    onTestMe={() => navigate("/TestMe", { state: { fileUrl: file.url } })}
                                    getFileIcon={getFileIcon}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="text-6xl mb-4">📁</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    Let's Get Started!
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Upload your first file to unlock powerful learning tools and AI features.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNavigation("/addFile", { courseId , courseName })}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Upload First File
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </section>
            </div>
        </div>
    );
};

const AIToolCard = ({ icon, title, description, onClick, color }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className={`bg-gradient-to-br ${color} p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg border border-white/20`}
        onClick={onClick}
    >
        <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">{icon}</span>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const FileCard = ({ filename, url, uploadedAt, onTestMe, getFileIcon }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div 
            whileHover="hover"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="bg-white rounded-xl border border-gray-200/80 hover:border-indigo-200 transition-all relative overflow-hidden group"
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gray-50">
                        {getFileIcon(filename)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                            {filename}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaClock className="inline" /> {uploadedAt}
                        </p>
                    </div>
                </div>
                
                <motion.div 
                    variants={{ hover: { opacity: 1 } }}
                    initial={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/50 backdrop-blur-sm flex items-center justify-center gap-2"
                >
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        onClick={onTestMe}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm flex items-center gap-2 text-sm"
                    >
                        <FaBrain className="text-purple-600" />
                        Test Me
                    </motion.button>
                    <motion.a 
                        whileHover={{ scale: 1.05 }}
                        href={url} 
                        download
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm flex items-center gap-2 text-sm"
                    >
                        <FaFileDownload className="text-indigo-600" />
                        Download
                    </motion.a>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Test;