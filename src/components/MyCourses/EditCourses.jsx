import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { DocumentIcon, ArrowLeftIcon, TrashIcon, CloudArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const EditCourses = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const courseId = location.state?.courseId;
    const courseNameFromLocation = location.state?.courseName;
    const [courseName, setCourseName] = useState(courseNameFromLocation);
    const [files, setFiles] = useState([]);
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
                }));
                setFiles(processedFiles);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            getFiles();
        }
    }, [courseId]);

    const updateCourseName = async () => {
        try {
            const res = await axios.post("http://localhost:5000/EditCourseName", {
                courseId: courseId,
                newName: courseName
            }, {
                withCredentials: true
            });

            if (res.status === 200) {
                navigate("/mycourses");
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleUploadFile = (courseId) => (e) => {
        e.preventDefault();
        navigate("/addFile", { state: { course: courseId } });
    };

    const handleRemoveFile = (fileId) => {
        setFiles(files.filter(file => file.id !== fileId));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8"
            >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            Course Settings
                        </h1>
                        <p className="text-gray-500 mt-2">Manage your course details and materials</p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                        <ArrowLeftIcon className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Course Name Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-8"
                >
                    <form onSubmit={(e) => { e.preventDefault(); updateCourseName(); }}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Course Title</label>
                            <input
                                type="text"
                                value={courseName}
                                onChange={(e) => setCourseName(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border border-indigo-200 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all placeholder-gray-400 bg-white"
                                placeholder="Enter course name"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-sm font-medium"
                        >
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Save Changes
                        </button>
                    </form>
                </motion.div>

                {/* File Management Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Course Materials</h2>
                            <p className="text-gray-500 mt-1">Upload and manage your teaching resources</p>
                        </div>
                        <button
                            onClick={handleUploadFile(courseId)}
                            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                            <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                            Add Files
                        </button>
                    </div>

                    {/* Files Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {files.map((file) => (
                                <motion.div
                                    key={file.id}
                                    whileHover={{ scale: 1.02 }}
                                    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all"
                                >
                                    <div className="flex items-center truncate">
                                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                            <DocumentIcon className="w-6 h-6 text-indigo-500" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                                            <p className="text-xs text-gray-500 mt-1">{file.size}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFile(file.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No files uploaded yet</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}

export default EditCourses;