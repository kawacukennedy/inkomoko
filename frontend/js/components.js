'use strict';

const Components = {
  topAppBar({ showMenu = true, showNav = false, showProfile = true, backButton = false, title = 'The Living Archive' } = {}) {
    const userAvatar = App.currentUser ? App.avatarUrl(App.currentUser) : '';
    const profileHref = App.isElder() ? '/elder-dashboard.html' : '/youth-dashboard.html';

    return `
      <header class="top-app-bar" id="topAppBar">
        <div class="top-app-bar-inner">
          <div class="flex items-center gap-4">
            ${backButton ? this.backButton() : showMenu ? this.menuButton() : ''}
            <h1 class="brand">${title}</h1>
          </div>
          <div class="flex items-center gap-4">
            ${showNav ? this.desktopNav() : ''}
            ${showProfile && App.isLoggedIn() ? this.profileAvatar(profileHref, userAvatar) : ''}
          </div>
        </div>
      </header>`;
  },

  backButton() {
    return `<button onclick="history.back()" class="tap-target" aria-label="Go back">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>`;
  },

  menuButton() {
    return `<button onclick="Components.toggleDrawer()" class="tap-target" aria-label="Open menu">
      <span class="material-symbols-outlined">menu</span>
    </button>`;
  },

  desktopNav() {
    return `
      <nav class="hide-mobile flex gap-8 items-center" style="margin-right: 2rem">
        <a href="/" class="nav-link">Home</a>
        <a href="/library.html" class="nav-link">Library</a>
        <a href="/explore.html" class="nav-link">Explore</a>
      </nav>`;
  },

  profileAvatar(href, avatarUrl) {
    return `
      <a href="${href}">
        <img src="${avatarUrl}" alt="Profile"
             style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--primary-container); object-fit: cover"
             loading="lazy">
      </a>`;
  },

  bottomNav(activePage = 'home') {
    const isElder = App.isElder();
    const isYouth = App.isYouth();

    const items = [
      { id: 'home', icon: 'history_edu', label: 'Home', href: isElder ? '/elder-dashboard.html' : isYouth ? '/youth-dashboard.html' : '/' },
      { id: 'library', icon: 'menu_book', label: 'Library', href: '/library.html' },
      { id: 'record', icon: 'mic_none', label: 'Record', href: '/record.html' },
      { id: 'profile', icon: 'person', label: 'Profile', href: '/settings.html' },
    ];

    return `
      <nav class="bottom-nav" id="bottomNav">
        ${items.map(item => this.navItem(item, item.id === activePage)).join('')}
      </nav>`;
  },

  navItem(item, isActive) {
    const iconStyle = isActive ? `style="font-variation-settings: 'FILL' 1"` : '';

    return `
      <a href="${item.href}" class="bottom-nav-item ${isActive ? 'active' : ''}">
        <span class="material-symbols-outlined${isActive ? ' filled' : ''}" ${iconStyle}>${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </a>`;
  },

  storyCard(story, variant = 'default') {
    if (variant === 'large') {
      return this.largeStoryCard(story);
    }
    return this.defaultStoryCard(story);
  },

  largeStoryCard(story) {
    return `
      <div class="card story-card-large" onclick="window.location.href='/story.html?id=${story.id}'">
        <div class="story-card-overlay"></div>
        <div class="story-card-content">
          <div class="story-card-category">
            <span class="material-symbols-outlined filled">stars</span>
            <span>${story.category || 'Story'}</span>
          </div>
          <h4 class="story-card-title">${story.title}</h4>
          <div class="story-card-footer">
            <button class="btn-play" aria-label="Play story">
              <span class="material-symbols-outlined filled">play_arrow</span>
            </button>
            <div class="story-card-plays">
              <p>Listeners</p>
              <p>${story.play_count || 0} Plays</p>
            </div>
          </div>
        </div>
      </div>`;
  },

  defaultStoryCard(story) {
    const duration = App.formatDuration(story.duration_seconds);
    const authorAvatar = App.avatarUrl({ full_name: story.author_name });

    return `
      <div class="card story-card" onclick="window.location.href='/story.html?id=${story.id}'">
        <div class="story-card-body">
          <div class="story-card-header">
            <span class="story-card-category-small">${story.category || 'Story'}</span>
            <span class="story-card-duration">${duration}</span>
          </div>
          <h4 class="story-card-title-small">${story.title}</h4>
          ${story.description ? `<p class="story-card-description">${story.description}</p>` : ''}
          <div class="story-card-author">
            <img src="${authorAvatar}" alt="${story.author_name}" loading="lazy">
            <span>${story.author_name || 'Elder'}</span>
          </div>
        </div>
      </div>`;
  },

  waveformPlayer(heights = [2, 4, 6, 3, 5, 7, 4, 6, 3, 2]) {
    const midpoint = heights.length / 2;

    return `
      <div class="waveform-player">
        ${heights.map((h, i) => `<div class="waveform-bar" style="height: ${h * 4}px; background: ${i < midpoint ? 'var(--primary)' : 'var(--outline-variant)'}"></div>`).join('')}
      </div>`;
  },

  floatingPlayer(story) {
    if (!story) return '';

    return `
      <div id="floatingPlayer" class="floating-player">
        <div class="floating-player-thumb">
          <span class="material-symbols-outlined filled">play_arrow</span>
        </div>
        <div class="floating-player-info">
          <p class="floating-player-label">Now Playing</p>
          <p class="floating-player-title">${story.title}</p>
        </div>
        <div class="floating-player-waveform">
          <div class="animate-pulse" style="animation-delay: 0s"></div>
          <div class="animate-pulse" style="animation-delay: 0.1s"></div>
          <div class="animate-pulse" style="animation-delay: 0.2s"></div>
          <div class="animate-pulse" style="animation-delay: 0.3s"></div>
        </div>
      </div>`;
  },

  toggleDrawer() {
    const drawer = document.getElementById('navDrawer');

    if (drawer) {
      drawer.remove();
      const overlay = document.getElementById('drawerOverlay');
      if (overlay) overlay.remove();
      return;
    }

    this.createDrawer();
  },

  createDrawer() {
    const overlay = document.createElement('div');
    overlay.id = 'drawerOverlay';
    overlay.className = 'drawer-overlay';
    overlay.onclick = () => this.toggleDrawer();
    document.body.appendChild(overlay);

    const drawer = document.createElement('aside');
    drawer.id = 'navDrawer';
    drawer.className = 'nav-drawer';
    drawer.innerHTML = this.drawerContent();
    document.body.appendChild(drawer);
  },

  drawerContent() {
    const userName = App.currentUser ? App.currentUser.full_name : 'Guest';
    const userAvatar = App.currentUser ? App.avatarUrl(App.currentUser) : '';

    const navItems = [
      { icon: 'history_edu', label: 'Home', href: '/' },
      { icon: 'menu_book', label: 'Library', href: '/library.html' },
      { icon: 'explore', label: 'Explore', href: '/explore.html' },
      { icon: 'groups', label: 'Family Space', href: '/family.html' },
      { icon: 'manage_accounts', label: 'Family Manager', href: '/family-manager.html' },
      { icon: 'settings', label: 'Settings', href: '/settings.html' },
    ];

    return `
      <div class="drawer-header">
        <div class="drawer-avatar">
          ${userAvatar ? `<img src="${userAvatar}" alt="${userName}">` : ''}
        </div>
        <div class="drawer-user-info">
          <h4>${userName}</h4>
          <p>The Living Archive</p>
        </div>
      </div>
      <nav class="drawer-nav">
        ${navItems.map(item => `
          <a href="${item.href}" class="drawer-nav-item">
            <span class="material-symbols-outlined">${item.icon}</span>
            ${item.label}
          </a>
        `).join('')}
      </nav>
      ${App.isLoggedIn() ? `
        <button onclick="App.logout()" class="drawer-logout">
          <span class="material-symbols-outlined">logout</span>
          Logout
        </button>
      ` : `
        <a href="/auth.html" class="drawer-signin">
          <span class="material-symbols-outlined">login</span>
          Sign In
        </a>
      `}`;
  },
};
