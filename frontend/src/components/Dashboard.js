import React from 'react';
import './Dashboard.css';

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function EmotionChart({ emotionDistribution }) {
  const emotions = Object.entries(emotionDistribution || {});
  const total = emotions.reduce((sum, [, count]) => sum + count, 0);

  const emotionColors = {
    happy: '#4ade80',
    sad: '#60a5fa',
    anxious: '#f97316',
    angry: '#ef4444',
    calm: '#06b6d4',
    motivated: '#8b5cf6',
    tired: '#94a3b8',
    neutral: '#9ca3af'
  };

  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😤',
    calm: '😌',
    motivated: '💪',
    tired: '😴',
    neutral: '😐'
  };

  if (emotions.length === 0) {
    return (
      <div className="emotion-chart empty">
        <p>No emotion data yet. Start journaling to see your emotional patterns!</p>
      </div>
    );
  }

  return (
    <div className="emotion-chart">
      <h3>😊 Emotion Distribution</h3>
      <div className="emotion-bars">
        {emotions.map(([emotion, count]) => (
          <div key={emotion} className="emotion-bar-container">
            <div className="emotion-label">
              <span className="emoji">{emotionEmojis[emotion] || '😐'}</span>
              <span className="name">{emotion}</span>
            </div>
            <div className="bar-wrapper">
              <div 
                className="bar" 
                style={{ 
                  width: `${(count / total) * 100}%`,
                  backgroundColor: emotionColors[emotion] || '#9ca3af'
                }}
              />
              <span className="count">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyActivity({ weeklyActivity }) {
  if (!weeklyActivity || weeklyActivity.length === 0) {
    return null;
  }

  const maxCount = Math.max(...weeklyActivity.map(d => d.entryCount), 1);

  return (
    <div className="weekly-activity">
      <h3>📅 Weekly Activity</h3>
      <div className="activity-chart">
        {weeklyActivity.map((day, index) => (
          <div key={index} className="day-column">
            <div className="bar-container">
              <div 
                className="activity-bar"
                style={{ height: `${(day.entryCount / maxCount) * 100}%` }}
              >
                {day.entryCount > 0 && (
                  <span className="count">{day.entryCount}</span>
                )}
              </div>
            </div>
            <span className="day-name">{day.dayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HabitProgress({ habitCompletions }) {
  if (!habitCompletions || habitCompletions.length === 0) {
    return (
      <div className="habit-progress empty">
        <p>No habits tracked yet. Add habits and mention them in your journal!</p>
      </div>
    );
  }

  return (
    <div className="habit-progress">
      <h3>✅ Habit Completions (Last 30 Days)</h3>
      <div className="habit-list">
        {habitCompletions.map(habit => (
          <div key={habit.id} className="habit-row">
            <span className="habit-name">{habit.name}</span>
            <span className="habit-count">{habit.completion_count} times</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentEntries({ entries }) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    angry: '😤',
    calm: '😌',
    motivated: '💪',
    tired: '😴',
    neutral: '😐'
  };

  return (
    <div className="recent-entries">
      <h3>📝 Recent Entries</h3>
      <div className="entries-list">
        {entries.slice(0, 3).map(entry => (
          <div key={entry.id} className="entry-preview">
            <div className="entry-header">
              <span className="entry-date">{formatDate(entry.created_at)}</span>
              {entry.ai_emotion && (
                <span className="entry-emotion">
                  {emotionEmojis[entry.ai_emotion] || '😐'}
                </span>
              )}
            </div>
            <p className="entry-snippet">
              {(entry.content || '').substring(0, 100)}
              {(entry.content || '').length > 100 ? '...' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ dashboard, loading }) {
  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard empty">
        <p>No data available yet. Start journaling to see your progress!</p>
      </div>
    );
  }

  const { stats, emotionDistribution, habitCompletions, weeklyActivity, recentEntries } = dashboard;

  return (
    <div className="dashboard">
      <h2>📊 Your Progress</h2>
      
      <div className="stats-grid">
        <StatCard 
          icon="📝" 
          label="Total Entries" 
          value={stats?.totalEntries || 0} 
        />
        <StatCard 
          icon="🔥" 
          label="Current Streak" 
          value={`${stats?.currentStreak || 0} days`} 
        />
        <StatCard 
          icon="✅" 
          label="Habits Tracked" 
          value={habitCompletions?.length || 0} 
        />
      </div>

      <div className="dashboard-grid">
        <WeeklyActivity weeklyActivity={weeklyActivity} />
        <EmotionChart emotionDistribution={emotionDistribution} />
        <HabitProgress habitCompletions={habitCompletions} />
        <RecentEntries entries={recentEntries} />
      </div>
    </div>
  );
}

export default Dashboard;
