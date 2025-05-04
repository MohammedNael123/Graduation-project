import React from 'react';
import './HowToUse.css'; // Import the external CSS file
import { Link } from 'react-router-dom';

const HowToUse = () => {
  return (
    <section className="how-to-use-container">
      <h2 className="how-to-use-title">How Darisni AI Enhances Your Study Experience 🚀</h2>
      <p className="how-to-use-subtitle">
        Discover how Darisni uses AI to save you time, simplify learning, and make studying more efficient. 📚✨
      </p>
      <div className="steps-container">
        <div className="step-card">
          <h3>📤 Step 1: Upload Your Materials</h3>
          <p>
            Upload your notes, textbooks, or PDFs. Darisni's AI will analyze and organize them for you. 🗂️
          </p>
        </div>
        <div className="step-card">
          <h3>🤖 Step 2: AI-Powered Summaries</h3>
          <p>
          Get summaries, quizzes, and explanations to save time and boost your learning          </p>
        </div>
        <div className="step-card">
          <h3>📊 Step 3: Track Your Progress</h3>
          <p>
            Use AI-driven analytics to monitor your learning progress and focus on weak areas. 📈🎯
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowToUse;