import React, { useState } from 'react';
import './JournalEntry.css';
import { 
  FaRobot, 
  FaHeart, 
  FaStar, 
  FaTrash, 
  FaCheckCircle,
  FaBook,
  FaSmile,
  FaSadTear,
  FaFlushed,
  FaAngry,
  FaPeace,
  FaDumbbell,
  FaBed,
  FaMeh
} from 'react-icons/fa';

function JournalEntryForm({ onSubmit, loading }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="journal-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="How are you feeling today? Write about your day, your thoughts, any habits you completed..."
        disabled={loading}
        rows={6}
      />
      <button type="submit" disabled={loading || !content.trim()}>
        {loading ? 'Saving...' : <><FaStar /> Save & Analyze</>}
      </button>
    </form>
  );
}

function AIReflection({ entry }) {
  if (!entry.ai_summary && !entry.ai_emotion && !entry.ai_affirmation) {
    return null;
  }

  const emotionIcons = {
    happy: <FaSmile />,
    sad: <FaSadTear />,
    anxious: <FaFlushed />,
    angry: <FaAngry />,
    calm: <FaPeace />,
    motivated: <FaDumbbell />,
    tired: <FaBed />,
    neutral: <FaMeh />
  };

  return (
    <div className="ai-reflection">
      <h4><FaRobot /> AI Reflection</h4>
      
      {entry.ai_emotion && (
        <div className="reflection-item emotion">
          <span className="label">Detected Emotion:</span>
          <span className="value">
            {emotionIcons[entry.ai_emotion] || <FaMeh />} {entry.ai_emotion}
          </span>
        </div>
      )}
      
      {entry.ai_summary && (
        <div className="reflection-item summary">
          <span className="label">Summary:</span>
          <p className="value">{entry.ai_summary}</p>
        </div>
      )}
      
      {entry.ai_affirmation && (
        <div className="reflection-item affirmation">
          <span className="label"><FaHeart /> Affirmation:</span>
          <p className="value">{entry.ai_affirmation}</p>
        </div>
      )}
    </div>
  );
}

function JournalEntryCard({ entry, habits, onToggleHabit, onDelete }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const content = entry.content || '';
  const isLong = content.length > 300;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const completedHabitIds = (entry.completedHabits || []).map(h => h.id);

  return (
    <div className="journal-card">
      <div className="card-header">
        <span className="date">{formatDate(entry.created_at)}</span>
        <button 
          className="delete-btn" 
          onClick={() => onDelete(entry.id)}
          title="Delete entry"
        >
          <FaTrash />
        </button>
      </div>
      
      <div className="content">
        <p>
          {isLong && !showFullContent 
            ? content.substring(0, 300) + '...' 
            : content
          }
        </p>
        {isLong && (
          <button 
            className="show-more" 
            onClick={() => setShowFullContent(!showFullContent)}
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      <AIReflection entry={entry} />
      
      {habits.length > 0 && (
        <div className="habit-checklist">
          <h4><FaCheckCircle /> Habits</h4>
          <div className="habits">
            {habits.map(habit => (
              <label key={habit.id} className="habit-checkbox">
                <input
                  type="checkbox"
                  checked={completedHabitIds.includes(habit.id)}
                  onChange={() => onToggleHabit(entry.id, habit.id)}
                />
                <span>{habit.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JournalEntry({ entries, habits, onAddEntry, onDeleteEntry, onToggleHabit, loading }) {
  return (
    <div className="journal-section">
      <h2><FaBook /> Today's Journal</h2>
      
      <JournalEntryForm onSubmit={onAddEntry} loading={loading} />
      
      <div className="entries-list">
        <h3>Recent Entries</h3>
        {entries.length === 0 ? (
          <p className="no-entries">No journal entries yet. Start writing above!</p>
        ) : (
          entries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              habits={habits}
              onToggleHabit={onToggleHabit}
              onDelete={onDeleteEntry}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default JournalEntry;
