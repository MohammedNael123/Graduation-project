import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuizComponent = ({ questions }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const calculateResults = () => {
        const correctAnswers = questions.reduce((acc, question, index) => {
            return acc + (selectedAnswers[index] === question.answer ? 1 : 0);
        }, 0);
        
        return {
            total: questions.length,
            correct: correctAnswers,
            percentage: Math.round((correctAnswers / questions.length) * 100)
        };
    };

    const handleSubmit = () => {
        if (Object.keys(selectedAnswers).length === questions.length) {
            setShowResults(true);
        }
    };

    const handleRetry = () => {
        setSelectedAnswers({});
        setShowResults(false);
    };

    const results = calculateResults();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-indigo-100"
        >
            {!showResults ? (
                <>
                    <div className="space-y-8">
                        {questions.map((question, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-indigo-50 p-6 rounded-xl"
                            >
                                <h3 className="text-xl font-bold mb-4 text-indigo-800">
                                    Q{index + 1}: {question.question}
                                </h3>
                                
                                <div className="grid gap-3">
                                    {question.options.map((option, optionIndex) => (
                                        <motion.button
                                            key={optionIndex}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswerSelect(index, option)}
                                            className={`p-4 rounded-xl text-left transition-all
                                                ${selectedAnswers[index] === option
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-white hover:bg-indigo-100 text-gray-700'}
                                                border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                                        >
                                            {option}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={Object.keys(selectedAnswers).length !== questions.length}
                        className="mt-8 w-full bg-indigo-600 text-white py-4 px-8 rounded-xl
                            hover:bg-indigo-700 transition-colors shadow-lg
                            disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                        Submit Answers
                    </motion.button>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-6"
                >
                    <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                        📊 Quiz Results
                    </h2>
                    
                    <div className="bg-indigo-50 p-8 rounded-2xl mb-8 border border-indigo-200">
                        <div className="text-5xl font-bold text-indigo-600 mb-2">
                            {results.percentage}%
                        </div>
                        <div className="text-lg text-gray-600">
                            {results.correct} / {results.total} Correct Answers
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {questions.map((question, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm"
                            >
                                <div className="font-semibold text-indigo-600 mb-2">Q{index + 1}</div>
                                <div className={`text-lg ${selectedAnswers[index] === question.answer 
                                    ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedAnswers[index] === question.answer ? '✓' : '✗'}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl
                            hover:bg-indigo-700 transition-colors shadow-lg text-lg"
                    >
                        Try Again
                    </motion.button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default QuizComponent;