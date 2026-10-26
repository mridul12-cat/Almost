# Three-room cohesion refinement

Implemented October 26, 2026, from the learner’s requested presentation pass. The established palette, SVG architecture, five artifacts, Pip and all three rooms remain.

## What changed

- Main Hall: larger, better-spaced exhibit rows, fewer decorative empty shelves, a quieter curator corner and clear separation between plaques, browsing controls and object targets. Phones encounter creation and exhibits before optional discoveries; keyboard reading order follows that priority.
- Discoveries: a small brass diamond identifies touchable environmental objects. Shared hover, focus and press feedback applies across rooms; exhibit plaques have a small opening arrow. Decoration stays outside pointer/keyboard interaction.
- Arrival: a brief 500ms scene entrance and 450ms introduction fade connect the destinations. Native heading focus describes the short atmospheric introduction. Reduced motion removes both animations immediately; no animation/timer gates navigation or saving. The Main Hall gallery stays mounted across room visits.
- Journal: “A place for memories that don’t need a pedestal.” The Conservatory describes it as optional. Existing dated pages, editing, session draft and recovery stay intact; no notebook features were added.
- Responsive polish: narrowed layouts allow story content to flow with wrapped labels. Intermediate and wide layouts reserve separate space for feedback, invitations and collection controls.

The implementation is concentrated in `src/styles/refinements.css`, with small presentation/copy changes in MuseumScene, MuseumEnvironment, StoryRoom and MemoryJournal. Original exhibit/journal storage modules, models, App core event handling and dependencies are unchanged.

## Executed verification

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run test -- --run`: **57 passed**.
- `npm run build`: passed. Final assets: CSS 85.76 kB (18.70 kB gzip); JavaScript 329.22 kB (101.53 kB gzip).
- Full `npm run test:e2e`: **90 passed**, desktop Chromium and iPhone-profile Chromium. Includes existing creation, preview/reveal, light/replay separation, persistence/retry/corruption, browsing and journal workflows.
- After the final tablet feedback-spacing adjustment, rebuilt and reran room/refinement suites: **20 passed**. New coverage verifies distinct discovery hit areas, unclipped browsing, visible focus, brass marks, room introductions, reduced motion and exact retained journal words/timestamps.
- Room layout checks cover 320×700, 390×844, 600×900, 768×1024, 1440×900, 1920×900 and 1920×1080. Hall checks additionally cover 1024×768. Existing short-viewport creation/plaque checks remain passing.

Initial checks caught and corrected a mobile window target blocked by collection controls, narrow story labels colliding with feedback, desktop plaque/pager crowding and lamp/curator-note targets overlapping. Visual review then separated tablet feedback from the room invitation; that relationship now has an explicit assertion.

## Visual review

Inspected empty/inhabited Hall, Conservatory, Observatory and journal at desktop and phone sizes; also checked tablet, 320px and a wide/short desktop. All committed exhibit fixtures are synthetic; visitor storage was never used for screenshots/tests.

| View | Desktop | Phone |
| --- | --- | --- |
| Empty Hall | [Desktop](screenshots/refinement/desktop-empty.png) | [Phone](screenshots/refinement/mobile-empty.png) |
| Collection | [Desktop](screenshots/refinement/desktop-collection.png) | [Phone](screenshots/refinement/mobile-collection.png) |
| Conservatory | [Desktop](screenshots/refinement/desktop-conservatory.png) | [Phone](screenshots/refinement/mobile-conservatory.png) |
| Observatory | [Desktop](screenshots/refinement/desktop-observatory.png) | [Phone](screenshots/refinement/mobile-observatory.png) |
| Optional journal | [Desktop](screenshots/refinement/desktop-journal.png) | [Phone](screenshots/refinement/mobile-journal.png) |

Additional small/tablet captures are in `screenshots/refinement/`.

## Limits and handoff

No backend, runtime AI, external fonts/artwork, new dependency, data migration or deployment. Journal and collection remain browser/origin-local with the existing honest storage-failure limitations. Browser checks emulate phones; physical-device, WebKit and full screen-reader audits were not performed. Final learner creative review and the official learning wrap-up remain open; this report does not claim learner sign-off or shipping completion.
