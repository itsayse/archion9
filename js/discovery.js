/**
 * Phase 2 — "The Discovery". Runs the fake terminal boot / decryption
 * animation once the hidden file is clicked, then hands off to the
 * collapse sequence (Phase 3).
 */
(function () {
  const { bootLines } = window.ARCHION9.config;
  const bootLog = document.getElementById('bootLog');
  const loadFill = document.getElementById('bootLoadFill');

  let running = false;

  function typeLine(lineObj) {
    return new Promise((resolve) => {
      const span = document.createElement('div');
      if (lineObj.cls) span.className = lineObj.cls;
      bootLog.appendChild(span);

      const text = lineObj.text;
      let i = 0;
      const speed = Math.max(10, Math.min(28, 700 / text.length));

      (function typeChar() {
        if (i <= text.length) {
          span.textContent = text.slice(0, i) + (i < text.length ? '' : '');
          i++;
          setTimeout(typeChar, speed);
        } else {
          resolve();
        }
      })();
    });
  }

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function runBootSequence() {
    bootLog.innerHTML = '';
    loadFill.style.width = '0%';

    let progress = 0;
    const progressStep = 100 / bootLines.length;

    for (const line of bootLines) {
      await typeLine(line);
      progress += progressStep;
      loadFill.style.width = `${Math.min(100, progress)}%`;
      await wait(line.delay);
    }
  }

  async function begin() {
    if (running || window.ARCHION9.state.hasDiscovered) return;
    running = true;
    window.ARCHION9.state.hasDiscovered = true;
    window.ARCHION9.state.scene = 'boot';
    document.body.setAttribute('data-scene', 'boot');

    window.ARCHION9.audio.play('click', { volume: 0.22 });

    // Soft glitch on the surface world right before it cuts to the boot screen.
    window.ARCHION9.glitch.setGlitch('soft');
    window.ARCHION9.glitch.setRgbSplit(true);
    window.ARCHION9.audio.play('glitch', { volume: 0.28 });
    await wait(650);
    window.ARCHION9.glitch.setGlitch('hard');
    await wait(350);

    document.getElementById('sceneBoot').setAttribute('aria-hidden', 'false');
    window.ARCHION9.audio.play('boot', { volume: 0.28 });

    await runBootSequence();
    await wait(500);

    window.ARCHION9.glitch.setGlitch('off');
    window.ARCHION9.glitch.setRgbSplit(false);

    // Hand off to Phase 3.
    window.ARCHION9.collapse.begin();
    running = false;
  }

  window.ARCHION9.discovery = { begin };
})();
