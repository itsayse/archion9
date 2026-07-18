/**
 * Lightweight drag/minimize/close behaviour for the floating "windows"
 * in the hidden universe. No external UI library — just pointer events.
 */
(function () {
  const dock = document.getElementById('minimizedDock');
  const minimized = new Map(); // id -> window element

  function makeDraggable(win) {
    const handle = win.querySelector('[data-drag-handle]');
    let startX, startY, originX, originY, dragging = false;

    handle.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.window__btn')) return;
      dragging = true;
      win.classList.add('is-dragging');
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = `${Math.max(0, originX + dx)}px`;
      win.style.top = `${Math.max(0, originY + dy)}px`;
      win.style.right = 'auto';
    });

    ['pointerup', 'pointercancel'].forEach((evt) => {
      handle.addEventListener(evt, () => {
        dragging = false;
        win.classList.remove('is-dragging');
      });
    });
  }

  function updateDock() {
    dock.classList.toggle('is-visible', minimized.size > 0);
    if (minimized.size === 0) { dock.textContent = ''; return; }
    dock.textContent = `restore ${minimized.size} window${minimized.size > 1 ? 's' : ''}`;
  }

  function minimize(win) {
    win.classList.add('is-minimized');
    minimized.set(win.id, win);
    updateDock();
  }

  function restoreAll() {
    minimized.forEach((win) => win.classList.remove('is-minimized'));
    minimized.clear();
    updateDock();
  }

  function initControls(win) {
    win.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'minimize') minimize(win);
        if (action === 'close') minimize(win); // "closing" just tucks it away — nothing is ever truly gone here
      });
    });
  }

  /** Wires dragging + minimize/close for any window, including ones
   *  created dynamically after the page has already loaded. */
  function registerWindow(win) {
    makeDraggable(win);
    initControls(win);
  }

  /** Reveals a window that started life hidden (e.g. .is-minimized in the
   *  markup), used by terminal commands like `about`. */
  function show(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('is-minimized');
    minimized.delete(win.id);
    updateDock();
  }

  function init() {
    document.querySelectorAll('[data-window]').forEach(registerWindow);
    dock.addEventListener('click', restoreAll);
  }

  document.addEventListener('DOMContentLoaded', init);
  window.ARCHION9.windowManager = { minimize, restoreAll, registerWindow, show };
})();
