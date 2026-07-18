/**
 * Phase 3 — "Reality Breaks". Shatters visible text in the server scene
 * into falling characters, spawns a burst of floating UI fragments, then
 * flashes to black and hands off to the universe reveal.
 */
(function () {
  const collapseLayer = document.getElementById('collapseLayer');

  function rand(min, max) { return Math.random() * (max - min) + min; }

  /** Wraps the text of an element into individually animatable spans. */
  function shatterText(el) {
    const text = el.textContent;
    el.textContent = '';
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'char-shatter';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.setProperty('--dx', `${rand(-60, 60)}px`);
      span.style.setProperty('--dy', `${rand(40, 140)}px`);
      span.style.setProperty('--dr', `${rand(-60, 60)}deg`);
      span.style.setProperty('--delay', `${rand(0, 0.5)}s`);
      el.appendChild(span);
    });
  }

  function spawnFragments(count) {
    collapseLayer.innerHTML = '';
    collapseLayer.classList.add('is-active');
    const colors = ['#ffb400', '#c8d6c6', '#45f2df', '#7b2ff7'];

    for (let i = 0; i < count; i++) {
      const frag = document.createElement('div');
      frag.className = 'shatter-fragment';
      const size = rand(4, 22);
      frag.style.width = `${size}px`;
      frag.style.height = `${size * rand(0.3, 1)}px`;
      frag.style.left = `${rand(0, 100)}%`;
      frag.style.top = `${rand(0, 100)}%`;
      frag.style.background = colors[i % colors.length];
      frag.style.opacity = '0.85';
      frag.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;

      const dx = rand(-200, 200);
      const dy = rand(-260, -40);
      const rot = rand(-180, 180);
      const duration = rand(900, 1700);

      frag.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 0.9 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.3)`, opacity: 0 },
      ], {
        duration,
        delay: rand(0, 300),
        easing: 'cubic-bezier(.16,.84,.44,1)',
        fill: 'forwards',
      });

      collapseLayer.appendChild(frag);
    }
  }

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function begin() {
    window.ARCHION9.state.scene = 'collapse';
    document.body.setAttribute('data-scene', 'collapse');

    window.ARCHION9.audio.play('whoosh', { volume: 0.35 });

    const serverScene = document.getElementById('sceneServer');
    const brand = document.querySelector('.server-topbar__brand');
    const panelHead = document.querySelector('.server-panel__head span');

    // Shatter a couple of headline text elements into falling characters.
    if (brand) shatterText(brand);
    if (panelHead) shatterText(panelHead);

    spawnFragments(50);
    serverScene.classList.add('is-collapsing');

    await wait(1300);
    window.ARCHION9.glitch.blackoutFlash();
    window.ARCHION9.audio.fadeOut('boot', 400);
    await wait(500);

    // Swap scenes while the screen is fully black.
    document.body.setAttribute('data-scene', 'universe');
    window.ARCHION9.state.scene = 'universe';
    document.getElementById('sceneUniverse').setAttribute('aria-hidden', 'false');
    document.getElementById('sceneBoot').setAttribute('aria-hidden', 'true');

    window.ARCHION9.universe.start();
    window.ARCHION9.audio.play('ambient', { loop: true, volume: 0.18 });

    await wait(900);
    collapseLayer.classList.remove('is-active');
    serverScene.classList.remove('is-collapsing');
  }

  window.ARCHION9.collapse = { begin };
})();
