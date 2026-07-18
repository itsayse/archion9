/**
 * Phase 5 — the hidden Earth. Reached only via the 3rd successful `hack`
 * in the space terminal. A different world with a different terminal:
 * a Windows-9x-flavoured desktop with its own MS-DOS-style prompt, its
 * own command set, and its own easter eggs (including where "about"
 * actually lives now).
 */
(function () {
  const dosOutput = document.getElementById('dosOutput');
  const dosInput = document.getElementById('dosInput');
  const clockEl = document.getElementById('desktopClock');
  const bsod = document.getElementById('bsod');

  let entered = false;
  let clockTimer = null;
  let bsodShowing = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function printLine(text, cls) {
    if (text === null || text === undefined) return;
    const p = document.createElement('p');
    if (cls) p.className = cls;
    if (typeof text === 'object' && text.html) {
      p.innerHTML = text.html;
    } else {
      p.textContent = text;
    }
    dosOutput.appendChild(p);
    dosOutput.scrollTop = dosOutput.scrollHeight;
  }

  function printEcho(text) {
    const p = document.createElement('p');
    p.className = 'term-echo';
    p.textContent = text;
    dosOutput.appendChild(p);
    dosOutput.scrollTop = dosOutput.scrollHeight;
  }

  const COMMANDS = {
    help() {
      return [
        'available commands:',
        '  help       show this list',
        '  dir        list files on this machine',
        '  about      who built this',
        '  whoami     current user',
        '  ver        show version info',
        '  format     do not.',
        '  secret     ...if you must',
        '  clear      clear the screen',
        '  exit       drift back to the stars',
      ].join('\n');
    },
    dir() {
      return [
        ' Volume in drive C is AETHERLANE',
        ' Directory of C:\\AETHERLANE',
        '',
        'AYSE      EXE       412,096  07-18-2026  about.exe',
        'SIGNAL    LOG         8,204  07-18-2026',
        'DONOTRUN  BAT             1  ??-??-????',
        'ARCHIVE   OLD           212  ??-??-????',
        '        4 file(s)    420,513 bytes',
      ].join('\n');
    },
    type(args) {
      const file = (args && args[0] ? args[0] : '').toLowerCase().replace('.', '');
      if (!file) return 'usage: type <filename>';
      if (file === 'signallog' || file === 'signal') {
        return '[00:00:01] connection re-established after unknown interval.';
      }
      if (file === 'donotrunbat' || file === 'donotrun') {
        return 'Access denied. some files are labeled for a reason.';
      }
      if (file === 'archiveold' || file === 'archive') {
        return "before this place called itself ARCHION-9, it called itself something else. the name is gone — only the habit of hiding survived. everything you've found tonight is a room it grew to cover that up.";
      }
      if (file === 'ayseexe') {
        return "that's not a text file. try \"about\" instead.";
      }
      return `File not found - ${(args && args[0]) || ''}`;
    },
    about() {
      window.ARCHION9.windowManager.show('winAboutDesktop');
      return 'opening about.exe ...';
    },
    whoami() {
      return 'GUEST — logged in from somewhere off the map.';
    },
    ver() {
      return 'AETHERLANE [Version 9.26] — this machine was never registered.';
    },
    format() {
      triggerBsod();
      return null;
    },
    secret() {
      return "you already crawled through a hidden shell to get here. that was the secret.";
    },
    clear() {
      dosOutput.innerHTML = '';
      return null;
    },
    exit() {
      if (window.ARCHION9.main && window.ARCHION9.main.returnToSurface) {
        window.ARCHION9.main.returnToSurface();
      }
      return null;
    },
    sudo() {
      return "still doesn't work here either.";
    },
    // more undocumented ones — not in help, worth stumbling into
    iddqd() {
      return "god mode engaged. (does nothing. this isn't that kind of game.)";
    },
    edit() {
      return "AETHERLANE.INI is read-only. always has been.";
    },
    color() {
      document.getElementById('sceneDesktop').classList.toggle('desktop-inverted');
      return 'color scheme cycled. type it again to undo.';
    },
    starwars() {
      return "a long time ago, in an archive far, far away...";
    },
    time() {
      return `system time: ${new Date().toLocaleTimeString()}`;
    },
    cake() {
      return "the cake was never here. neither, really, were you.";
    },
    matrix() {
      return "ERROR: signal rain doesn't reach this deep. try it back in the stars.";
    },
    konami() {
      return "wrong machine for that trick. but it still works everywhere else.";
    },
    exit2() {
      return "nice guess. it's just \"exit\".";
    },
    archive() {
      return 'type "type archive.old" — this shell reads files properly.';
    },
    // hidden failsafe — same trick as the space terminal, reachable from here too
    nuke() {
      triggerNukeDesktop();
      return null;
    },
  };

  function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    printEcho(trimmed);
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
      const result = COMMANDS[cmd]();
      printLine(result, 'term-cyan');
    } else {
      printLine(`Bad command or file name: ${cmd}`, 'term-magenta');
    }
  }

  function bindDosShell() {
    const hist = { list: [], index: -1 };
    dosInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(dosInput.value);
        if (dosInput.value.trim()) {
          hist.list.push(dosInput.value.trim());
          hist.index = hist.list.length;
        }
        dosInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hist.index > 0) { hist.index--; dosInput.value = hist.list[hist.index] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hist.index < hist.list.length) {
          hist.index++;
          dosInput.value = hist.list[hist.index] || '';
        }
      }
    });
  }

  /* ---------------- "nuke" easter egg — same failsafe as the space terminal ---------------- */
  function triggerNukeDesktop() {
    printLine('◆ FAILSAFE ARMED — incoming ◆', 'term-magenta');
    const activeSelector = `.scene--${window.ARCHION9.state.scene}`;

    window.ARCHION9.audio.play('missile', { volume: 0.4 });

    setTimeout(() => {
      window.ARCHION9.glitch.colorFlash('#ffffff', 2000);
      window.ARCHION9.glitch.shake(activeSelector, 260);
    }, 850);

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

  /* ---------------- "format" easter egg — a fake Blue Screen of Death ---------------- */
  function triggerBsod() {
    if (bsodShowing) return;
    bsodShowing = true;
    printLine('Formatting drive C: ...', 'term-dim');
    setTimeout(() => {
      bsod.classList.add('is-active');
      window.ARCHION9.audio.play('glitch', { volume: 0.2 });
      const dismiss = () => {
        bsod.classList.remove('is-active');
        bsodShowing = false;
        document.removeEventListener('keydown', dismiss);
        bsod.removeEventListener('click', dismiss);
        printLine('...just kidding. everything is still here.', 'term-cyan');
        setTimeout(() => dosInput.focus(), 50);
      };
      document.addEventListener('keydown', dismiss, { once: true });
      bsod.addEventListener('click', dismiss, { once: true });
    }, 700);
  }

  /* ---------------- desktop icons + taskbar ---------------- */
  function openSysDialog(title, text) {
    document.getElementById('sysDialogTitle').textContent = title;
    document.getElementById('sysDialogText').textContent = text;
    window.ARCHION9.windowManager.show('winSysDialog');
  }

  function initDesktopChrome() {
    document.querySelectorAll('[data-desktop-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-desktop-action');
        if (action === 'open-terminal') window.ARCHION9.windowManager.show('winDos');
        if (action === 'open-about') COMMANDS.about();
        if (action === 'open-mycomputer') {
          openSysDialog('My Computer', '1 object(s) — 0 bytes free. there is nothing else here.');
        }
        if (action === 'open-explorer') {
          window.ARCHION9.windowManager.show('winExplorer');
          window.ARCHION9.explorer.refresh();
        }
      });
    });

    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        openSysDialog('Start', 'there is nowhere else to start from.');
      });
    }

    const sysOk = document.getElementById('sysDialogOk');
    if (sysOk) {
      sysOk.addEventListener('click', () => {
        window.ARCHION9.windowManager.minimize(document.getElementById('winSysDialog'));
      });
    }
  }

  function tickClock() {
    const now = new Date();
    clockEl.textContent = `${pad(now.getHours() % 12 || 12)}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
  }

  // Undocumented — click the taskbar clock 5 times in a row for a bonus line.
  let clockClicks = 0;
  let clockClickTimer = null;
  function initClockEgg() {
    if (!clockEl) return;
    clockEl.style.cursor = 'default';
    clockEl.addEventListener('click', () => {
      clockClicks++;
      clearTimeout(clockClickTimer);
      clockClickTimer = setTimeout(() => { clockClicks = 0; }, 1500);
      if (clockClicks >= 5) {
        clockClicks = 0;
        openSysDialog('System', "time doesn't really pass here. this clock is for comfort.");
      }
    });
  }

  function init() {
    initDesktopChrome();
    bindDosShell();
    initClockEgg();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ---------------- scene entry, called from the space terminal's hack ---------------- */
  function enter() {
    window.ARCHION9.audio.play('glitch', { volume: 0.25 });
    window.ARCHION9.glitch.setGlitch('hard');
    window.ARCHION9.glitch.setRgbSplit(true);

    setTimeout(() => {
      window.ARCHION9.glitch.blackoutFlash();
      window.ARCHION9.audio.fadeOut('ambient', 300);
    }, 300);

    setTimeout(() => {
      window.ARCHION9.glitch.setGlitch('off');
      window.ARCHION9.glitch.setRgbSplit(false);

      document.body.setAttribute('data-scene', 'desktop');
      window.ARCHION9.state.scene = 'desktop';
      document.getElementById('sceneUniverse').setAttribute('aria-hidden', 'true');
      document.getElementById('sceneDesktop').setAttribute('aria-hidden', 'false');

      if (!entered) {
        entered = true;
        printLine('AETHERLANE [Version 9.26]', 'term-dim');
        printLine('type "help" to begin.', 'term-dim');
      }

      window.ARCHION9.audio.play('startup', { volume: 0.4 });
      tickClock();
      if (!clockTimer) clockTimer = setInterval(tickClock, 15000);

      setTimeout(() => dosInput && dosInput.focus(), 300);
    }, 900);
  }

  window.ARCHION9.desktop = { enter };
})();
