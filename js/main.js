/**
 * Orchestrates cross-cutting behaviour that doesn't belong to any single
 * phase: returning to the surface world, and focusing the terminal once
 * the universe reveal finishes.
 */
(function () {
  const termInput = document.getElementById('termInput');
  const cursor = document.getElementById('customCursor');

  /** Esc steps back one world at a time: desktop -> universe -> server. */
  function returnToSurface() {
    const scene = window.ARCHION9.state.scene;

    if (scene === 'desktop') {
      document.body.setAttribute('data-scene', 'universe');
      window.ARCHION9.state.scene = 'universe';
      document.getElementById('sceneDesktop').setAttribute('aria-hidden', 'true');
      document.getElementById('sceneUniverse').setAttribute('aria-hidden', 'false');
      window.ARCHION9.audio.fadeOut('startup', 200);
      window.ARCHION9.audio.play('ambient', { loop: true, volume: 0.18 });
      return;
    }

    if (scene === 'universe') {
      document.body.setAttribute('data-scene', 'server');
      window.ARCHION9.state.scene = 'server';
      document.getElementById('sceneUniverse').setAttribute('aria-hidden', 'true');
      cursor.classList.remove('is-visible');
      window.ARCHION9.audio.fadeOut('ambient', 600);
      window.ARCHION9.universe.stopMatrixRain();
      // Allow the discovery to be re-triggered.
      window.ARCHION9.state.hasDiscovered = false;
      if (window.ARCHION9.terminal && window.ARCHION9.terminal.resetHack) {
        window.ARCHION9.terminal.resetHack();
      }
    }
  }

  /** Used by the "nuke" failsafe — drops straight back to the surface
   *  regardless of how many worlds deep the visitor currently is. */
  function returnToSurfaceFully() {
    const scene = window.ARCHION9.state.scene;
    if (scene === 'server') return;
    document.body.setAttribute('data-scene', 'server');
    window.ARCHION9.state.scene = 'server';
    document.getElementById('sceneUniverse').setAttribute('aria-hidden', 'true');
    document.getElementById('sceneDesktop').setAttribute('aria-hidden', 'true');
    cursor.classList.remove('is-visible');
    window.ARCHION9.audio.fadeOut('ambient', 400);
    window.ARCHION9.audio.fadeOut('startup', 200);
    window.ARCHION9.universe.stopMatrixRain();
    window.ARCHION9.state.hasDiscovered = false;
    if (window.ARCHION9.terminal && window.ARCHION9.terminal.resetHack) {
      window.ARCHION9.terminal.resetHack();
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') returnToSurface();
  });

  window.ARCHION9.main = { returnToSurface, returnToSurfaceFully };

  // Once the universe scene actually becomes visible, focus the terminal
  // so the visitor can start typing immediately.
  const observer = new MutationObserver(() => {
    if (document.body.getAttribute('data-scene') === 'universe') {
      setTimeout(() => termInput && termInput.focus(), 700);
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-scene'] });
})();
