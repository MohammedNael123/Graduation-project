import React from 'react';
import './Reviews.css';

const Reviews = () => {
  return (
    <section className="reviews-container">
      <h2 className="reviews-title">What Learners Are Saying 🌟</h2>
      <div className="reviews-grid">
        <div className="review-card">
          <div className="review-header">
            <div className="review-avatar">👩🎓</div>
            <div className="review-author">
              <h4>Sarah Johnson</h4>
              <p>Computer Science Student</p>
            </div>
          </div>
          <div className="review-content">
            <span className="quote-icon">“</span>
            <p>Darsni's summarization tool cut my study time in half. The AI highlights exactly what matters!</p>
            <div className="review-stars">⭐⭐⭐⭐⭐</div>
          </div>
        </div>

        <div className="review-card">
          <div className="review-header">
            <div className="review-avatar">👨💼</div>
            <div className="review-author">
              <h4>Michael Chen</h4>
              <p>Medical Student</p>
            </div>
          </div>
          <div className="review-content">
            <span className="quote-icon">“</span>
            <p>The progress analytics helped me identify weak spots I didn't even know I had. Game changer!</p>
            <div className="review-stars">⭐⭐⭐⭐⭐</div>
          </div>
        </div>

        <div className="review-card">
          <div className="review-header">
            <div className="review-avatar">👩🏫</div>
            <div className="review-author">
              <h4>Emma Wilson</h4>
              <p>Research Scholar</p>
            </div>
          </div>
          <div className="review-content">
              <span className="quote-icon">“</span>
            <p>Finally an AI tool that actually understands academic material. The organization features are brilliant.</p>
            <div className="review-stars">⭐⭐⭐⭐⭐</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;