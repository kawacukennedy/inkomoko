/* ============================================================
   Inkomoko — API Client
   Handles all HTTP requests with offline queue support
   ============================================================ */

const API = {
  baseUrl: '/api',
  token: localStorage.getItem('inkomoko_token'),

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('inkomoko_token', token);
    else localStorage.removeItem('inkomoko_token');
  },

  getToken() {
    return this.token || localStorage.getItem('inkomoko_token');
  },

  async request(method, endpoint, data = null, isFormData = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {};
    const token = this.getToken();

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const options = { method, headers };

    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw { status: response.status, message: result.error || 'Request failed' };
      }

      return result;
    } catch (err) {
      if (!navigator.onLine && method !== 'GET') {
        this.queueOfflineRequest(method, endpoint, data);
        return { queued: true, message: 'Request queued for when you are back online' };
      }
      throw err;
    }
  },

  // Queue requests when offline
  queueOfflineRequest(method, endpoint, data) {
    const queue = JSON.parse(localStorage.getItem('inkomoko_offline_queue') || '[]');
    queue.push({ method, endpoint, data, timestamp: Date.now() });
    localStorage.setItem('inkomoko_offline_queue', JSON.stringify(queue));
  },

  // Process offline queue when back online
  async processOfflineQueue() {
    const queue = JSON.parse(localStorage.getItem('inkomoko_offline_queue') || '[]');
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      try {
        await this.request(item.method, item.endpoint, item.data);
      } catch (err) {
        remaining.push(item);
      }
    }
    localStorage.setItem('inkomoko_offline_queue', JSON.stringify(remaining));
  },

  // Convenience methods
  get: (endpoint) => API.request('GET', endpoint),
  post: (endpoint, data) => API.request('POST', endpoint, data),
  put: (endpoint, data) => API.request('PUT', endpoint, data),
  delete: (endpoint) => API.request('DELETE', endpoint),
  upload: (endpoint, formData) => API.request('POST', endpoint, formData, true),

  // Auth
  async signup(data) { return this.post('/auth/signup', data); },
  async login(data) { return this.post('/auth/login', data); },

  // Users
  async getProfile() { return this.get('/users/profile'); },
  async updateProfile(data) { return this.put('/users/profile', data); },
  async completeOnboarding(data) { return this.put('/users/onboarding', data); },
  async getSettings() { return this.get('/users/settings'); },
  async updateSettings(data) { return this.put('/users/settings', data); },
  async getUserPublic(id) { return this.get(`/users/${id}`); },
  async followUser(id) { return this.post(`/users/${id}/follow`); },
  async unfollowUser(id) { return this.delete(`/users/${id}/follow`); },

  // Stories
  async getStories(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/stories?${qs}`);
  },
  async getTrending() { return this.get('/stories/trending'); },
  async getDrafts() { return this.get('/stories/drafts'); },
  async getMyStories() { return this.get('/stories/my'); },
  async getFeed() { return this.get('/stories/feed'); },
  async getBookmarked() { return this.get('/stories/bookmarked'); },
  async getStory(id) { return this.get(`/stories/${id}`); },
  async createStory(data) { return this.post('/stories', data); },
  async updateStory(id, data) { return this.put(`/stories/${id}`, data); },
  async uploadAudio(id, formData) { return this.upload(`/stories/${id}/audio`, formData); },
  async toggleGratitude(id) { return this.post(`/stories/${id}/gratitude`); },
  async toggleBookmark(id) { return this.post(`/stories/${id}/bookmark`); },
  async recordPlay(id, data) { return this.post(`/stories/${id}/play`, data); },
  async addComment(id, content) { return this.post(`/stories/${id}/comments`, { content }); },
  async deleteStory(id) { return this.delete(`/stories/${id}`); },

  // Families
  async createFamily(data) { return this.post('/families', data); },
  async joinFamily(code) { return this.post('/families/join', { code }); },
  async getMyFamilies() { return this.get('/families/my'); },
  async getFamilyMembers(id) { return this.get(`/families/${id}/members`); },
  async getFamilyPending(id) { return this.get(`/families/${id}/pending`); },
  async getFamilyElders(id) { return this.get(`/families/${id}/elders`); },
  async updateMember(familyId, memberId, data) { return this.put(`/families/${familyId}/members/${memberId}`, data); },
  async approveMember(familyId, memberId) { return this.post(`/families/${familyId}/approve/${memberId}`); },
  async rejectMember(familyId, memberId) { return this.post(`/families/${familyId}/reject/${memberId}`); },

  // Library
  async getFeatured() { return this.get('/library/featured'); },
  async getNearMe(region) { return this.get(`/library/near-me?region=${encodeURIComponent(region || '')}`); },
  async getArchive() { return this.get('/library/archive'); },
  async getCategories() { return this.get('/library/categories'); },
  async getStats() { return this.get('/library/stats'); },

  // Dashboard
  async getElderDashboard() { return this.get('/dashboard/elder'); },
};

// Process offline queue when back online
window.addEventListener('online', () => API.processOfflineQueue());
