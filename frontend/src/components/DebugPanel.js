import React, { useState, useEffect } from 'react';
import './DebugPanel.css';

const DebugPanel = () => {
  const [stats, setStats] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[DebugPanel] Fetching stats...');
        const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiBaseUrl}/api/debug/stats`);        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[DebugPanel] Stats received:', data);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('[DebugPanel] Error fetching stats:', err);
        setError(err.message);
      }
    };

    // Initial fetch
    fetchStats();

    // Refresh every 5 seconds
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleOpen = () => {
    console.log('[DebugPanel] Toggle clicked, isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        className="debug-toggle"
        onClick={toggleOpen}
        title="Debug Panel"
      >
        🐛
      </button>
      
      {isOpen && (
        <div className="debug-panel">
          <div className="debug-header">
            <h3>🔧 Debug Panel</h3>
            <button 
              className="close-btn"
              onClick={toggleOpen}
            >
              ✕
            </button>
          </div>
          
          <div className="debug-content">
            {error ? (
              <div className="error">
                <strong>Error fetching stats:</strong><br />
                {error}
              </div>
            ) : stats ? (
              <>
                <section className="debug-section">
                  <h4>AI Configuration</h4>
                  <div className="stat-item">
                    <span className="label">Provider:</span>
                    <span className="value">{stats.ai.provider}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">API Key:</span>
                    <span className={`value ${stats.ai.hasApiKey ? 'success' : 'error'}`}>
                      {stats.ai.hasApiKey ? `${stats.ai.apiKeyPreview}` : 'Not configured'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Summarization:</span>
                    <span className="value">{stats.ai.models.summarization}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Affirmation:</span>
                    <span className="value">{stats.ai.models.affirmation}</span>
                  </div>
                </section>

                <section className="debug-section">
                  <h4>Environment</h4>
                  <div className="stat-item">
                    <span className="label">Node Env:</span>
                    <span className="value">{stats.environment.nodeEnv}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Port:</span>
                    <span className="value">{stats.environment.port}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Uptime:</span>
                    <span className="value">{Math.floor(stats.uptime)}s</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Last Updated:</span>
                    <span className="value">{new Date(stats.timestamp).toLocaleTimeString()}</span>
                  </div>
                </section>

                <section className="debug-section">
                  <h4>Quick Links</h4>
                  <div className="quick-links">
                    <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/debug/stats`} target="_blank" rel="noopener noreferrer">
                      View Stats JSON
                    </a>
                    <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/health`} target="_blank" rel="noopener noreferrer">
                      Health Check
                    </a>
                  </div>
                </section>
              </>
            ) : (
              <div className="loading">Loading debug stats...</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebugPanel;
