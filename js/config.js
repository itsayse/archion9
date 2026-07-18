/**
 * ARCHION9 — global namespace & shared config.
 * Everything hangs off window.ARCHION9 to avoid ES-module/CORS issues when
 * the project is opened directly via file://.
 */
window.ARCHION9 = {
  state: {
    scene: 'server',       // server | boot | collapse | universe
    hasDiscovered: false,
  },
  config: {
    bootLines: [
      { text: 'opening IMG_0000.jpg ...', delay: 400 },
      { text: 'reading metadata ...', delay: 700 },
      { text: 'checksum mismatch on 3 blocks', delay: 500, cls: 'line-warn' },
      { text: 'unexpected file signature detected', delay: 650, cls: 'line-warn' },
      { text: 'this file did not originate on this server', delay: 900, cls: 'line-warn' },
      { text: 'attempting decryption ...', delay: 500 },
      { text: 'decrypting [key: ??????????] ', delay: 1400 },
      { text: 'integrity check passed', delay: 500, cls: 'line-ok' },
      { text: 'ACCESS GRANTED', delay: 900, cls: 'line-ok' },
    ],
    fakeFiles: [
      { name: 'backups/', size: '--', mod: '2024-11-02', type: 'dir', isDir: true },
      { name: 'logs/', size: '--', mod: '2024-11-02', type: 'dir', isDir: true },
      { name: 'snapshots/', size: '--', mod: '2024-10-30', type: 'dir', isDir: true },
      { name: 'quarterly_report_q3.pdf', size: '1.2 MB', mod: '2024-11-01', type: 'doc' },
      { name: 'infra_notes.txt', size: '4 KB', mod: '2024-10-29', type: 'txt' },
      { name: 'IMG_0113.jpg', size: '2.1 MB', mod: '2024-10-22', type: 'img' },
      { name: 'IMG_0114.jpg', size: '1.9 MB', mod: '2024-10-22', type: 'img' },
      { name: 'IMG_0000.jpg', size: '48 KB', mod: '????-??-??', type: 'img', secret: true },
      { name: 'IMG_0115.jpg', size: '2.0 MB', mod: '2024-10-23', type: 'img' },
      { name: 'archive_index.csv', size: '11 KB', mod: '2024-09-14', type: 'csv' },
      { name: 'migration_plan.md', size: '2 KB', mod: '2024-08-02', type: 'md' },
      { name: 'old_backup.tar.gz', size: '340 MB', mod: '2023-12-11', type: 'archive' },
    ],
    typeIcons: {
      dir: '[+]', doc: '[#]', txt: '[~]', img: '[img]',
      csv: '[csv]', md: '[md]', archive: '[zip]',
    },
    // Optional audio assets — dropped in by the user, entirely optional.
    // If a file at these paths doesn't exist / can't load, playback is
    // silently skipped and nothing breaks.
    audio: {
      glitch: 'assets/audio/glitch.mp3',
      boot: 'assets/audio/boot.mp3',
      ambient: 'assets/audio/ambient.mp3',
      click: 'assets/audio/click.mp3',
      whoosh: 'assets/audio/whoosh.mp3',
      hack: 'assets/audio/hack.mp3',
      konami: 'assets/audio/konami.mp3',
      siren: 'assets/audio/siren.mp3',
      nuke: 'assets/audio/nuke.mp3',
      missile: 'assets/audio/missile.mp3',
      startup: 'assets/audio/startup.mp3',
    },
    // File Explorer easter egg (Phase 5 desktop): live Discord presence via
    // the Lanyard API, and a GitHub repo list. Both are public, unauthenticated
    // GET requests — safe to call straight from the browser.
    //   - discordUserId: your numeric Discord user ID (Settings > Advanced >
    //     Developer Mode, then right-click your name > Copy User ID). Lanyard
    //     only tracks presence for users who've joined its own Discord server
    //     at https://discord.gg/lanyard at least once — after that it works
    //     anywhere, you don't need to stay in that server.
    //   - githubUsername: public GitHub username to list repos for.
    social: {
      discordUserId: '1408344014284918845',
      githubUsername: 'itsayse',
    },
  },
};
