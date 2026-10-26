# Room music — verification report

## Delivered

Three supplied local tracks, one per room, and a smiling handcrafted SVG record-player control. Click/tap or Enter/Space starts and pauses music. The box sways, its record glimmers and notes float during actual playback. Reduced motion leaves a static indicator. Music starts off, never changes saved museum content, and uses one looping audio element at 35% player volume.

Playing follows room changes; paused music stays off. Reload starts quiet. Track downloads wait for a playback request. Failed requests and browser playback restrictions show retry feedback; rapid pause and stale play rejections cannot restart an unwanted track.

The compact desktop control shares the room-sign rail. Smaller screens use a separate row. It never overlays an exhibit or discovery. All original tracks remain in the learner’s local `music/` folder; three byte-identical public copies are included in the production output. No dependencies, services, storage keys or schema changes.

## Executed checks

- `npm run build` — passed, including TypeScript checks and Vite production output. Verified all three MP3s in `dist/music/`.
- `npm run lint` — passed without warnings.
- `npm run test -- --run` — **103 unit tests passed**.
- `npm run test:e2e` — **116 desktop/mobile browser checks passed** on the final implementation, including eight new music executions.
- Actual local MP3 playback decoded and advanced in desktop and mobile Chromium contexts. These are playback-state checks, not a claim of a human listening review or physical-device testing.
- Keyboard focus/Enter/Space, reduced-motion static feedback, narrow layouts, no initial MP3 request, pause/reload behavior, room switching with one player, storage preservation, playback rejection, failed audio retry and stale-request cancellation all passed.
- Production copies match the supplied source files by SHA-256.
- Updated app map remains readable offline with JavaScript disabled and zero external requests.

The first full run exposed an extra-row regression that moved the desktop creation button below the first screen. Moving music alongside the room signs fixed it; the full final suite confirms the primary action is fully visible again. Older no-audio-element assertions were replaced with stronger relevant checks: the one optional player stays paused with no source after journal/discovery interactions; the bell still makes zero sound calls.

## Visual review

Browser screenshots captured for all three rooms at 1440×900 desktop and 390×844 mobile sizes. Inspected the final Hall desktop/mobile composition and the initial Conservatory mobile composition; automated layout checks cover the current control across all three rooms and multiple widths.

- [Desktop Main Hall](screenshots/music/desktop-hall.png)
- [Desktop Conservatory](screenshots/music/desktop-conservatory.png)
- [Desktop Observatory](screenshots/music/desktop-observatory.png)
- [Mobile Main Hall](screenshots/music/mobile-hall.png)
- [Mobile Conservatory](screenshots/music/mobile-conservatory.png)
- [Mobile Observatory](screenshots/music/mobile-observatory.png)

## Limits

Mobile checks use Chromium emulation, not a physical iPhone/WebKit. Browser autoplay rules can require a fresh click after a room switch. Music does not preserve playback time between rooms or remember an enabled setting across reloads. Local originals are retained outside this change’s Git checkpoint; the deployed app uses the committed public copies. Final learner creative review remains open.
