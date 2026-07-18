/**
 * Audio layer, two-tier:
 *   1. If a real file exists at the paths in config.js, it's used.
 *   2. Otherwise every sound is synthesized live with the Web Audio API,
 *      so the experience has real working audio with zero downloads.
 * Nothing here can throw and break the page — audio is a bonus.
 */
(function () {
  const { audio: paths } = window.ARCHION9.config;

  /* ---------------- tier 1: optional real files ---------------- */
  const fileCache = {};
  const fileStatus = {}; // 'loading' | 'available' | 'unavailable'

  function initFile(key) {
    const src = paths[key];
    if (!src) { fileStatus[key] = 'unavailable'; return; }
    fileStatus[key] = 'loading';
    const el = new Audio(src);
    el.preload = 'auto';
    const markAvailable = () => { if (fileStatus[key] !== 'unavailable') fileStatus[key] = 'available'; };
    el.addEventListener('canplaythrough', markAvailable, { once: true });
    el.addEventListener('loadedmetadata', markAvailable, { once: true });
    el.addEventListener('error', () => { fileStatus[key] = 'unavailable'; }, { once: true });
    fileCache[key] = el;
  }
  Object.keys(paths).forEach(initFile);

  function playFile(key, { loop = false, volume = 0.5 } = {}) {
    const el = fileCache[key];
    if (!el) return false;
    try {
      el.loop = loop;
      el.volume = volume;
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
      return true;
    } catch (e) { return false; }
  }

  /* ---------------- tier 2: synthesized fallback ---------------- */
  let actx = null;
  function getCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!actx) { try { actx = new AC(); } catch (e) { return null; } }
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  }

  const activeSynth = {}; // key -> { nodes, intervals, gain }

  function stopSynth(key) {
    const rec = activeSynth[key];
    if (!rec) return;
    rec.intervals.forEach(clearInterval);
    rec.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    try { rec.gain.disconnect(); } catch (e) {}
    delete activeSynth[key];
  }

  function noiseBuffer(c, duration) {
    const size = Math.max(1, Math.floor(c.sampleRate * duration));
    const buf = c.createBuffer(1, size, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  const synthBuilders = {
    click(c, gain) {
      const o = c.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(1600, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(320, c.currentTime + 0.05);
      const g = c.createGain();
      g.gain.setValueAtTime(0.55, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      o.connect(g).connect(gain);
      o.start(); o.stop(c.currentTime + 0.09);
      return { nodes: [o], intervals: [] };
    },
    glitch(c, gain) {
      const src = c.createBufferSource();
      src.buffer = noiseBuffer(c, 0.35);
      const filt = c.createBiquadFilter();
      filt.type = 'bandpass';
      filt.Q.value = 6;
      filt.frequency.setValueAtTime(1400, c.currentTime);
      filt.frequency.linearRampToValueAtTime(250, c.currentTime + 0.35);
      const g = c.createGain();
      [0.35, 0.04, 0.32, 0.05, 0.38, 0.04, 0.22, 0].forEach((v, i) => {
        g.gain.setValueAtTime(v, c.currentTime + i * 0.045);
      });
      src.connect(filt).connect(g).connect(gain);
      src.start(); src.stop(c.currentTime + 0.36);
      return { nodes: [src], intervals: [] };
    },
    whoosh(c, gain) {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(900, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 1.0);
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.4, c.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.0);
      const noise = c.createBufferSource();
      noise.buffer = noiseBuffer(c, 1.0);
      const nf = c.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.setValueAtTime(3000, c.currentTime);
      nf.frequency.exponentialRampToValueAtTime(120, c.currentTime + 1.0);
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.18, c.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.0);
      o.connect(g).connect(gain);
      noise.connect(nf).connect(ng).connect(gain);
      o.start(); noise.start();
      o.stop(c.currentTime + 1.05); noise.stop(c.currentTime + 1.05);
      return { nodes: [o, noise], intervals: [] };
    },
    boot(c, gain) {
      const hum = c.createOscillator();
      hum.type = 'sawtooth';
      hum.frequency.value = 55;
      const humGain = c.createGain();
      humGain.gain.value = 0.035;
      hum.connect(humGain).connect(gain);
      hum.start();
      const beep = () => {
        const cc = getCtx();
        if (!cc) return;
        const o = cc.createOscillator();
        o.type = 'square';
        o.frequency.value = 700 + Math.random() * 500;
        const g = cc.createGain();
        g.gain.setValueAtTime(0.07, cc.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, cc.currentTime + 0.09);
        o.connect(g).connect(gain);
        o.start(); o.stop(cc.currentTime + 0.1);
      };
      const iv = setInterval(beep, 260);
      return { nodes: [hum], intervals: [iv] };
    },
    ambient(c, gain) {
      const o1 = c.createOscillator();
      o1.type = 'sine'; o1.frequency.value = 74;
      const o2 = c.createOscillator();
      o2.type = 'sine'; o2.frequency.value = 110.5;
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.05;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 0.03;
      const g = c.createGain();
      g.gain.value = 0.11;
      lfo.connect(lfoGain).connect(g.gain);
      o1.connect(g); o2.connect(g); g.connect(gain);
      o1.start(); o2.start(); lfo.start();
      return { nodes: [o1, o2, lfo], intervals: [] };
    },
    hack(c, gain) {
      let step = 0;
      const alarm = () => {
        const cc = getCtx();
        if (!cc) return;
        const o = cc.createOscillator();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(step % 2 === 0 ? 220 : 440, cc.currentTime);
        const g = cc.createGain();
        g.gain.setValueAtTime(0.1, cc.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, cc.currentTime + 0.15);
        o.connect(g).connect(gain);
        o.start(); o.stop(cc.currentTime + 0.16);
        step++;
      };
      const iv = setInterval(alarm, 180);
      return { nodes: [], intervals: [iv] };
    },
    siren(c, gain) {
      // Classic two-tone police wail, looping while the UFO closes in.
      const o = c.createOscillator();
      o.type = 'sine';
      const g = c.createGain();
      g.gain.value = 0.16;
      o.connect(g).connect(gain);
      o.start();
      let up = true;
      const step = () => {
        const cc = getCtx();
        if (!cc) return;
        const target = up ? 880 : 500;
        try {
          o.frequency.cancelScheduledValues(cc.currentTime);
          o.frequency.setValueAtTime(o.frequency.value, cc.currentTime);
          o.frequency.linearRampToValueAtTime(target, cc.currentTime + 0.55);
        } catch (e) {}
        up = !up;
      };
      step();
      const iv = setInterval(step, 560);
      return { nodes: [o], intervals: [iv] };
    },
    nuke(c, gain) {
      // Deep delayed sub-bass boom + rumbling tail, timed to land after the flash.
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(28, c.currentTime + 1.4);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.65, c.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.2);
      const noise = c.createBufferSource();
      noise.buffer = noiseBuffer(c, 2.2);
      const nf = c.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.setValueAtTime(900, c.currentTime);
      nf.frequency.exponentialRampToValueAtTime(80, c.currentTime + 2.0);
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.001, c.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.4, c.currentTime + 0.08);
      ng.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 2.2);
      o.connect(g).connect(gain);
      noise.connect(nf).connect(ng).connect(gain);
      o.start(); noise.start();
      o.stop(c.currentTime + 2.25); noise.stop(c.currentTime + 2.25);
      return { nodes: [o, noise], intervals: [] };
    },
    missile(c, gain) {
      // Descending whistle as the missile falls, timed to land right
      // around when it hits the ground (~900ms).
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(2200, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.85);
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.22, c.currentTime + 0.15);
      g.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 0.75);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
      const noise = c.createBufferSource();
      noise.buffer = noiseBuffer(c, 0.9);
      const nf = c.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.setValueAtTime(2000, c.currentTime);
      nf.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.85);
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.05, c.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
      o.connect(g).connect(gain);
      noise.connect(nf).connect(ng).connect(gain);
      o.start(); noise.start();
      o.stop(c.currentTime + 0.92); noise.stop(c.currentTime + 0.92);
      return { nodes: [o, noise], intervals: [] };
    },
    startup(c, gain) {
      // Short ascending chime for arriving on the "desktop" world.
      const notes = [392, 523.25, 659.25, 784];
      notes.forEach((freq, i) => {
        const o = c.createOscillator();
        o.type = 'sine';
        const t0 = c.currentTime + i * 0.14;
        o.frequency.setValueAtTime(freq, t0);
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.22, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
        o.connect(g).connect(gain);
        o.start(t0); o.stop(t0 + 0.55);
      });
      return { nodes: [], intervals: [] };
    },
    konami(c, gain) {
      const o = c.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.4);
      o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.9);
      const g = c.createGain();
      g.gain.setValueAtTime(0.001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.45, c.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
      const noise = c.createBufferSource();
      noise.buffer = noiseBuffer(c, 0.9);
      const nf = c.createBiquadFilter();
      nf.type = 'highpass'; nf.frequency.value = 600;
      const ng = c.createGain();
      ng.gain.setValueAtTime(0.24, c.currentTime);
      ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
      o.connect(g).connect(gain);
      noise.connect(nf).connect(ng).connect(gain);
      o.start(); noise.start();
      o.stop(c.currentTime + 0.95); noise.stop(c.currentTime + 0.95);
      return { nodes: [o, noise], intervals: [] };
    },
  };

  function playSynth(key, { volume = 0.5 } = {}) {
    const c = getCtx();
    if (!c || !synthBuilders[key]) return;
    stopSynth(key);
    const gain = c.createGain();
    gain.gain.value = volume;
    gain.connect(c.destination);
    const built = synthBuilders[key](c, gain);
    activeSynth[key] = { nodes: built.nodes, intervals: built.intervals, gain };
  }

  /* ---------------- public API (unchanged shape) ---------------- */
  function play(key, opts = {}) {
    if (fileStatus[key] === 'available' && playFile(key, opts)) return;
    playSynth(key, opts);
  }

  function stop(key) {
    const el = fileCache[key];
    if (el) { try { el.pause(); el.currentTime = 0; } catch (e) {} }
    stopSynth(key);
  }

  function fadeOut(key, ms = 800) {
    const el = fileCache[key];
    if (el && !el.paused) {
      const startVol = el.volume;
      const steps = 16;
      let i = 0;
      const iv = setInterval(() => {
        i++;
        el.volume = Math.max(0, startVol * (1 - i / steps));
        if (i >= steps) { clearInterval(iv); stop(key); }
      }, ms / steps);
      return;
    }
    const rec = activeSynth[key];
    if (rec) {
      const c = getCtx();
      if (c) {
        try {
          rec.gain.gain.setValueAtTime(rec.gain.gain.value, c.currentTime);
          rec.gain.gain.linearRampToValueAtTime(0.0001, c.currentTime + ms / 1000);
        } catch (e) {}
      }
      setTimeout(() => stopSynth(key), ms + 50);
    }
  }

  window.ARCHION9.audio = { play, stop, fadeOut };
})();
