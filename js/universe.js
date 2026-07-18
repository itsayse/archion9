/**
 * Phase 4 — the hidden universe's ambient engine: starfield canvas,
 * mouse-driven parallax on the moon/planets, a custom cursor, and the
 * matrix-rain easter egg used by the `matrix` terminal command.
 */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  const parallax = document.getElementById('universeParallax');
  const cursor = document.getElementById('customCursor');
  const matrixCanvas = document.getElementById('matrixRain');
  const matrixCtx = matrixCanvas.getContext('2d');

  let stars = [];
  let comets = [];
  let raf = null;
  let started = false;
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  let matrixActive = false;
  let matrixInterval = null;
  let cometTimer = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 3800);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.6 + 0.2, // for parallax
    }));
  }

  function drawStars(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.3;
      const px = s.x + mouseX * 12 * s.depth;
      const py = s.y + mouseY * 12 * s.depth;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,238,255,${Math.max(0, Math.min(1, alpha))})`;
      ctx.fill();
    }
    drawComets();
  }

  /* Occasional shooting stars — rare, quick, easy to miss on purpose. */
  function spawnComet() {
    comets.push({
      x: Math.random() * canvas.width * 0.6,
      y: Math.random() * canvas.height * 0.35,
      vx: 7 + Math.random() * 5,
      vy: 3 + Math.random() * 2.5,
      life: 0,
      maxLife: 34 + Math.random() * 12,
    });
  }

  function scheduleComet() {
    clearTimeout(cometTimer);
    cometTimer = setTimeout(() => {
      spawnComet();
      scheduleComet();
    }, 6000 + Math.random() * 9000);
  }

  function drawComets() {
    comets = comets.filter((c) => c.life < c.maxLife);
    for (const c of comets) {
      c.life++;
      c.x += c.vx;
      c.y += c.vy;
      const fade = 1 - c.life / c.maxLife;
      ctx.save();
      ctx.strokeStyle = `rgba(234,243,255,${Math.max(0, fade * 0.9)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 6, c.y - c.vy * 6);
      ctx.stroke();
      ctx.restore();
    }
  }

  function loop(t) {
    mouseX += (targetX - mouseX) * 0.04;
    mouseY += (targetY - mouseY) * 0.04;
    drawStars(t);

    // Parallax the moon/planets/satellite slightly opposite the stars for depth.
    parallax.style.transform = `translate(${mouseX * -10}px, ${mouseY * -10}px)`;

    raf = requestAnimationFrame(loop);
  }

  function onPointerMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetX = nx;
    targetY = ny;

    cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    cursor.classList.add('is-visible');

    const hoverTarget = e.target.closest('button, input, [data-drag-handle], a');
    cursor.classList.toggle('is-hover', !!hoverTarget);
  }

  function startMatrixRain() {
    if (matrixActive) return;
    matrixActive = true;
    matrixCanvas.classList.add('is-active');

    const fontSize = 16;
    const columns = Math.floor(matrixCanvas.width / fontSize);
    const drops = new Array(columns).fill(1);
    const glyphs = 'アイウエオカキクケコサシスセソ0123456789<>/*-+';

    matrixInterval = setInterval(() => {
      matrixCtx.fillStyle = 'rgba(2,3,10,0.15)';
      matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
      matrixCtx.fillStyle = '#45f2df';
      matrixCtx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 45);
  }

  function stopMatrixRain() {
    if (!matrixActive) return;
    matrixActive = false;
    clearInterval(matrixInterval);
    matrixCanvas.classList.remove('is-active');
    matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
  }

  function toggleMatrixRain() {
    if (matrixActive) stopMatrixRain(); else startMatrixRain();
  }

  function start() {
    if (started) return;
    started = true;
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    raf = requestAnimationFrame(loop);
    scheduleComet();
  }

  window.ARCHION9.universe = { start, toggleMatrixRain, startMatrixRain, stopMatrixRain };
})();
