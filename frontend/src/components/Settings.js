import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

function Settings() {
  const { theme, toggleTheme, setThemeTo } = useTheme();

  return (
    <div className="settings-container">
      <h2>⚙️ Settings</h2>
      
      <div className="settings-section">
        <h3>Theme</h3>
        <p className="settings-description">Customize the appearance of NeuralNote</p>
        
        <div className="theme-options">
          <button
            className={`theme-button ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setThemeTo('light')}
            title="Light theme"
          >
            <span className="theme-icon">☀️</span>
            <span>Light</span>
          </button>
          
          <button
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setThemeTo('dark')}
            title="Dark theme"
          >
            <span className="theme-icon">🌙</span>
            <span>Dark</span>
          </button>
          
          <button
            className="theme-button toggle-button"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            <span className="theme-icon">🔄</span>
            <span>Toggle</span>
          </button>
        </div>
        
        <p className="settings-info">Current theme: <strong>{theme}</strong></p>
      </div>

      <div className="settings-section">
        <h3>About</h3>
        <p>NeuralNote v1.0.0</p>
        <p>AI-assisted journaling and habit tracking application</p>
      </div>
    </div>
  );
}

export default Settings;
