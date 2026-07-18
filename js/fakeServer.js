/**
 * Phase 1 — renders the fake file index and keeps its ambient stats
 * (uptime, clock, connection count) ticking so the page feels alive
 * before anything strange happens.
 */
(function () {
  const { fakeFiles, typeIcons } = window.ARCHION9.config;

  const tbody = document.getElementById('fileTableBody');
  const uptimeStat = document.getElementById('uptimeStat');
  const clockStat = document.getElementById('clockStat');
  const connCount = document.getElementById('connCount');
  const statusWord = document.getElementById('statusWord');

  const BOOT_TIME = Date.now() - (214 * 86400 + 13 * 3600 + 27 * 60) * 1000;

  function pad(n) { return String(n).padStart(2, '0'); }

  function renderFiles() {
    const rows = fakeFiles.map((f, i) => {
      const classes = ['file-row'];
      if (f.isDir) classes.push('file-row--dir');
      if (f.secret) classes.push('file-row--secret', 'file-row--clickable');
      if (i % 2 === 1) classes.push('file-row--odd');
      const icon = typeIcons[f.type] || '[?]';
      return `
        <tr class="${classes.join(' ')}" data-index="${i}" ${f.secret ? 'data-secret-trigger="true" tabindex="0" role="button" aria-label="open file"' : ''}>
          <td class="col-name"><span class="file-name"><span class="file-icon">${icon}</span>${f.name}</span></td>
          <td class="col-size">${f.size}</td>
          <td class="col-mod">${f.mod}</td>
          <td class="col-type">${f.type}</td>
        </tr>`;
    }).join('');
    tbody.innerHTML = rows;
  }

  function tickClock() {
    const now = new Date();
    clockStat.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const diff = Date.now() - BOOT_TIME;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    uptimeStat.textContent = `uptime ${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  function driftConnections() {
    const base = 1 + Math.floor(Math.random() * 3);
    connCount.textContent = base;
    const words = ['idle', 'idle', 'idle', 'syncing', 'idle'];
    statusWord.textContent = words[Math.floor(Math.random() * words.length)];
  }

  function init() {
    renderFiles();
    tickClock();
    setInterval(tickClock, 1000);
    driftConnections();
    setInterval(driftConnections, 6000);

    tbody.addEventListener('click', (e) => {
      const row = e.target.closest('[data-secret-trigger]');
      if (row) window.ARCHION9.discovery.begin();
    });
    tbody.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const row = e.target.closest('[data-secret-trigger]');
      if (row) { e.preventDefault(); window.ARCHION9.discovery.begin(); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
