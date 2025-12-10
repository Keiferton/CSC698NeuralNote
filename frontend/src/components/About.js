import React from 'react';
import './About.css';

function About() {
  const developers = [
    {
      name: 'Keith',
      role: 'Project Lead & Full Stack Developer',
      emoji: '👨‍💼',
      bio: 'Architect of NeuralNote, overseeing the vision and implementation of AI-assisted journaling.'
    },
    {
      name: 'Hilary',
      role: 'Frontend Developer & UI/UX Designer',
      emoji: '👩‍💻',
      bio: 'Crafted beautiful user interfaces and intuitive experiences for NeuralNote users.'
    },
    {
      name: 'James',
      role: 'Backend Developer & Database Specialist',
      emoji: '🔧',
      bio: 'Built robust backend systems and optimized database architecture for NeuralNote.'
    }
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <h1>🧠 About NeuralNote</h1>
        <p className="about-tagline">AI-assisted journaling and habit tracking for personal growth</p>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          NeuralNote empowers individuals to reflect on their lives, build meaningful habits, and discover patterns
          in their emotional well-being through AI-assisted journaling. We believe that consistent reflection and habit
          tracking lead to personal growth and improved mental health.
        </p>
      </div>

      <div className="about-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📝</span>
            <h3>Smart Journaling</h3>
            <p>Write freely while our AI analyzes emotions, generates summaries, and provides affirmations.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">✅</span>
            <h3>Habit Tracking</h3>
            <p>Build and track habits with automatic detection from your journal entries.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Insights & Analytics</h3>
            <p>Track emotional trends, completion rates, and journaling streaks over time.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h3>Theme Support</h3>
            <p>Choose between light and dark themes for comfortable journaling anytime.</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {developers.map((dev, index) => (
            <div key={index} className="team-card">
              <div className="team-card-emoji">{dev.emoji}</div>
              <h3>{dev.name}</h3>
              <p className="role">{dev.role}</p>
              <p className="bio">{dev.bio}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-category">
            <h4>Frontend</h4>
            <ul>
              <li>React 19.2</li>
              <li>CSS3 with CSS Variables</li>
              <li>Context API for state management</li>
            </ul>
          </div>
          <div className="tech-category">
            <h4>Backend</h4>
            <ul>
              <li>Node.js with Express</li>
              <li>PostgreSQL (Supabase)</li>
              <li>Rule-based AI service</li>
            </ul>
          </div>
          <div className="tech-category">
            <h4>Testing</h4>
            <ul>
              <li>Jest</li>
              <li>Supertest</li>
              <li>Integration tests</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-section about-footer">
        <h3>Version</h3>
        <p>NeuralNote v1.0.0</p>
        <p className="version-info">© 2025 NeuralNote. Open-source project for CSC698.</p>
      </div>
    </div>
  );
}

export default About;
