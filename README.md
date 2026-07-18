# ARCHION-9 — an interactive mystery

A single-page experience that opens as a boring file server and ends
somewhere else entirely. Pure HTML5 / CSS3 / vanilla JavaScript — no
build step, no frameworks. Open `index.html` directly in a browser, or
serve the folder with any static server.

## How it plays

1. **The archive.** A convincing, faintly alive directory listing —
   uptime counter, storage gauge, blinking cursor. One file among the
   images (`IMG_0000.jpg`) flickers just slightly differently from its
   neighbours. That's the door.
2. **The discovery.** Clicking it glitches the screen and boots a fake
   decryption terminal (`ACCESS GRANTED`, etc.).
3. **The collapse.** The archive's own text shatters into falling
   characters, UI fragments burst outward, and the screen cuts to black.
4. **The hidden universe.** A parallax starfield, drifting planets and
   a satellite, plus floating, draggable windows: an interactive
   terminal (`help`, `whoami`, `projects`, `github`, `contact`, `ls`,
   `cat <file>`, `clear`, `matrix`, `ascii`, `portal`, `hack`,
   `secret`, plus a few undocumented ones worth typing at random —
   `sudo`, `42`, `fortune`), and an incoming-transmission log. `ls`
   reveals a small fake filesystem inside the terminal, including a
   `readme.txt` — `cat` it three times and a second, hidden "shadow"
   terminal window unlocks with its own prompt.
   There's also a Konami code (`↑↑↓↓←→←→ b a`, hinted in the
   transmission log): the whole feed rips apart — hard glitch, RGB
   split, a screen tear, camera shake, and a rapid strobe of color —
   held for a couple of seconds before it snaps back to normal.
   `portal` briefly swaps the whole scene for one of a few alternate
   "places" before pulling you back.
   There's one more secret, only ever hinted at in the transmission
   log (never in `help`): a failsafe word that flashes the entire
   screen white — light before sound — with the boom landing a beat
   later, then drops you straight back to the surface from wherever
   you currently are. It works from the hidden Earth desktop too.
   Press `Esc` at any time to drift back one world at a time
   (Earth &rarr; universe &rarr; surface).
   A handful of extra undocumented commands are scattered in for
   people who like to poke around (`date`, `moon`, `rm`, `iddqd`,
   `cd`, `konami`, `exit`, on top of the classic `sudo`, `42`,
   `fortune`) — none of them are in `help`. `ls` also lists an
   `archive.old` alongside the usual files — `cat` it for a short
   piece of the archive's backstory.
5. **`hack`.** The UFO arrives from a genuine distance now — a tiny,
   blurred speck that rockets in and grows before it settles overhead.
   The first attempt gets you busted. The **second** busted attempt
   leaves wreckage behind with `readme.txt` still intact — it gets
   pulled straight from the debris, unlocking the hidden "shadow"
   terminal early (the slower route is still there too: `cat
   readme.txt` three times gets you the same room). The **third**
   attempt slips through entirely, and reroutes you to a completely
   different, "hidden Earth" world: a Windows-9x-style desktop with
   its own MS-DOS-style prompt (`help`, `dir`, `type <file>`, `about`,
   `whoami`, `ver`, `format`, `secret`, `clear`, `exit`), desktop
   icons, a taskbar, and a fake Blue Screen of Death easter egg
   (`format`). This is also where `about` actually lives now — a
   Windows-styled about box with bio, avatar, and a GitHub link. It
   has its own pile of undocumented commands too (`iddqd`, `edit`,
   `color`, `starwars`, `time`, `cake`, `matrix`, `konami`, and the
   same hidden `nuke` failsafe as the space terminal), plus one that
   only shows up if you click the taskbar clock five times in a row.
   `dir` lists an `ARCHIVE.OLD` file too — `type archive.old` reads it.
   There's also a **File Explorer** icon on the desktop now — it opens
   a small window with two live panels: real-time Discord presence
   (via the public [Lanyard](https://api.lanyard.rest) API) and a list
   of GitHub repos (via the public GitHub API), both fetched straight
   from the browser, no backend required. See "Configuring the File
   Explorer" below to wire up your own Discord ID.

## Configuring the File Explorer

The desktop scene's **File Explorer** icon opens a window with two live
panels — Discord presence and a GitHub repo list — configured in
`js/config.js` under `config.social`:

```js
social: {
  discordUserId: '',            // your numeric Discord user ID
  githubUsername: 'itsayse',    // public GitHub username
},
```

**GitHub repos** work out of the box — it's just a public,
unauthenticated call to `api.github.com/users/<username>/repos`.

**Discord presence** uses [Lanyard](https://api.lanyard.rest), a free
public API that exposes real-time Discord status for a given user ID.
To enable it:

1. Turn on Developer Mode in Discord (User Settings → Advanced).
2. Right-click your own name/avatar → **Copy User ID**.
3. Paste that ID into `discordUserId` above.
4. Join the [Lanyard support server](https://discord.gg/lanyard) once —
   Lanyard only tracks presence for accounts it's seen in that server,
   but after joining it works everywhere, you don't need to stay in it.

If `discordUserId` is left blank, or the API can't be reached, the
panel just shows a quiet fallback line instead of breaking anything.

## Audio

There's real working sound out of the box — every effect (click,
glitch, boot hum, ambient drone, whoosh, the `hack` alarm, a looping
police siren for the UFO that busts you, the konami blast, an
incoming-missile whistle plus boom for the nuke failsafe, and a
startup chime for arriving on the hidden Earth) is synthesized live
with the Web Audio API, so nothing needs to be downloaded. If you'd
rather use real recordings, drop files into `assets/audio/` with the
names listed in `assets/audio/README.txt`; the code checks for them
first and only falls back to the synthesized version if a file is
missing.

## Structure

```
index.html
css/
  main.css        design tokens + Phase 1 (fake server) layout + scene state machine
  crt.css         scanlines/flicker/RGB-split + Phase 2 boot + Phase 3 collapse
  terminal.css    floating windows + interactive terminal chrome
  universe.css    Phase 4 starfield/nebula/cursor
  desktop.css     Phase 5 hidden-Earth desktop, DOS terminal chrome, missile strike
js/
  config.js       shared state + fake file list + boot-sequence script
  audio.js        optional audio player (silently no-ops without files)
  fakeServer.js   renders the directory listing, drives uptime/clock
  glitch.js       shared glitch/RGB-split/blackout/missile-strike helpers
  discovery.js    Phase 2 boot sequence
  collapse.js     Phase 3 shatter transition
  universe.js     starfield canvas, parallax, custom cursor, matrix rain
  windowManager.js drag / minimize / restore for floating windows
  explorer.js     File Explorer easter egg — Discord presence + GitHub repos
  terminalApp.js  the space terminal's command set (hack, portal, nuke, konami...)
  desktop.js      Phase 5 hidden-Earth scene + its own MS-DOS-style terminal
  main.js         escape-to-return (steps back one world at a time) + focus handling
assets/
  audio/          optional: drop in glitch.mp3, boot.mp3, ambient.mp3,
                  click.mp3, whoosh.mp3, siren.mp3, nuke.mp3, missile.mp3,
                  startup.mp3 and they'll be used automatically
  img/
    tiktok_pfp.jpg  avatar shown in the about window (now on the desktop scene)
```

## Notes

- Everything is plain `<script>` tags (no ES modules) so the page also
  works when opened straight from the filesystem (`file://`), where
  module CORS rules would otherwise block it.
- `prefers-reduced-motion` is respected globally.
- No audio files are bundled — the project runs identically with or
  without them.
