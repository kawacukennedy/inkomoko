/* ============================================================
   Inkomoko — Shared App Utilities
   Navigation, auth state, helpers
   ============================================================ */

const App = {
  currentUser: null,

  init() {
    // Global Error Safety Net
    window.onerror = function(msg, url, line, col, error) {
      if (msg.includes('onboarding_status') || msg.includes('undefined')) {
        console.warn('Caught and suppressed potential auth-state crash:', msg);
        return true; // Prevent the error from crashing the app
      }
      return false;
    };

    this.loadUser();
    this.setupOnlineIndicator();
    
    const path = window.location.pathname;
    const protocol = window.location.protocol;
    const normalizedPath = (path.length > 1 && path.endsWith('/')) ? path.slice(0, -1) : path;
    const publicPages = ['/', '/index', '/welcome', '/index.html', '/welcome.html'];
    const authPages = ['/auth', '/auth.html', '/onboarding', '/onboarding.html'];
    const dashPages = ['/elder-dashboard', '/elder-dashboard.html', '/youth-dashboard', '/youth-dashboard.html'];

    try {
      if (protocol.includes('chrome-error')) return;
      
      const isPublic = publicPages.includes(normalizedPath);
      const isAuth = authPages.includes(normalizedPath);
      const isDash = dashPages.includes(normalizedPath);
      
      if (!isPublic && !isAuth && !isDash) {
        if (!this.isLoggedIn()) {
          window.location.replace('/welcome');
          return;
        }
        if (this.currentUser && (!this.currentUser.role || this.currentUser.onboarding_status === undefined)) {
          console.warn('Corrupt user session detected. Logging out.');
          this.logout();
          return;
        }
      }
      
      if (normalizedPath === '/auth' || normalizedPath === '/auth.html') {
        // ALWAYS allow access to auth page - don't check login state, don't redirect
        // User may want to register a new account or switch accounts
        return;
      }
      
      if (normalizedPath === '/' || isAuth) {
        if (this.isLoggedIn() && this.currentUser) {
          // Check if this is a fresh registration attempt (URL params)
          const params = new URLSearchParams(window.location.search);
          const isSignupAttempt = params.get('mode') === 'signup' || params.get('role');
          
          // Only redirect to dashboard if NOT a signup attempt
          if (!isSignupAttempt) {
            const role = this.currentUser.role;
            const status = this.currentUser.onboarding_status;
            if (!status) {
              window.location.replace('/onboarding.html');
            } else {
              window.location.replace(role === 'elder' ? '/elder-dashboard.html' : '/youth-dashboard.html');
            }
            return;
          }
        }
      }
    } catch (err) {
      console.error('App Init Guard Error:', err);
    }

    // Register service worker
    if ('serviceWorker' in navigator && !protocol.includes('chrome-error')) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  },

  loadUser() {
    // 🚨 Nuclear Reset: Detect and purge "poisoned" localStorage data
    try {
      const raw = localStorage.getItem('inkomoko_user');
      if (raw === 'undefined' || raw === 'null' || (raw && raw.includes('"onboarding_status":undefined'))) {
        console.warn('Poisoned app state detected (onboarding_status). Purging session.');
        localStorage.removeItem('inkomoko_user');
        localStorage.removeItem('inkomoko_token');
        this.currentUser = null;
        return;
      }
    } catch(e) {}

    const userData = localStorage.getItem('inkomoko_user');
    if (userData && userData !== 'undefined' && userData !== 'null') {
      try { 
        const parsed = JSON.parse(userData); 
        if (parsed && typeof parsed === 'object') {
          this.currentUser = parsed;
        } else {
          this.currentUser = null;
        }
      } catch(e) { 
        this.currentUser = null; 
      }
    } else {
      this.currentUser = null;
    }
  },

  setUser(user) {
    if (user && typeof user === 'object') {
      this.currentUser = user;
      localStorage.setItem('inkomoko_user', JSON.stringify(user));
    } else {
      this.currentUser = null;
      localStorage.removeItem('inkomoko_user');
    }
  },

  isLoggedIn() {
    const hasToken = !!API.getToken();
    const hasUser = this.currentUser && typeof this.currentUser === 'object' && this.currentUser.id;
    return hasToken && !!hasUser;
  },

  isElder() {
    return this.currentUser && this.currentUser.role === 'elder';
  },

  isYouth() {
    return this.currentUser && this.currentUser.role === 'youth';
  },

  logout() {
    API.setToken(null);
    this.setUser(null);
    window.location.href = '/';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/auth';
      return false;
    }
    return true;
  },

  // Format duration from seconds
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  // Time ago
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

  // Show toast notification
  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
      z-index: 100; padding: 16px 24px; border-radius: 16px;
      font-family: var(--font-label); font-weight: 600; font-size: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12); animation: fadeIn 0.3s ease-out;
      max-width: 90vw; text-align: center;
      background: ${type === 'error' ? 'var(--error-container)' : type === 'success' ? '#d4edda' : 'var(--surface-container-lowest)'};
      color: ${type === 'error' ? 'var(--on-error-container)' : 'var(--on-surface)'};
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  setupOnlineIndicator() {
    window.addEventListener('offline', () => {
      this.showToast('You are offline. Changes will be saved when you reconnect.', 'info');
    });
    window.addEventListener('online', () => {
      this.showToast('You are back online!', 'success');
    });
  },

  // Generate placeholder avatar
  avatarUrl(user) {
    if (user && user.avatar_url && !user.avatar_url.startsWith('/uploads/avatars/')) {
      return user.avatar_url;
    }
    // Return a colored circle with initials
    const name = (user && user.full_name) || 'U';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#c2410c" rx="50"/><text x="50" y="55" text-anchor="middle" dy=".1em" fill="white" font-family="sans-serif" font-size="36" font-weight="bold">${initials}</text></svg>`)}`;
  }
};

// Helper: create element with attributes
function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'class' || key === 'className') element.className = val;
    else if (key === 'style' && typeof val === 'object') Object.assign(element.style, val);
    else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), val);
    else element.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  }
  return element;
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => App.init());
