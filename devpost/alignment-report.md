# Curator-corner alignment

October 26, 2026. Corrects the learner’s screenshot of the Main Hall corner.

Pip and the lamp now occupy a common row and little wooden ledge. Bell, guestbook and curator note use three equal columns with consistent illustration heights, label baselines and comfortable gaps above the creation desk. Labels remain inside their button bounds, so the guestbook cannot cover Pip’s name. The window invitation has its own clear position. Phone/tablet layouts keep the same rows after the exhibit collection, with room for the empty pedestal and feedback.

`MuseumEnvironment.tsx` adds a layout-only wrapper. `alignment.css` supplies the responsive grid. All handlers, labels, modal/focus behavior, storage and exhibit creation are retained. Existing uncommitted changes to `refinements.css` and the decorative window-label star are preserved.

Executed: typecheck, lint and production build passed; **12 focused desktop/mobile browser checks passed**. A new label-alignment regression checks eight viewports from 320px to 1920px: labels are contained by controls, do not cover other drawings/labels or the desk, and the three desk labels align. Existing discovery interactions, keyboard focus/dismissal, reduced motion and unchanged storage bytes also passed. The entire browser suite was not rerun for this focused correction.

Inspected desktop, wide desktop, tablet, phone and 320px layouts. Screenshots contain only synthetic fixture data.

- [Aligned desktop corner](screenshots/alignment/desktop-corner.png)
- [Phone museum](screenshots/alignment/mobile-hall.png)

No new dependencies, backend, deployment or persistence changes. Final learner creative review remains open.
