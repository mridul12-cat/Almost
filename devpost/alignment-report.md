# Curator-table alignment

October 26, 2026. Implements the learner’s clarification: the bell, Pip, note and lamp belong **on the table**.

All five discoveries, including the guestbook, now stand on one common wooden tabletop. Their labels sit on the table’s apron, and the existing creation invitation occupies its front panel. This replaces the earlier separate shelf/row arrangement. Responsive column widths keep names inside their controls at 320px and the narrow desktop breakpoint.

`MuseumScene.tsx` passes its unchanged creation/placement panel into `MuseumEnvironment.tsx` through a desk slot. A shared `curator-table` wrapper and `alignment.css` tie the objects and desk together. Existing handlers, modal/focus behavior, reveal/light state and persistence are retained. The pre-existing uncommitted `refinements.css` changes and decorative window-label star remain untouched.

Executed: typecheck, lint and production build passed. **20 focused desktop/mobile browser checks passed** across layout, object interactions, exact storage preservation, creation/reload/lights, failed-save ceremony behavior and keyboard skipping. The table regression checks eight viewports from 320px to 1920px: shared table containment, object baselines at the tabletop, aligned labels, no label collisions and a clear creation panel. The entire browser suite was not rerun for this focused correction.

Inspected desktop, wide desktop, tablet, phone and 320px layouts. Screenshots show isolated empty museums, without personal content.

- [Shared tabletop](screenshots/alignment/desktop-corner.png)
- [Phone museum](screenshots/alignment/mobile-hall.png)

No dependencies, services or storage changes. Final learner creative review remains open.

Follow-up sizing polish: Pip’s tabletop drawing is 16% larger and the bell is 14% larger, anchored at their resting points. Desktop/phone crops were inspected; the production build and four focused layout checks passed. The linked screenshots above record the preceding tabletop arrangement.

Pip sizing refinement: increased the current drawing by a further 30% (1.16 × 1.30 = 1.508 relative to the original). The tabletop anchor and bell size are retained. Production build and four responsive layout checks passed; desktop/320px crops were inspected.
