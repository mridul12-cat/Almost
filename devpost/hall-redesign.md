# The Hall of Beginnings — authorized environment revision

The learner's latest hands-on review found creation working well, but the museum too small and boxed-in. This revision expands the **presentation of one hall**, not the app's services or creation scope.

## Layout

- Background: high cornice, tall paired twilight windows, recessed collection wall, distant side arch and lanterns. The arch suggests a larger museum; it is not a locked or promised destination.
- Midground: six curated display positions, upper wood shelves and lower plinths, spotlights and independent persistent exhibit lanterns. Existing pagination and mobile swipe/arrow browsing remain.
- Foreground: Pip and the keepsake desk, guestbook, quiet bell, lamp, worn floor and near pillars. Visible floorboards converge toward the back wall.
- Responsive: full-width desktop hall; a taller, deliberate mobile composition of the same window, desk and gallery. Page scrolling is permitted; horizontal page overflow is not.

## Discoveries

Twilight window twinkles and shows a short line. The desk lamp toggles a temporary room glow. Bell rings visually, with text feedback and no audio. Guestbook opens a curator-written welcome (no fabricated visitor entries or new writing feature). Curator note, empty-pedestal inscription and Pip each open a short readable keepsake. All controls have accessible names and keyboard operation. Reduced motion replaces movement with still light/text feedback.

These objects have local React state only. They never inspect or mutate exhibit records, draft words, saved light states, or storage. Room lamp resets on reload. No AI, backend, dependencies or additional navigable rooms.

## Implementation and verification

`MuseumAtmosphere` owns original local SVG architecture. `MuseumEnvironment` owns optional discoveries and ephemeral state. `MuseumScene` composes these around existing `ExhibitGallery` and creation station. `hall.css` isolates presentation changes from creation/preview/plaque styles. `PanelDialog` gains an environment variant while retaining modal focus/Escape/return behavior.

Verify the unchanged core journey, draft recovery and corrupt-storage protections; test discoveries without storage writes, dialog focus return, reduced motion and viewport geometry. Inspect empty and populated desktop/tablet/mobile screenshots. Final creative review remains the learner's decision.
