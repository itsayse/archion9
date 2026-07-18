/**
 * File Explorer easter egg — lives on the Phase 5 hidden-Earth desktop.
 * Two panels, both backed by real public APIs (no key needed):
 *   - Discord presence, via Lanyard (https://api.lanyard.rest)
 *   - GitHub repos, via the public GitHub REST API
 * Both calls are best-effort: any network failure, missing config, or
 * CORS hiccup just falls back to a quiet status line instead of breaking
 * anything else on the page.
 */
(function () {
  const { social } = window.ARCHION9.config;

  const STATUS_LABEL = {
    online: 'online right now',
    idle: 'idle',
    dnd: 'do not disturb',
    offline: 'offline',
  };

  function setDiscordState(dotClass, text) {
    const statusEl = document.getElementById('explorerDiscordStatus');
    const dot = statusEl ? statusEl.querySelector('.explorer-status__dot') : null;
    const label = document.getElementById('explorerDiscordText');
    if (!dot || !label) return;
    dot.className = `explorer-status__dot explorer-status__dot--${dotClass}`;
    label.textContent = text;
  }

  async function loadDiscordStatus() {
    if (!social.discordUserId) {
      setDiscordState('offline', 'no discord id configured — see js/config.js');
      return;
    }
    setDiscordState('loading', 'checking signal...');
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${social.discordUserId}`);
      if (!res.ok) throw new Error('lanyard request failed');
      const json = await res.json();
      if (!json.success) throw new Error('lanyard: user not tracked');
      const status = json.data.discord_status || 'offline';
      const label = STATUS_LABEL[status] || status;
      setDiscordState(status, `itsayse is ${label}`);
    } catch (err) {
      setDiscordState('offline', 'signal unreachable — try again later');
    }
  }

  function renderRepoList(items) {
    const list = document.getElementById('explorerRepoList');
    if (!list) return;
    list.innerHTML = '';
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'explorer-file explorer-file--empty';
      li.textContent = 'directory is empty.';
      list.appendChild(li);
      return;
    }
    items.forEach((repo) => {
      const a = document.createElement('a');
      a.className = 'explorer-file';
      a.href = repo.html_url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      const name = document.createElement('span');
      name.className = 'explorer-file__name';
      name.textContent = `${repo.name}/`;
      const desc = document.createElement('span');
      desc.className = 'explorer-file__desc';
      desc.textContent = repo.description || 'no description.';
      a.appendChild(name);
      a.appendChild(desc);
      list.appendChild(a);
    });
  }

  async function loadRepos() {
    const list = document.getElementById('explorerRepoList');
    if (!social.githubUsername) {
      if (list) list.innerHTML = '<li class="explorer-file explorer-file--empty">no github username configured.</li>';
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/users/${social.githubUsername}/repos?sort=updated&per_page=6`);
      if (!res.ok) throw new Error('github request failed');
      const repos = await res.json();
      renderRepoList(Array.isArray(repos) ? repos : []);
    } catch (err) {
      if (list) list.innerHTML = '<li class="explorer-file explorer-file--empty">couldn\'t reach the directory. try again later.</li>';
    }
  }

  /** Called each time the File Explorer window is opened. Cheap to call
   *  more than once — it just re-fetches both panels. */
  function refresh() {
    loadDiscordStatus();
    loadRepos();
  }

  window.ARCHION9.explorer = { refresh };
})();
