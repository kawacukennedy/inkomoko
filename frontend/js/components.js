/* ============================================================
   Inkomoko — Shared UI Components
   Reusable header, nav, and component generators
   ============================================================ */

const Components = {

  // Top App Bar
  topAppBar({ showMenu = true, showNav = false, showProfile = true, backButton = false, title = 'The Living Archive' } = {}) {
    const userAvatar = App.currentUser ? App.avatarUrl(App.currentUser) : '';

    return `
    <header class="top-app-bar" id="topAppBar">
      <div class="top-app-bar-inner">
        <div class="flex items-center gap-4">
          ${backButton ? `
            <button onclick="history.back()" class="tap-target" style="color:var(--primary);padding:8px;border-radius:50%;display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
          ` : showMenu ? `
            <button onclick="Components.toggleDrawer()" class="tap-target" style="color:var(--primary);padding:8px;border-radius:50%;display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-outlined">menu</span>
            </button>
          ` : ''}
          <h1 class="brand">${title}</h1>
        </div>
        <div class="flex items-center gap-4">
          ${showNav ? `
            <nav class="hide-mobile flex gap-8 items-center" style="margin-right:2rem">
              <a href="/" style="font-family:var(--font-headline);font-size:1.125rem;font-weight:700;color:var(--primary)">Home</a>
              <a href="/library.html" style="font-family:var(--font-headline);font-size:1.125rem;font-weight:700;color:rgba(28,28,19,0.6)">Library</a>
              <a href="/explore.html" style="font-family:var(--font-headline);font-size:1.125rem;font-weight:700;color:rgba(28,28,19,0.6)">Explore</a>
            </nav>
          ` : ''}
          ${showProfile && App.isLoggedIn() ? `
            <a href="${App.isElder() ? '/elder-dashboard.html' : '/youth-dashboard.html'}">
              <img src="${userAvatar}" alt="Profile"
                   style="width:40px;height:40px;border-radius:50%;border:2px solid var(--primary-container);object-fit:cover" loading="lazy">
            </a>
          ` : ''}
        </div>
      </div>
    </header>`;
  },

  // Bottom Navigation
  bottomNav(activePage = 'home') {
    const items = [
      { id: 'home', icon: 'history_edu', label: 'Home', href: App.isElder() ? '/elder-dashboard.html' : App.isYouth() ? '/youth-dashboard.html' : '/' },
      { id: 'library', icon: 'menu_book', label: 'Library', href: '/library.html' },
      { id: 'record', icon: 'mic_none', label: 'Record', href: '/record.html' },
      { id: 'profile', icon: 'person', label: 'Profile', href: '/settings.html' },
    ];

    return `
    <nav class="bottom-nav" id="bottomNav">
      ${items.map(item => `
        <a href="${item.href}" class="bottom-nav-item ${item.id === activePage ? 'active' : ''}">
          <span class="material-symbols-outlined${item.id === activePage ? ' filled' : ''}"
                ${item.id === activePage ? 'style="font-variation-settings: \'FILL\' 1"' : ''}>${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </a>
      `).join('')}
    </nav>`;
  },

  // Story Card
  storyCard(story, variant = 'default') {
    const duration = App.formatDuration(story.duration_seconds);
    const authorAvatar = App.avatarUrl({ full_name: story.author_name });

    if (variant === 'large') {
      return `
      <div class="card" style="position:relative;overflow:hidden;min-height:400px;cursor:pointer"
           onclick="window.location.href='/story.html?id=${story.id}'">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(53,16,0,0.9),rgba(53,16,0,0.4),transparent)"></div>
        <div style="position:absolute;bottom:0;left:0;padding:2rem;width:100%;z-index:1">
          <div style="display:flex;align-items:center;gap:0.5rem;color:var(--primary-fixed);margin-bottom:0.5rem">
            <span class="material-symbols-outlined filled" style="font-size:14px">stars</span>
            <span style="font-size:12px;font-family:var(--font-label);text-transform:uppercase;letter-spacing:0.1em">${story.category || 'Story'}</span>
          </div>
          <h4 style="font-family:var(--font-headline);font-size:1.5rem;font-weight:900;color:white;margin-bottom:1rem">${story.title}</h4>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <button class="btn-primary" style="width:56px;height:56px;border-radius:50%;padding:0;min-height:auto;background:white;color:var(--primary);box-shadow:0 4px 20px rgba(0,0,0,0.3)">
              <span class="material-symbols-outlined filled" style="font-size:1.75rem">play_arrow</span>
            </button>
            <div style="text-align:right;color:rgba(255,255,255,0.8)">
              <p style="font-size:12px;font-family:var(--font-label)">Listeners</p>
              <p style="font-family:var(--font-headline);font-weight:700">${story.play_count || 0} Plays</p>
            </div>
          </div>
        </div>
      </div>`;
    }

    return `
    <div class="card" style="cursor:pointer;border:1px solid rgba(225,191,181,0.1)"
         onclick="window.location.href='/story.html?id=${story.id}'">
      <div style="padding:1.5rem;display:flex;flex-direction:column;gap:1rem">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <span style="font-size:12px;font-family:var(--font-label);text-transform:uppercase;letter-spacing:0.1em;color:var(--primary-container);font-weight:700">${story.category || 'Story'}</span>
          </div>
          <span style="font-size:12px;font-family:var(--font-label);text-transform:uppercase;color:var(--primary-container);font-weight:700">${duration}</span>
        </div>
        <h4 style="font-family:var(--font-headline);font-size:1.25rem;font-weight:700;color:var(--on-surface)">${story.title}</h4>
        ${story.description ? `<p style="color:var(--on-surface-variant);font-size:0.875rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${story.description}</p>` : ''}
        <div style="display:flex;align-items:center;gap:0.75rem;margin-top:auto">
          <img src="${authorAvatar}" alt="${story.author_name}" style="width:28px;height:28px;border-radius:50%;object-fit:cover" loading="lazy">
          <span style="font-size:0.875rem;font-weight:500;color:var(--on-surface-variant)">${story.author_name || 'Elder'}</span>
        </div>
      </div>
    </div>`;
  },

  // Waveform mini player
  waveformPlayer(heights = [2,4,6,3,5,7,4,6,3,2]) {
    return `
    <div style="display:flex;align-items:end;justify-content:space-around;gap:2px;height:24px;flex:1">
      ${heights.map((h, i) => `
        <div style="width:3px;height:${h * 4}px;background:${i < heights.length / 2 ? 'var(--primary)' : 'var(--outline-variant)'};border-radius:2px"></div>
      `).join('')}
    </div>`;
  },

  // Floating Audio Player
  floatingPlayer(story) {
    if (!story) return '';
    return `
    <div id="floatingPlayer" style="position:fixed;bottom:100px;left:1.5rem;right:1.5rem;z-index:40;background:rgba(255,255,255,0.8);backdrop-filter:blur(24px);border-radius:1rem;box-shadow:0 8px 30px rgba(28,28,19,0.15);padding:1rem;display:flex;align-items:center;gap:1rem;border:1px solid rgba(225,191,181,0.2)">
      <div style="width:48px;height:48px;border-radius:0.75rem;background:var(--primary-container);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <span class="material-symbols-outlined filled" style="color:white">play_arrow</span>
      </div>
      <div style="flex:1;min-width:0">
        <p style="font-size:12px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:-0.02em">Now Playing</p>
        <p style="font-size:0.875rem;font-weight:600;color:var(--on-surface);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${story.title}</p>
      </div>
      <div style="display:flex;align-items:center;gap:2px;width:40px;height:24px">
        <div style="width:3px;height:12px;background:var(--primary-container);border-radius:2px" class="animate-pulse"></div>
        <div style="width:3px;height:20px;background:var(--primary-container);border-radius:2px" class="animate-pulse" style="animation-delay:0.1s"></div>
        <div style="width:3px;height:16px;background:var(--primary-container);border-radius:2px" class="animate-pulse" style="animation-delay:0.2s"></div>
        <div style="width:3px;height:24px;background:var(--primary-container);border-radius:2px" class="animate-pulse" style="animation-delay:0.3s"></div>
      </div>
    </div>`;
  },

  // Navigation Drawer
  toggleDrawer() {
    let drawer = document.getElementById('navDrawer');
    let overlay = document.getElementById('drawerOverlay');
    if (drawer) {
      drawer.remove();
      if (overlay) overlay.remove();
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'drawerOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:59;';
    overlay.onclick = () => Components.toggleDrawer();
    document.body.appendChild(overlay);

    drawer = document.createElement('aside');
    drawer.id = 'navDrawer';
    drawer.style.cssText = `position:fixed;left:0;top:0;height:100%;width:300px;background:var(--surface-container-low);box-shadow:8px 0 30px rgba(0,0,0,0.1);z-index:60;padding:2rem;display:flex;flex-direction:column;gap:1.5rem;animation:fadeIn 0.3s ease-out;border-radius:0 2rem 2rem 0;`;
    drawer.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem">
        <div style="width:48px;height:48px;border-radius:1rem;overflow:hidden;border:2px solid var(--primary-container)">
          ${App.currentUser ? `<img src="${App.avatarUrl(App.currentUser)}" style="width:100%;height:100%;object-fit:cover">` : ''}
        </div>
        <div>
          <h4 style="font-family:var(--font-headline);color:var(--primary);font-weight:700">${App.currentUser ? App.currentUser.full_name : 'Guest'}</h4>
          <p style="font-size:12px;color:var(--on-surface-variant)">The Living Archive</p>
        </div>
      </div>
      <nav style="display:flex;flex-direction:column;gap:0.25rem">
        <a href="/" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">history_edu</span> Home
        </a>
        <a href="/library.html" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">menu_book</span> Library
        </a>
        <a href="/explore.html" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">explore</span> Explore
        </a>
        <a href="/family.html" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">groups</span> Family Space
        </a>
        <a href="/family-manager.html" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">manage_accounts</span> Family Manager
        </a>
        <a href="/settings.html" style="display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--on-surface);font-weight:500;transition:all 0.3s">
          <span class="material-symbols-outlined">settings</span> Settings
        </a>
      </nav>
      ${App.isLoggedIn() ? `
        <button onclick="App.logout()" style="margin-top:auto;display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--error);font-weight:600;width:100%">
          <span class="material-symbols-outlined">logout</span> Logout
        </button>
      ` : `
        <a href="/auth.html" style="margin-top:auto;display:flex;align-items:center;gap:1rem;padding:1rem;border-radius:0.75rem;color:var(--primary);font-weight:600">
          <span class="material-symbols-outlined">login</span> Sign In
        </a>
      `}
    `;
    document.body.appendChild(drawer);
  }
};
