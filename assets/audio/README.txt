Optional audio drop-in folder.

You don't need anything here — every sound already works out of the
box, synthesized live in the browser with the Web Audio API. This
folder is only for people who'd rather use real recordings instead.

If you want to swap in real audio, add any of the following files
here with these exact names (see js/config.js if you ever want to
change the paths):

  glitch.mp3   short glitch/static burst, played when the discovery begins
  boot.mp3     low hum/terminal ambience during the decryption sequence
  ambient.mp3  looping ambient pad for the hidden universe
  click.mp3    short click when the hidden file is opened
  whoosh.mp3   transition sound for the reality-collapse sequence
  hack.mp3     alarm/intrusion sound for the terminal's "hack" command
  konami.mp3   big "blast" sound for the ↑↑↓↓←→←→ b a easter egg
  siren.mp3    looping police siren, played while the UFO closes in
  missile.mp3  incoming whistle for the hidden "nuke" failsafe command
  nuke.mp3     impact boom for the hidden "nuke" failsafe command
  startup.mp3  short chime played on arriving at the hidden Earth desktop

The code checks for each file first and only uses the synthesized
version if the file is missing — so you can drop in just one or two
of these and leave the rest to the built-in sound engine.
