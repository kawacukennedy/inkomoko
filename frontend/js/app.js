'use strict';

const App = {
  currentUser: null,
  _refreshTimer: null,

  init() {
    this.loadUser();

    if (window.location.protocol.startsWith('chrome-error')) return;

    const path = this.normalizePath(window.location.pathname);
    const authPages = ['/auth.html'];
    const onboardingPages = ['/onboarding.html'];

    if (authPages.includes(path) || onboardingPages.includes(path)) {
      if (this.isLoggedIn() && this.isOnboarded()) {
        const target = this.isElder() ? '/elder-dashboard.html' : '/youth-dashboard.html';
        window.location.replace(target);
        return;
      }
      return;
    }

    this.setupOnlineIndicator();

    if (this.isLoggedIn()) {
      this._startTokenRefreshTimer();
    }

    const publicPages = ['/', '/index.html', '/welcome', '/welcome.html'];

    if (!publicPages.includes(path)) {
      if (!this.isLoggedIn()) {
        window.location.replace('/auth.html');
        return;
      }

      if (this.currentUser && !this.currentUser.onboarding_status) {
        window.location.replace('/onboarding.html');
        return;
      }
    }

    if ((path === '/' || path === '/index.html') && this.isLoggedIn()) {
      const params = new URLSearchParams(window.location.search);
      const isSignupAttempt = params.get('mode') === 'signup' || params.get('role');

      if (!isSignupAttempt) {
        const target = this.currentUser.role === 'elder' ? '/elder-dashboard.html' : '/youth-dashboard.html';
        window.location.replace(target);
        return;
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  },

  normalizePath(path) {
    return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  },

  loadUser() {
    try {
      const raw = localStorage.getItem('inkomoko_user');

      if (!raw || raw === 'undefined' || raw === 'null') {
        this.currentUser = null;
        return;
      }

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === 'object' && parsed.id) {
        this.currentUser = parsed;
      } else {
        this.clearSession();
      }
    } catch (e) {
      this.clearSession();
    }
  },

  setUser(user) {
    if (user && typeof user === 'object') {
      this.currentUser = user;
      localStorage.setItem('inkomoko_user', JSON.stringify(user));
    } else {
      this.clearSession();
    }
  },

  setSession(user, token) {
    API.setToken(token);
    this.setUser(user);
    if (user) {
      this._startTokenRefreshTimer();
    }
  },

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem('inkomoko_user');
    localStorage.removeItem('inkomoko_token');
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  },

  isLoggedIn() {
    return !!(this.currentUser && this.currentUser.id && API.getToken());
  },

  isElder() {
    return this.currentUser && this.currentUser.role === 'elder';
  },

  isYouth() {
    return this.currentUser && this.currentUser.role === 'youth';
  },

  isOnboarded() {
    return this.currentUser && this.currentUser.onboarding_status === true;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/auth.html';
      return false;
    }
    return true;
  },

  requireOnboarding() {
    if (this.isLoggedIn() && !this.isOnboarded()) {
      window.location.href = '/onboarding.html';
      return false;
    }
    return true;
  },

  redirectAfterAuth() {
    if (!this.isLoggedIn()) {
      window.location.replace('/auth.html');
      return;
    }

    if (!this.isOnboarded()) {
      window.location.replace('/onboarding.html');
      return;
    }

    const target = this.isElder() ? '/elder-dashboard.html' : '/youth-dashboard.html';
    window.location.replace(target);
  },

  logout() {
    API.setToken(null);
    this.clearSession();
    window.location.href = '/';
  },

  _startTokenRefreshTimer() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
    }

    const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

    this._refreshTimer = setInterval(async () => {
      if (!this.isLoggedIn()) {
        clearInterval(this._refreshTimer);
        return;
      }

      try {
        const result = await API.post('/auth/refresh');

        if (result && result.token) {
          API.setToken(result.token);
          this.setUser(result.user);
        }
      } catch {
        this.clearSession();
        window.location.href = '/auth.html';
      }
    }, REFRESH_INTERVAL);
  },

  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0:00';

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    return `${m}:${String(s).padStart(2, '0')}`;
  },

  timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-RW', { month: 'short', year: 'numeric' });
  },

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      padding: 16px 24px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      max-width: 90vw;
      text-align: center;
      background: ${type === 'error' ? '#f8d7da' : type === 'success' ? '#d4edda' : '#fff'};
      color: ${type === 'error' ? '#721c24' : type === 'success' ? '#155724' : '#333'};
      animation: slideDown 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 3000);
  },

  setupOnlineIndicator() {
    window.addEventListener('offline', () => {
      this.showToast('You are offline. Changes will sync when reconnected.', 'info');
    });

    window.addEventListener('online', () => {
      this.showToast('Back online!', 'success');
      API.processOfflineQueue();
    });
  },

  avatarUrl(user) {
    if (user?.avatar_url && !user.avatar_url.startsWith('/uploads/avatars/')) {
      return user.avatar_url;
    }

    const name = user?.full_name || 'User';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="#c2410c" rx="50"/>
      <text x="50" y="55" text-anchor="middle" dy=".1em" fill="white" font-family="sans-serif" font-size="36" font-weight="bold">${initials}</text>
    </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  },
};

const Auth = App;

function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);

  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = val;
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(element.style, val);
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), val);
    } else {
      element.setAttribute(key, val);
    }
  }

  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  }

  return element;
}

document.addEventListener('DOMContentLoaded', () => App.init());
