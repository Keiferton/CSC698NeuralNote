const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }
    
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }

  // User methods
  async createUser(username) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  // Habit methods
  async getHabits(userId) {
    return this.request(`/habits/user/${userId}`);
  }

  async createHabit(userId, name, description) {
    return this.request('/habits', {
      method: 'POST',
      body: JSON.stringify({ userId, name, description }),
    });
  }

  async updateHabit(habitId, name, description) {
    return this.request(`/habits/${habitId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteHabit(habitId) {
    return this.request(`/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  // Journal methods
  async getJournalEntries(userId, limit = 50, offset = 0) {
    return this.request(`/journal/user/${userId}?limit=${limit}&offset=${offset}`);
  }

  async createJournalEntry(userId, content) {
    return this.request('/journal', {
      method: 'POST',
      body: JSON.stringify({ userId, content }),
    });
  }

  async getJournalEntry(entryId) {
    return this.request(`/journal/${entryId}`);
  }

  async updateJournalEntry(entryId, content) {
    return this.request(`/journal/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteJournalEntry(entryId) {
    return this.request(`/journal/${entryId}`, {
      method: 'DELETE',
    });
  }

  async toggleHabitCompletion(entryId, habitId) {
    return this.request(`/journal/${entryId}/habits/${habitId}/toggle`, {
      method: 'POST',
    });
  }

  // Dashboard methods
  async getDashboard(userId) {
    return this.request(`/dashboard/${userId}`);
  }
}

const apiService = new ApiService();
export default apiService;
