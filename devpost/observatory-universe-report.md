# Observatory universe — implementation review

Implemented October 26, 2026. Source of intent: the learner’s four Observatory features and their confirmation that **each connected group has its own optional name**. See `observatory-universe.md` for the implementation decisions.

## Delivered experience

- Every Main Hall exhibit has a softly glowing, selectable star. Its exact title is revealed on the museum’s paper panel; unconnected stars stay visible. Stars and threads do not change the exhibit’s lasting light.
- Visitors explicitly choose two stars and confirm **Tie a golden thread**. Duplicate/reversed pairs and self-connections are prevented. New threads gently illuminate, then settle; reduced motion uses immediate static feedback.
- Each connected group may be named using only visitor-written words. Names allow 100 Unicode code points without silent truncation. Joining named groups retains both names; an explicit save can replace them with one chosen name. Untying leaves stars intact; names follow their selected anchor star or remain dormant until that star belongs to a group again.
- The original telescope, constellation wheel, clockwork comet, curator story and creation invitation remain. A scrollable chart and optional star/group indices keep larger skies reachable by touch and keyboard.

## Persistence and failure behavior

The sky uses only `almost:observatory:universe`. Saved names/threads return on reload. Open naming inputs and failed changes survive room trips in this page; they are not promised durable until explicitly saved. A temporary source exhibit keeps its thread temporary until that exhibit can be saved and the sky retried.

Validation preserves corrupt/future/unreadable raw data and blocks writes until explicit recheck. A valid, different saved graph is never silently overwritten during recovery. Same-pair IDs, baseline checks, idempotence, read-back and acknowledged previous own writes prevent duplicates and false conflicts after uncertain saves. Exhibit, creation-draft and journal keys are untouched by sky actions.

The graph is one small browser-local snapshot, so related edge/name updates save together. localStorage has no transactional compare-and-swap across tabs; the supported demo uses one active tab. Cleared site data or another origin does not retain this collection. No automatic migration, repair, reset, backend, runtime AI, analytics, network service or dependency was added.

## Executed checks

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed |
| Vitest | **103 passed**, including 46 new graph/storage cases |
| Full Playwright suite | **108 passed**, desktop Chromium and iPhone-profile Chromium |
| Production build | Passed; CSS 101.86 kB / 21.88 kB gzip, JavaScript 347.52 kB / 106.69 kB gzip |
| Motion-enabled thread check | `thread-illuminate` executed; reduced-motion suite found no running chart animations |

The 16 new browser executions cover real creation-to-star, manual connections, names/merge/untie, exact words and validation, room/reload retention, failed writes, uncertain write acknowledgement followed by newer edits, corrupt/future data plus explicit recheck, external conflict protection, temporary exhibits, dormant metadata, keyboard operation and 24-star responsive browsing. Existing creation/reveal/light/journal regressions also pass.

The first full run exposed a Conservatory seed-label/feedback collision at narrow widths. Its layout now grows with wrapped text and reserves feedback space at intermediate/wide widths; the existing seven-layout regression passes. Recheck/retry visibility and uncertain-write recovery were also corrected before the passing full run.

## Visual review

Inspected empty, selected and named skies on desktop, tablet, 390px and 320px. Screenshots use isolated synthetic exhibits, never personal museum content.

| View | Desktop | Phone |
| --- | --- | --- |
| Empty Observatory | [Desktop](screenshots/universe/desktop-empty.png) | [Phone](screenshots/universe/mobile-empty.png) |
| Named constellation | [Desktop](screenshots/universe/desktop-constellation.png) | [Phone](screenshots/universe/mobile-constellation.png) |

Also saved [joined names](screenshots/universe/desktop-joined-names.png), [tablet](screenshots/universe/tablet-constellation.png) and [320px](screenshots/universe/small-constellation.png).

No publication/deployment was performed. Physical-device, WebKit and full screen-reader audits were not performed; browser tests emulate phones. Final learner creative review and the official learning wrap-up remain open.
