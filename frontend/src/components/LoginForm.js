import React, { useState } from 'react';
import './LoginForm.css';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onLogin(username.trim());
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🧠 NeuralNote</h1>
          <p>AI-Assisted Journaling & Habit Tracking</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Choose a username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              autoFocus
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Starting...' : 'Start Journaling'}
          </button>
        </form>
        
        <div className="login-features">
          <div className="feature">
            <span className="feature-icon">📝</span>
            <span>Daily Journaling</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span>AI Reflections</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✅</span>
            <span>Habit Tracking</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Progress Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
