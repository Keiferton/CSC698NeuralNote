import React, { useState, useCallback } from 'react';
import './App.css';
import { useUser, useHabits, useJournal, useDashboard } from './hooks/useData';
import ErrorBoundary from './components/ErrorBoundary';
import LoginForm from './components/LoginForm';
import JournalEntry from './components/JournalEntry';
import HabitManager from './components/HabitManager';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import About from './components/About';
import DebugPanel from './components/DebugPanel';

function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('journal');
  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit } = useHabits(user.id);
  const { 
    entries, 
    loading: journalLoading, 
    addEntry, 
    deleteEntry, 
    toggleHabit,
    fetchEntries 
  } = useJournal(user.id);
  const { dashboard, loading: dashboardLoading, fetchDashboard } = useDashboard(user.id);
  const [entryLoading, setEntryLoading] = useState(false);

  const handleAddEntry = useCallback(async (content) => {
    setEntryLoading(true);
    try {
      await addEntry(content);
      // Refresh dashboard after adding entry
      fetchDashboard();
    } finally {
      setEntryLoading(false);
    }
  }, [addEntry, fetchDashboard]);

  const handleDeleteEntry = useCallback(async (entryId) => {
    if (window.confirm('Delete this journal entry? This action cannot be undone.')) {
      await deleteEntry(entryId);
      fetchDashboard();
    }
  }, [deleteEntry, fetchDashboard]);

  const handleToggleHabit = useCallback(async (entryId, habitId) => {
    await toggleHabit(entryId, habitId);
    fetchDashboard();
  }, [toggleHabit, fetchDashboard]);

  const handleAddHabit = useCallback(async (name, description) => {
    await addHabit(name, description);
    fetchEntries(); // Refresh entries to show new habit options
  }, [addHabit, fetchEntries]);

  const handleDeleteHabit = useCallback(async (habitId) => {
    await deleteHabit(habitId);
    fetchEntries(); // Refresh entries to update habit completions
    fetchDashboard();
  }, [deleteHabit, fetchEntries, fetchDashboard]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>🧠 NeuralNote</h1>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        <nav className="tab-nav">
          <button 
            className={activeTab === 'journal' ? 'active' : ''} 
            onClick={() => setActiveTab('journal')}
          >
            📝 Journal
          </button>
          <button 
            className={activeTab === 'habits' ? 'active' : ''} 
            onClick={() => setActiveTab('habits')}
          >
            ✅ Habits
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'settings' ? 'active' : ''} 
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
          <button 
            className={activeTab === 'about' ? 'active' : ''} 
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'journal' && (
          <JournalEntry
            entries={entries}
            habits={habits}
            onAddEntry={handleAddEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleHabit={handleToggleHabit}
            loading={entryLoading || journalLoading}
          />
        )}
        
        {activeTab === 'habits' && (
          <HabitManager
            habits={habits}
            onAddHabit={handleAddHabit}
            onUpdateHabit={updateHabit}
            onDeleteHabit={handleDeleteHabit}
            loading={habitsLoading}
          />
        )}
        
        {activeTab === 'dashboard' && (
          <Dashboard
            dashboard={dashboard}
            loading={dashboardLoading}
          />
        )}
        
        {activeTab === 'settings' && (
          <Settings />
        )}
        
        {activeTab === 'about' && (
          <About />
        )}
      </main>
    </div>
  );
}

function App() {
  const { user, loading, login, logout } = useUser();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading NeuralNote...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginForm onLogin={login} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <MainApp user={user} onLogout={logout} />
      <DebugPanel />
    </ErrorBoundary>
  );
}

export default App;
