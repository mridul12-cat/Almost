# Optional room music

Authorized by the learner: use the three supplied tracks in `music/`, assign one to each room, and add a cute SVG that moves during playback and can be clicked to start or stop it. This is a narrow extension of the prior no-audio POC boundary; all exhibit animations remain independent and silent.

## Behavior

- Main Hall → `Main Hall.mp3`; Moonseed Conservatory → `Conservatory.mp3`; Pocket-Sky Observatory → `Observatory.mp3`.
- The smiling, hand-drawn SVG record player sits beside the room signposts on desktop and beneath them on smaller screens, outside the artwork and exhibit hit areas. Its paper/gold/sage/plum treatment matches the room.
- Music begins off. Clicking the SVG/button starts playback; clicking again pauses. No automatic sound or MP3 download on arrival.
- Music loops at 35% element volume, subject to the visitor’s system volume. One shared audio element prevents overlapping tracks.
- If playing, changing rooms stops the old track and starts the matching track from the beginning. If paused, changing rooms stays quiet. Reload always starts quiet; no new persistence.
- The box gently sways, the record glimmers, and two notes drift only during actual playback. Pausing stops movement. Reduced motion leaves static notes and the explicit playing label.
- Native button, visible keyboard focus, Enter/Space activation, minimum 44px hit area, pressed state, explicit room/playback label and polite status. The SVG is decorative within the named button.
- Pending playback can be paused. Superseded play promises cannot overwrite a newer room’s state. Blocked playback or unavailable audio leaves the museum usable and offers an honest click-to-retry message.

## Implementation

`RoomMusic.tsx` owns the single HTML audio element, page-only playback intent, actual media-event feedback, and cancellation counter. `MuseumScene.tsx` passes the existing current room. `music.css` is scoped to the optional control. No changes to exhibit/journal/sky schemas or storage, reveal behavior, room discoveries, or dependencies.

Original supplied files stay in `music/`. Public copies (`main-hall.mp3`, `conservatory.mp3`, `observatory.mp3`) are served locally from `public/music/`, copied by Vite into production output. They add approximately 6MB of static files without entering the JavaScript bundle. URLs respect Vite’s base path. Only the chosen room track loads after playback is requested; no third-party audio service.

## Verification

See `room-music-report.md` for executed checks and screenshots. Critical browser cases cover real MP3 decoding/time advancement, opt-in loading, room changes, pause/reload, no overlap or storage changes, keyboard/reduced motion/narrow layouts, blocked playback, network retry, and stale playback cancellation.

## Limits

Playback is browser-controlled; some browsers may require another explicit click after a track switch. Tested mobile profile uses Chromium emulation, not a physical iPhone or WebKit. No crossfade, independent per-room resume time, volume UI, audio persistence, or music library is added.
