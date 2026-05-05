'use strict';

const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('inkomoko_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('inkomoko_token', token);
    } else {
      localStorage.removeItem('inkomoko_token');
    }
  },

  async request(method, endpoint, data = null, isFormData = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {};

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const options = { method, headers };

    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || `Request failed (${response.status})`);
      }

      return result;
    } catch (err) {
      if (!navigator.onLine && method !== 'GET') {
        this.queueRequest(method, endpoint, data);
        return { queued: true, message: 'Request queued - will sync when online' };
      }
      throw err;
    }
  },

  queueRequest(method, endpoint, data) {
    const queue = JSON.parse(localStorage.getItem('inkomoko_offline_queue') || '[]');
    queue.push({ method, endpoint, data, timestamp: Date.now() });
    localStorage.setItem('inkomoko_offline_queue', JSON.stringify(queue));
  },

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

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, data) { return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint) { return this.request('DELETE', endpoint); },
  upload(endpoint, formData) { return this.request('POST', endpoint, formData, true); },

  // Auth
  signup(data) { return this.post('/auth/signup', data); },
  login(data) { return this.post('/auth/login', data); },
  verifyOTP(data) { return this.post('/auth/verify-otp', data); },
  forgotPassword(identifier) { return this.post('/auth/forgot-password', { identifier }); },
  resetPassword(data) { return this.post('/auth/reset-password', data); },

  // Users
  getProfile() { return this.get('/users/profile'); },
  updateProfile(data) { return this.put('/users/profile', data); },
  completeOnboarding(data) { return this.put('/users/onboarding', data); },
  getSettings() { return this.get('/users/settings'); },
  updateSettings(data) { return this.put('/users/settings', data); },
  getUserPublic(id) { return this.get(`/users/${id}`); },
  followUser(id) { return this.post(`/users/${id}/follow`); },
  unfollowUser(id) { return this.delete(`/users/${id}/follow`); },

  // Stories
  getStories(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get(`/stories?${qs}`);
  },
  getTrending() { return this.get('/stories/trending'); },
  getDrafts() { return this.get('/stories/drafts'); },
  getMyStories() { return this.get('/stories/my'); },
  getFeed() { return this.get('/stories/feed'); },
  getBookmarked() { return this.get('/stories/bookmarked'); },
  getStory(id) { return this.get(`/stories/${id}`); },
  createStory(data) { return this.post('/stories', data); },
  updateStory(id, data) { return this.put(`/stories/${id}`, data); },
  uploadAudio(id, formData) { return this.upload(`/stories/${id}/audio`, formData); },
  toggleGratitude(id) { return this.post(`/stories/${id}/gratitude`); },
  toggleBookmark(id) { return this.post(`/stories/${id}/bookmark`); },
  recordPlay(id, data) { return this.post(`/stories/${id}/play`, data); },
  addComment(id, content) { return this.post(`/stories/${id}/comments`, { content }); },
  deleteStory(id) { return this.delete(`/stories/${id}`); },

  // Families
  createFamily(data) { return this.post('/families', data); },
  joinFamily(code) { return this.post('/families/join', { code }); },
  getMyFamilies() { return this.get('/families/my'); },
  getFamilyMembers(id) { return this.get(`/families/${id}/members`); },
  getFamilyPending(id) { return this.get(`/families/${id}/pending`); },
  getFamilyElders(id) { return this.get(`/families/${id}/elders`); },
  updateMember(familyId, memberId, data) { return this.put(`/families/${familyId}/members/${memberId}`, data); },
  approveMember(familyId, memberId) { return this.post(`/families/${familyId}/approve/${memberId}`); },
  rejectMember(familyId, memberId) { return this.post(`/families/${familyId}/reject/${memberId}`); },

  // Library
  getFeatured() { return this.get('/library/featured'); },
  getNearMe(region) { return this.get(`/library/near-me?region=${encodeURIComponent(region || '')}`); },
  getArchive() { return this.get('/library/archive'); },
  getCategories() { return this.get('/library/categories'); },
  getStats() { return this.get('/library/stats'); },

  // Dashboard
  getElderDashboard() { return this.get('/dashboard/elder'); },

  // AI
  AI: {
    enhanceStory(text) { return API.post('/ai/enhance-story', { text }); },
  },
};

window.addEventListener('online', () => API.processOfflineQueue());
