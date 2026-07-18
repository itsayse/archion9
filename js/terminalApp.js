/**
 * The interactive terminal that lives inside the floating "terminal"
 * window in the hidden universe. Pure vanilla JS command interpreter —
 * no dependencies. Supports multiple independent shell instances (the
 * main terminal, plus the hidden "shadow" terminal unlocked later),
 * all sharing the same command set.
 */
(function () {
  const output = document.getElementById('termOutput');
  const input = document.getElementById('termInput');

  let secretFound = false;
  let hacking = false;
  let catReadmeCount = 0;
  let shadowUnlocked = false;
  let hackCount = 0;

  const ASCII_ART = [
    '        .            *        .',
    '   *        .   AETHERLANE   .',
    '        .    ______        *',
    '   .    _.-"      "-._   .',
    '       /  .-"""""-.  \\',
    '  *    | (  o   o  ) |     .',
    '        \\  \\_____/  /',
    '   .     "-.......-"    *',
    '        *        .   *',
  ].join('\n');

  const PORTAL_DESTS = [
    {
      label: 'THE RUST SEA',
      sub: 'a dead ocean under a red static sky',
      bg: 'radial-gradient(ellipse at 50% 30%, #2a0a06 0%, #170302 60%, #050101 100%)',
      nebula: 'radial-gradient(600px 400px at 20% 30%, rgba(255,90,40,.28), transparent 60%), radial-gradient(500px 380px at 80% 70%, rgba(255,180,40,.16), transparent 60%)',
    },
    {
      label: 'STATIC FIELDS',
      sub: 'signal without a source, forever',
      bg: 'radial-gradient(ellipse at 50% 30%, #0c0c0c 0%, #050505 60%, #000 100%)',
      nebula: 'radial-gradient(600px 400px at 30% 40%, rgba(230,230,230,.14), transparent 60%)',
    },
    {
      label: 'HOLLOW ORBIT',
      sub: 'a moon with no planet left to circle',
      bg: 'radial-gradient(ellipse at 50% 30%, #061018 0%, #020608 60%, #000103 100%)',
      nebula: 'radial-gradient(600px 400px at 50% 20%, rgba(69,242,223,.18), transparent 60%)',
    },
  ];

  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

  const COMMANDS = {
    help() {
      return {
        html: [
          'available commands:',
          '  help      show this list',
          '  whoami    who runs this place',
          '  projects  a short, incomplete portfolio',
          '  github    where the real work lives',
          '  contact   how to reach the surface',
          '  ls        list files in this shell',
          '  cat &lt;file&gt;  read a file',
          '  clear     clear the screen',
          '  matrix    toggle the rain',
          '  ascii     print a small transmission',
          '  portal    step through to somewhere else, briefly',
          '  hack      ...don\'t. (or do.)',
          '  secret    ...if you must',
        ].join('<br>'),
      };
    },
    whoami() {
      return [
        'you are: guest',
        'this terminal belongs to whoever built the archive that',
        'was hiding this place. they left the door unlocked on purpose.',
      ].join('\n');
    },
    projects() {
      return [
        'ARCHION-9        — the archive you just walked out of',
        'AETHERLANE       — the place you are standing in now',
        'signal-decoder   — status: incomplete, ask again later',
        '(there is more. it is not finished loading.)',
      ].join('\n');
    },
    github() {
      return {
        html: 'no public repository is linked to this place, but the person behind it lives at <a href="https://github.com/itsayse" target="_blank" rel="noopener noreferrer" class="term-link">github.com/itsayse</a>. keep exploring — there\'s more if you go deep enough.',
      };
    },
    contact() {
      return 'there is no address for this place. you found it — that was the message.';
    },
    ls() {
      return [
        'total 4',
        '-rw-r--r--  1 guest  guest    118  notes.txt',
        '-rw-r--r--  1 guest  guest     19  readme.txt',
        '-rw-r--r--  1 guest  guest    212  archive.old',
        '-rwx------  1 root   root     512  wake.sh',
      ].join('\n');
    },
    cat(args) {
      const file = (args && args[0] ? args[0] : '').toLowerCase();
      if (!file) return 'usage: cat <filename>';
      if (file === 'notes.txt') {
        return 'nothing here yet. check readme.txt.';
      }
      if (file === 'wake.sh') {
        return 'permission denied.';
      }
      if (file === 'archive.old') {
        return "before this place called itself ARCHION-9, it called itself something else. the name is gone — only the habit of hiding survived. everything you've found tonight is a room it grew to cover that up.";
      }
      if (file === 'readme.txt') {
        catReadmeCount++;
        if (catReadmeCount >= 3) {
          catReadmeCount = 0;
          openShadowTerminal();
          return null;
        }
        return `hack the system  (${catReadmeCount}/3)`;
      }
      return `cat: ${file}: no such file or directory`;
    },
    clear(args, outEl) {
      (outEl || output).innerHTML = '';
      return null;
    },
    matrix() {
      window.ARCHION9.universe.toggleMatrixRain();
      return 'toggling signal rain...';
    },
    ascii() {
      return ASCII_ART;
    },
    secret() {
      if (secretFound) return 'you already know.';
      secretFound = true;
      return [
        'there is no secret. there is only the archive, and this room,',
        'and whatever you decide to build here next.',
        '(that said — try the konami code. old habits die hard.)',
      ].join('\n');
    },
    portal() {
      triggerPortal();
      return null;
    },
    hack() {
      if (hacking) return 'intrusion already running. patience.';
      hacking = true;
      hackCount++;
      runHackSequence(hackCount);
      return null;
    },
    // hidden, undocumented — not listed in help on purpose
    sudo() {
      return "nice try. this shell doesn't believe in owners.";
    },
    42() {
      return "yes. that is the answer. we're still not sure to what.";
    },
    fortune() {
      const lines = [
        'the archive remembers everything and forgives nothing.',
        'somewhere a satellite is still transmitting to no one.',
        'you are not lost. you are exactly as found as you meant to be.',
        'every door left unlocked was left that way on purpose.',
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    },
    // hidden — only ever hinted at in the transmission log, never in help
    nuke() {
      triggerNuke();
      return null;
    },
    // more undocumented ones — not in help, worth finding by chance
    date() {
      return `local time: ${new Date().toString()}`;
    },
    moon() {
      return "it isn't actually orbiting anything. it's just there. we checked.";
    },
    rm() {
      return "nice try. nothing in this shell is actually deletable.";
    },
    iddqd() {
      return "god mode engaged. (it does nothing here. wrong kind of game.)";
    },
    exit() {
      if (window.ARCHION9.main && window.ARCHION9.main.returnToSurface) {
        window.ARCHION9.main.returnToSurface();
      }
      return null;
    },
    cd() {
      return "there is nowhere else to go from in here. you're already deep enough.";
    },
    konami() {
      return "you already know the code. old muscle memory helps, remember?";
    },
    archive() {
      return 'try "cat archive.old" — this shell reads files properly.';
    },
  };

  /* ---------------- generic multi-shell plumbing ---------------- */
  function printLineTo(outEl, text, cls) {
    if (text === null || text === undefined) return;
    const p = document.createElement('p');
    if (cls) p.className = cls;
    if (typeof text === 'object' && text.html) {
      p.innerHTML = text.html;
    } else {
      p.textContent = text;
    }
    outEl.appendChild(p);
    outEl.scrollTop = outEl.scrollHeight;
  }

  function printEchoTo(outEl, text) {
    const p = document.createElement('p');
    p.className = 'term-echo';
    p.textContent = text;
    outEl.appendChild(p);
    outEl.scrollTop = outEl.scrollHeight;
  }

  function runCommandTo(outEl, raw, hist) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    printEchoTo(outEl, trimmed);
    hist.list.push(trimmed);
    hist.index = hist.list.length;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
      const result = COMMANDS[cmd](args, outEl);
      printLineTo(outEl, result, 'term-cyan');
    } else {
      printLineTo(outEl, `command not found: ${cmd} — type "help"`, 'term-magenta');
    }
  }

  function bindShell(outEl, inputEl) {
    const hist = { list: [], index: -1 };
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommandTo(outEl, inputEl.value, hist);
        inputEl.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hist.index > 0) { hist.index--; inputEl.value = hist.list[hist.index] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hist.index < hist.list.length) {
          hist.index++;
          inputEl.value = hist.list[hist.index] || '';
        }
      }
    });
  }

  // Convenience wrappers bound to the main terminal, used by effects that
  // are always narrated from there (hack, konami, nuke, portal...).
  function printLine(text, cls) { printLineTo(output, text, cls); }

  /* ---------------- hidden shadow terminal (cat readme.txt x3) ---------------- */
  function openShadowTerminal() {
    printLine('...the words stop feeling like a message and start feeling like an instruction.', 'term-magenta');

    let win = document.getElementById('winShadow');
    if (win) {
      win.classList.remove('is-minimized');
      const existingInput = document.getElementById('shadowInput');
      if (existingInput) existingInput.focus();
      return;
    }

    win = document.createElement('div');
    win.className = 'window window--shadow';
    win.id = 'winShadow';
    win.setAttribute('data-window', '');
    win.innerHTML = [
      '<div class="window__titlebar" data-drag-handle>',
      '  <span class="window__title">shadow_term &mdash; you shouldn\'t be here</span>',
      '  <div class="window__controls">',
      '    <button class="window__btn" data-action="minimize" aria-label="Minimize">_</button>',
      '    <button class="window__btn" data-action="close" aria-label="Close">&times;</button>',
      '  </div>',
      '</div>',
      '<div class="window__body">',
      '  <div class="term-output" id="shadowOutput"></div>',
      '  <div class="term-input-row">',
      '    <span class="term-prompt">root@aetherlane:/hidden$</span>',
      '    <input type="text" class="term-input" id="shadowInput" autocomplete="off" spellcheck="false" aria-label="Shadow terminal input" />',
      '  </div>',
      '</div>',
    ].join('');

    document.getElementById('sceneUniverse').appendChild(win);
    window.ARCHION9.windowManager.registerWindow(win);
    window.ARCHION9.audio.play('glitch', { volume: 0.2 });
    window.ARCHION9.glitch.shake('.scene--universe', 400);
    window.ARCHION9.glitch.setRgbSplit(true);
    setTimeout(() => window.ARCHION9.glitch.setRgbSplit(false), 350);

    const shadowOutput = document.getElementById('shadowOutput');
    const shadowInput = document.getElementById('shadowInput');
    bindShell(shadowOutput, shadowInput);
    printLineTo(shadowOutput, 'you found the other room. it was always here — just quieter.', 'term-cyan');
    printLineTo(shadowOutput, 'type "help".', 'term-dim');
    shadowUnlocked = true;
    setTimeout(() => shadowInput.focus(), 300);
  }

  /* ---------------- "hack" easter egg ---------------- */
  async function runHackSequence(attempt) {
    window.ARCHION9.audio.play('hack', { volume: 0.25 });
    window.ARCHION9.glitch.setGlitch('soft');
    window.ARCHION9.glitch.setRgbSplit(true);

    const lines = attempt >= 3
      ? [
        ['scanning aetherlane_shell for backdoors...', 'term-dim', 450],
        ['found: one. it was left ajar on purpose.', 'term-dim', 550],
        ['spoofing handshake ██████████░░░░░░░░░░ 45%', 'term-cyan', 450],
        ['spoofing handshake ████████████████████ 100%', 'term-cyan', 500],
        ['> WARNING: unauthorized override attempt detected', 'term-magenta', 600],
        ['> tracing origin...', 'term-magenta', 500],
        ['> ...trace failed. third attempt slipped through.', 'term-cyan', 500],
      ]
      : [
        ['scanning aetherlane_shell for backdoors...', 'term-dim', 450],
        ['found: none. good. that is not how you get in here.', 'term-dim', 550],
        ['spoofing handshake ██████████░░░░░░░░░░ 45%', 'term-cyan', 450],
        ['spoofing handshake ████████████████████ 100%', 'term-cyan', 500],
        ['> WARNING: unauthorized override attempt detected', 'term-magenta', 600],
        ['> tracing origin...', 'term-magenta', 500],
        ['> ...traced. dispatching a unit.', 'term-magenta', 500],
      ];

    for (const [text, cls, delay] of lines) {
      printLine(text, cls);
      await wait(delay);
    }

    window.ARCHION9.glitch.setGlitch('hard');
    await wait(400);
    window.ARCHION9.glitch.setGlitch('off');
    window.ARCHION9.glitch.setRgbSplit(false);

    if (attempt >= 3) {
      await runSuccessfulHack();
    } else {
      await runPoliceRaid();
      if (attempt === 2 && !shadowUnlocked) {
        // Two busted hacks leave debris behind — readme.txt survives the
        // raid and gets pulled straight out of the wreckage, unlocking
        // the shadow terminal early (normally reached via `cat readme.txt`
        // x3). A second, faster path into the same hidden room.
        printLine('salvaging wreckage from the raid...', 'term-dim');
        await wait(600);
        printLine('recovered: readme.txt — intact, barely.', 'term-cyan');
        await wait(500);
        catReadmeCount = 0;
        openShadowTerminal();
      } else {
        printLine('archive integrity: stable. try to behave.', 'term-cyan');
      }
    }

    window.ARCHION9.audio.stop('hack');
    hacking = false;
  }

  /* ---------------- 3rd hack: the intrusion actually works ---------------- */
  async function runSuccessfulHack() {
    printLine('> override accepted. a live host answers back.', 'term-cyan');
    await wait(700);
    printLine('ACCESS GRANTED — rerouting connection to the surface host', 'term-cyan');
    await wait(900);
    if (window.ARCHION9.desktop && window.ARCHION9.desktop.enter) {
      window.ARCHION9.desktop.enter();
    }
  }

  async function runPoliceRaid() {
    const layer = document.getElementById('collapseLayer');
    layer.innerHTML = `
      <div class="ufo-scene" id="ufoScene">
        <div class="ufo">
          <div class="ufo__glow"></div>
          <div class="ufo__dome"></div>
          <div class="ufo__body"></div>
          <div class="ufo__rim"></div>
          <div class="ufo__beacon"></div>
          <div class="ufo__lights"><span></span><span></span><span></span><span></span></div>
          <div class="ufo__beam"></div>
        </div>
        <div class="busted-text">BUSTED</div>
      </div>`;
    layer.classList.add('is-active');
    const scene = document.getElementById('ufoScene');

    // Siren starts faint, as if the craft is still far off, and rides the
    // full descent before it's overhead — timed to the longer zoom-in.
    window.ARCHION9.audio.play('siren', { volume: 0.05 });
    await wait(2400);
    scene.classList.add('is-firing');
    window.ARCHION9.glitch.colorFlash('rgba(255,60,60,.4)');
    window.ARCHION9.glitch.shake('.scene--universe', 500);
    await wait(320);
    scene.classList.add('is-busted');
    printLine('BUSTED — the archive was never yours to hack.', 'term-magenta');
    window.ARCHION9.audio.fadeOut('siren', 700);
    await wait(1400);
    scene.classList.add('is-leaving');
    await wait(550);
    layer.classList.remove('is-active');
    layer.innerHTML = '';
  }

  /* ---------------- "portal" easter egg — takes you somewhere else, briefly ---------------- */
  function triggerPortal() {
    const scene = document.querySelector('.scene--universe');
    const nebula = document.querySelector('.nebula');
    const hudTitle = document.querySelector('.universe-hud__title');
    const hudSub = document.querySelector('.universe-hud__sub');
    const dest = PORTAL_DESTS[Math.floor(Math.random() * PORTAL_DESTS.length)];

    printLine(`stepping through — destination: ${dest.label.toLowerCase()}...`, 'term-dim');
    window.ARCHION9.audio.play('whoosh', { volume: 0.28 });
    window.ARCHION9.glitch.tearScreen({ hold: 260 });

    const prevBg = scene.style.background;
    const prevNebula = nebula.style.background;
    const prevTitle = hudTitle.textContent;
    const prevSub = hudSub.textContent;

    setTimeout(() => {
      scene.style.transition = 'background 1.2s ease';
      nebula.style.transition = 'background 1.2s ease';
      scene.style.background = dest.bg;
      nebula.style.background = dest.nebula;
      hudTitle.textContent = dest.label;
      hudSub.textContent = dest.sub;
    }, 380);

    setTimeout(() => {
      printLine('...the archive pulls you back before it takes hold.', 'term-cyan');
      scene.style.background = prevBg;
      nebula.style.background = prevNebula;
      hudTitle.textContent = prevTitle;
      hudSub.textContent = prevSub;
    }, 5200);
  }

  /* ---------------- hidden "nuke" failsafe — only hinted in the log ----------------
   * Reworked as a flash-then-boom: the whole screen goes white first (light
   * travels instantly), and the boom audio lands a beat later — the way a
   * real detonation is seen before it's heard. No missile sprite anymore,
   * just the failsafe going off. */
  function triggerNuke() {
    printLine('◆ FAILSAFE ARMED — incoming ◆', 'term-magenta');
    const activeSelector = `.scene--${window.ARCHION9.state.scene}`;

    // Distant incoming whistle, same as before, so there's still a beat
    // of warning before the flash lands.
    window.ARCHION9.audio.play('missile', { volume: 0.4 });

    setTimeout(() => {
      // The flash: a big, bright, held whiteout across the whole screen.
      window.ARCHION9.glitch.colorFlash('#ffffff', 2000);
      window.ARCHION9.glitch.shake(activeSelector, 260);
    }, 850);

    // The boom: deliberately delayed after the flash already landed.
    setTimeout(() => {
      window.ARCHION9.audio.play('nuke', { volume: 0.6 });
      window.ARCHION9.glitch.shake(activeSelector, 700);
    }, 850 + 550);

    setTimeout(() => {
      if (window.ARCHION9.main && window.ARCHION9.main.returnToSurfaceFully) {
        window.ARCHION9.main.returnToSurfaceFully();
      }
    }, 850 + 2100);
  }

  /* ---------------- konami code ----------------
   * No cat anymore — just the signal itself tearing apart. Stacks
   * everything the glitch toolkit has: hard glitch, RGB split, a
   * screen tear, camera shake, and a rapid strobe of color flashes,
   * held for a couple of seconds before it snaps back to normal. */
  function triggerKonami() {
    printLine('◆ HIDDEN SIGNAL ACKNOWLEDGED ◆', 'term-cyan');
    printLine('the whole feed rips apart for a second.', 'term-dim');

    window.ARCHION9.audio.play('konami', { volume: 0.32 });
    triggerSuperGlitch();
  }

  function triggerSuperGlitch() {
    const activeSelector = `.scene--${window.ARCHION9.state.scene}`;

    window.ARCHION9.glitch.shake(activeSelector, 700);
    window.ARCHION9.glitch.setGlitch('hard');
    window.ARCHION9.glitch.setRgbSplit(true);
    window.ARCHION9.glitch.tearScreen({ hold: 220 });

    const strobeColors = ['rgba(69,242,223,.4)', 'rgba(255,46,146,.4)', 'rgba(123,47,247,.35)'];
    let strobe = 0;
    const strobeTimer = setInterval(() => {
      window.ARCHION9.glitch.colorFlash(strobeColors[strobe % strobeColors.length], 200);
      strobe++;
      if (strobe >= 7) clearInterval(strobeTimer);
    }, 240);

    setTimeout(() => window.ARCHION9.glitch.tearScreen({ hold: 160 }), 950);
    setTimeout(() => window.ARCHION9.glitch.shake(activeSelector, 400), 1500);

    setTimeout(() => {
      window.ARCHION9.glitch.setGlitch('off');
      window.ARCHION9.glitch.setRgbSplit(false);
    }, 2200);
  }

  function bootMessage() {
    printLine('aetherlane_shell v0.9 — type "help" to begin', 'term-dim');
  }

  function initKonami() {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    document.addEventListener('keydown', (e) => {
      idx = (e.key === seq[idx]) ? idx + 1 : 0;
      if (idx === seq.length) {
        idx = 0;
        triggerKonami();
      }
    });
  }

  function init() {
    bootMessage();
    bindShell(output, input);
    initKonami();
  }

  document.addEventListener('DOMContentLoaded', init);

  // Lets main.js reset the hack counter when a visitor drifts all the way
  // back to the surface, so the 3-hack sequence can be replayed.
  window.ARCHION9.terminal = {
    resetHack() { hackCount = 0; },
  };
})();
