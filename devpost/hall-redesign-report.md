# Hall redesign review

## Result

The small framed diorama has become a full-width Hall of Beginnings. Tall paired twilight windows and an arched corridor establish height and a museum beyond the visible hall. Recessed walls, spotlit shelves, lower plinths, converging floorboards, a rug and near pillars establish background, midground and foreground. Pip’s desk anchors the creation invitation. Mobile unfolds the same hall vertically around the existing swipe/arrow gallery.

Creation, editable exact words, the unsaved preview, one-save reveal, separate persistent lights, retries and corrupt-storage protections are retained. No dependency, schema, backend, AI, audio, external artwork or font added.

## Optional discoveries

- Window: still stars brighten briefly and a short line appears.
- Desk lamp: explicit on/off room glow, independent of every exhibit light.
- Bell: brief visible ring and text; deliberately no audio.
- Guestbook: opens a curator-written welcome, with no fabricated visitor signatures or new persistence feature.
- Curator note, empty pedestal and Pip: short readable stories in accessible dismissible panels.

Room states reset on reload. Discoveries never read or write the exhibit/draft store.

## Implementation map

- `src/components/MuseumAtmosphere.tsx`: original architectural SVG.
- `src/components/MuseumEnvironment.tsx`: local discovery state, physical object buttons, notes and welcome book.
- `src/components/MuseumScene.tsx`: continuous room composition and existing desk/ceremony invitation.
- `src/styles/hall.css`: full-width layered scene and responsive layout, separate from ritual styling.
- `src/components/PanelDialog.tsx`: environment variant, retaining native modal semantics/focus/Escape/return.
- `src/main.tsx`: loads scene stylesheet.
- `tests/e2e/museum.spec.ts`: new discovery, keyboard, reduced-motion and exact-byte preservation coverage, alongside all existing core tests.

The working tree also included the authorized preceding creative pass: `PlacementPreview`, `usePipBehavior`, updated creation/gallery/Pip styling and tests. These are preserved and verified together; existing storage/model modules are unchanged.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test -- --run` — 22/22 unit tests passed.
- `npm run build` — passed; final assets `index-CXng59B2.css` and `index-Ce7xFOjA.js` (13.24 kB CSS / 87.96 kB JS gzip).
- `npm run test:e2e` — **50/50 passed in 38.6 seconds**, against the final production build. This includes creation, duplicate prevention, preview cancellation, independent lights/replay, failed writes/retries, corrupt records, exact-byte preservation, 24-exhibit browsing, five responsive layouts, keyboard/focus, reduced motion and all room discoveries.
- Final manual geometry check — creation invitation fully inside all five checked viewports, including 320×700.
- `git diff --check` — passed; no changes to the existing model or storage modules.

Visual inspections cover 1440×900, 1920×1080, 768×1024, 390×844 and 320×700, empty and ten-exhibit collections. The regression suite also exercises 24-record browsing. Screenshot fixtures use isolated synthetic collections, never the visitor’s saved museum.

QA found and fixed the mobile window crop, competing desk labels and a desktop lamp click target covered by the curator note. Additional mobile spacing keeps the main invitation visible without scrolling at the checked viewport sizes.

## Screenshots

| View | Empty hall | Collection |
| --- | --- | --- |
| Desktop | [1440×900](screenshots/hall/desktop-empty.png) | [Ten exhibits](screenshots/hall/desktop-collection.png) |
| Large desktop | [1920×1080](screenshots/hall/large-empty.png) | [Ten exhibits](screenshots/hall/large-collection.png) |
| Tablet | [768×1024](screenshots/hall/tablet-empty.png) | [Ten exhibits](screenshots/hall/tablet-collection.png) |
| Mobile | [390×844](screenshots/hall/mobile-empty.png) | [Ten exhibits](screenshots/hall/mobile-collection.png) |
| Narrow mobile | [320×700](screenshots/hall/small-empty.png) | [Ten exhibits](screenshots/hall/small-collection.png) |

[Desktop guestbook](screenshots/hall/desktop-guestbook.png) · [Narrow guestbook](screenshots/hall/small-guestbook.png) · [Desktop plaque](screenshots/hall/desktop-plaque.png) · [Narrow plaque](screenshots/hall/small-plaque.png)

## Limits

Browser verification uses Chromium desktop/mobile emulation, not physical devices or a full assistive-technology audit. Browser/device/origin storage limitations and single-active-tab conflict boundaries remain. No deployment, push or publication was performed. Final creative acceptance and the Devpost learning wrap-up remain open; mechanical verification does not substitute for the learner’s review.
