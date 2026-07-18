/**
 * Small reusable glitch toolkit shared by the discovery and collapse
 * sequences. Kept isolated so effects can be tuned in one place.
 */
(function () {
  const rgbSplit = document.getElementById('rgbSplit');

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function setGlitch(level) {
    // level: 'off' | 'soft' | 'hard'
    document.body.classList.remove('glitching', 'glitch-hard');
    if (level === 'soft') document.body.classList.add('glitching');
    if (level === 'hard') document.body.classList.add('glitching', 'glitch-hard');
  }

  function setRgbSplit(active) {
    rgbSplit.classList.toggle('is-active', !!active);
  }

  /** Quick single flash of the blackout layer used for transitions. */
  function blackoutFlash() {
    const el = document.getElementById('blackout');
    el.classList.remove('is-active');
    // force reflow so the animation can restart
    void el.offsetWidth;
    el.classList.add('is-active');
  }

  /** Same flash, tinted a colour — used for the konami/hack easter eggs.
   *  Accepts an optional duration (ms) so bigger moments (like the nuke)
   *  can hold a longer, brighter flash than the default transition. */
  function colorFlash(color, duration = 1500) {
    const el = document.getElementById('blackout');
    const prevBg = el.style.background;
    el.style.background = color;
    el.classList.remove('is-active');
    void el.offsetWidth;
    el.style.animationDuration = `${duration}ms`;
    el.classList.add('is-active');
    setTimeout(() => {
      el.style.background = prevBg;
      el.style.animationDuration = '';
    }, duration);
  }

  /** Reusable particle burst, shared by the collapse sequence and any
   *  later easter egg that wants a quick explosion of shrapnel. */
  function burst(count = 40, opts = {}) {
    const layer = document.getElementById('collapseLayer');
    if (!layer) return;
    const colors = opts.colors || ['#45f2df', '#7b2ff7', '#ff2e92', '#eaf3ff', '#ffb400'];
    const spread = opts.spread || 240;
    const duration = opts.duration || 1400;
    layer.innerHTML = '';
    layer.classList.add('is-active');

    for (let i = 0; i < count; i++) {
      const frag = document.createElement('div');
      frag.className = 'shatter-fragment';
      const size = rand(3, 20);
      frag.style.width = `${size}px`;
      frag.style.height = `${size * rand(0.3, 1)}px`;
      frag.style.left = `${rand(30, 70)}%`;
      frag.style.top = `${rand(30, 70)}%`;
      const color = colors[i % colors.length];
      frag.style.background = color;
      frag.style.opacity = '0.9';
      frag.style.boxShadow = `0 0 10px ${color}`;

      const angle = rand(0, Math.PI * 2);
      const dist = rand(spread * 0.3, spread);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const rot = rand(-260, 260);
      const life = rand(duration * 0.6, duration);

      frag.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 0.95 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(0.25)`, opacity: 0 },
      ], {
        duration: life,
        delay: rand(0, 120),
        easing: 'cubic-bezier(.16,.84,.44,1)',
        fill: 'forwards',
      });

      layer.appendChild(frag);
    }

    setTimeout(() => {
      layer.classList.remove('is-active');
      layer.innerHTML = '';
    }, duration + 200);
  }

  /** Brief camera-shake on the currently visible scene. */
  function shake(selector, ms = 500) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.add('is-shaking');
    setTimeout(() => el.classList.remove('is-shaking'), ms);
  }

  /** Rips the screen open along a jagged seam, holds, then seals back up. */
  function tearScreen({ hold = 280 } = {}) {
    const el = document.getElementById('screenTear');
    if (!el) return;
    el.classList.remove('is-open');
    el.classList.add('is-active');
    void el.offsetWidth;
    el.classList.add('is-open');
    setTimeout(() => {
      el.classList.remove('is-open');
      setTimeout(() => el.classList.remove('is-active'), 460);
    }, 380 + hold);
  }

  /** Drops an incoming missile down the middle of the screen with a flame
   *  trail, then detonates it into a bright flash + shockwave burst. Used
   *  by the `nuke` failsafe. `onImpact` fires the moment it hits (for
   *  sound/shake), `onDone` fires once the effect has fully cleared. */
  function missileStrike({ onImpact, onDone } = {}) {
    const missile = document.createElement('div');
    missile.className = 'missile';
    missile.innerHTML = '<div class="missile__flame"></div><div class="missile__body"></div><div class="missile__tip"></div>';
    document.body.appendChild(missile);
    void missile.offsetWidth;
    missile.classList.add('is-falling');

    setTimeout(() => {
      missile.remove();

      const impact = document.createElement('div');
      impact.className = 'missile-impact';
      document.body.appendChild(impact);
      void impact.offsetWidth;
      impact.classList.add('is-exploding');

      if (typeof onImpact === 'function') onImpact();
      burst(60, { colors: ['#fff', '#ffcf6b', '#ff5b1f', '#ff8a00'], spread: 260, duration: 900 });

      setTimeout(() => {
        impact.remove();
        if (typeof onDone === 'function') onDone();
      }, 700);
    }, 900);
  }

  window.ARCHION9.glitch = { setGlitch, setRgbSplit, blackoutFlash, colorFlash, burst, shake, tearScreen, missileStrike };
})();
