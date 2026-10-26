# Display sizing verification

The learner requested a 20% reduction of the Main Hall display section and its exhibits. `src/styles/gallery.css` scales the section to 80% around its existing horizontal centre, including artifacts, shelf structures, plaques and placeholders. Browsing controls retain 44px targets and readable text. The museum, curator table and creation flow are unchanged.

Measured using seven synthetic exhibits in isolated desktop/mobile browser contexts:

| Viewport | Section before → after | Artifact before → after |
| --- | --- | --- |
| 1440px | 705.59×510 → 564.48×408px | 205 → 164px |
| 390px | 390×368 → 312×294.4px | 220 → 176px |

Plaque bounding boxes also shrink to 80%; arrow targets measure 44×44px in both layouts. [Desktop](screenshots/display-size/1440.png) and [mobile](screenshots/display-size/390.png) screenshots inspected. Desktop pagination, mobile gallery and existing reveal/light/persistence behavior pass 16 focused browser checks. The subsequent readiness run passes typecheck, lint, 103 unit tests, all 116 browser checks and production build.

Learner confirms the final experience is finished during shipping readiness review. No model/storage changes, new dependencies or features.
