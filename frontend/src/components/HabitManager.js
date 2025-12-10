import React, { useState } from 'react';
import './HabitManager.css';
import { FaCheckCircle, FaEdit, FaTrash, FaLightbulb } from 'react-icons/fa';

function HabitForm({ onSubmit, loading, onCancel, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    await onSubmit(name.trim(), description.trim());
    if (!initialData) {
      setName('');
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name (e.g., Exercise, Meditation)"
        disabled={loading}
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        disabled={loading}
      />
      <div className="form-buttons">
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Saving...' : initialData ? 'Update' : '+ Add Habit'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function HabitCard({ habit, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (name, description) => {
    setLoading(true);
    try {
      await onEdit(habit.id, name, description);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete "${habit.name}"? This action cannot be undone.`)) {
      await onDelete(habit.id);
    }
  };

  if (isEditing) {
    return (
      <div className="habit-card editing">
        <HabitForm
          onSubmit={handleUpdate}
          loading={loading}
          onCancel={() => setIsEditing(false)}
          initialData={habit}
        />
      </div>
    );
  }

  return (
    <div className="habit-card">
      <div className="habit-info">
        <h4>{habit.name}</h4>
        {habit.description && <p>{habit.description}</p>}
      </div>
      <div className="habit-actions">
        <button onClick={() => setIsEditing(true)} className="edit-btn" title="Edit">
          <FaEdit />
        </button>
        <button onClick={handleDelete} className="delete-btn" title="Delete">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

function HabitManager({ habits, onAddHabit, onUpdateHabit, onDeleteHabit, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleAdd = async (name, description) => {
    setFormLoading(true);
    try {
      await onAddHabit(name, description);
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="habit-manager">
      <div className="header">
        <h2><FaCheckCircle /> My Habits</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="add-habit-btn">
            + New Habit
          </button>
        )}
      </div>

      {showForm && (
        <HabitForm
          onSubmit={handleAdd}
          loading={formLoading}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <p className="loading">Loading habits...</p>
      ) : habits.length === 0 ? (
        <p className="no-habits">
          No habits yet. Add some habits to track your daily progress!
        </p>
      ) : (
        <div className="habits-list">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={onUpdateHabit}
              onDelete={onDeleteHabit}
            />
          ))}
        </div>
      )}

      <div className="habit-tip">
        <FaLightbulb /> <strong>Tip:</strong> When you write about completing a habit in your journal, 
        it will be automatically detected and checked off!
      </div>
    </div>
  );
}

export default HabitManager;
