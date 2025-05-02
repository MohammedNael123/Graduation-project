import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaFile, FaRegFilePdf } from "react-icons/fa";
import QuizComponent from './quizcomponent';

const QuizMaker = () => {
    const location = useLocation();
    const courseId = location.state?.courseId;
    const [numQuestions, setNumQuestions] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/api/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    NumberOfQuestion: Math.min(numQuestions, 30),
                    fileUrl: selectedFile
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            setQuestions(data.questions.slice(0, 30));
        } catch (err) {
            setError(err.message || 'Failed to generate quiz');
        } finally {
            setLoading(false);
        }
    };

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
                setError("Failed to fetch files. Please try again.");
            }
        };

        if (courseId) getFiles();
    }, [courseId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30 p-6 flex flex-col items-center justify-center">
            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="w-full max-w-2xl bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-8 border border-indigo-100"
            >
                <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                    ✨ AI Quiz Generator
                </h2>
                
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Number of Questions (Max 30)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="30"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Math.min(e.target.value, 30))}
                        className="w-full px-5 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        required
                    />
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Course Material</h3>
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

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !selectedFile}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-4 px-8 rounded-xl 
                        hover:from-indigo-700 hover:to-blue-600 transition-all shadow-lg
                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                            Generating Quiz...
                        </>
                    ) : 'Generate Quiz'}
                </motion.button>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 p-4 bg-red-100 text-red-700 rounded-xl text-sm border border-red-200"
                    >
                        ⚠️ {error}
                    </motion.div>
                )}
            </motion.form>

            {questions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-2xl"
                >
                    <QuizComponent questions={questions} />
                </motion.div>
            )}
        </div>
    );
};

export default QuizMaker;