import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Hook for managing user authentication/session
export function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('neuralnote_user_id');
    if (storedUserId) {
      apiService.getUser(storedUserId)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('neuralnote_user_id');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username) => {
    const newUser = await apiService.createUser(username);
    localStorage.setItem('neuralnote_user_id', newUser.id);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('neuralnote_user_id');
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}

// Hook for managing habits
export function useHabits(userId) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getHabits(userId);
      setHabits(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (name, description) => {
    const habit = await apiService.createHabit(userId, name, description);
    setHabits(prev => [habit, ...prev]);
    return habit;
  };

  const updateHabit = async (habitId, name, description) => {
    const habit = await apiService.updateHabit(habitId, name, description);
    setHabits(prev => prev.map(h => h.id === habitId ? habit : h));
    return habit;
  };

  const deleteHabit = async (habitId) => {
    await apiService.deleteHabit(habitId);
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  return { habits, loading, fetchHabits, addHabit, updateHabit, deleteHabit };
}

// Hook for managing journal entries
export function useJournal(userId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getJournalEntries(userId);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (content) => {
    const entry = await apiService.createJournalEntry(userId, content);
    setEntries(prev => [entry, ...prev]);
    return entry;
  };

  const updateEntry = async (entryId, content) => {
    const entry = await apiService.updateJournalEntry(entryId, content);
    setEntries(prev => prev.map(e => e.id === entryId ? entry : e));
    return entry;
  };

  const deleteEntry = async (entryId) => {
    await apiService.deleteJournalEntry(entryId);
    setEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const toggleHabit = async (entryId, habitId) => {
    const result = await apiService.toggleHabitCompletion(entryId, habitId);
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const completedHabits = result.completed
        ? [...(e.completedHabits || []), result.habit]
        : (e.completedHabits || []).filter(h => h.id !== habitId);
      return { ...e, completedHabits };
    }));
    return result;
  };

  return { entries, loading, fetchEntries, addEntry, updateEntry, deleteEntry, toggleHabit };
}

// Hook for dashboard data
export function useDashboard(userId) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await apiService.getDashboard(userId);
      setDashboard(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, loading, fetchDashboard };
}
