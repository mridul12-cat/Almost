---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast — requested concise execution, with creative hands-on checkpoints.

Authorization: the learner supplied the build order and explicitly requested implementation now, interrupting only for creative judgment. These slices group that authorized order into usable checkpoints rather than requesting the same permission again.

## Slices

- [x] **1. Give an unfinished idea a place and a light**
  Becomes usable: A runnable museum with three-step creation, five forms, a reveal, plaque, independent light controls, and normal save/reload.
  Why now: Includes scaffolding and the storage risk inside the first complete journey; the unique kernel is visible immediately.
  PRD ref: `prd.md > The Core Journey`, `Place and Reveal`, `Select, Illuminate, and Replay`
  Spec ref: `spec.md > Components`, `Data Model`, `Persistence and Recovery`, `Look and Feel`
  Build: React/Vite/TypeScript setup, typed records and storage, room, controlled creation, SVG forms, reveal, plaque and light controls.
  Verify (mechanical): Typecheck, unit tests, production build; browser create/reload/light independence flow and visual inspection.
  Learner check: Open the running museum, create an exhibit, inspect its reveal and light interaction; report whether the atmosphere and ceremony reflect your vision.
  Commit: `Build the first complete museum experience`

- [x] **2. Preserve words through interruptions and grow the collection**
  Becomes usable: Session drafts, editable failed creations, safe retry and blocked corrupt-storage mode, plus desktop/mobile browsing beyond six exhibits.
  Why now: Builds fault verification on the proven normal journey before spending the remaining effort on presentation.
  PRD ref: `prd.md > Session Draft and Cancellation`, `Save Failure and Retry`, `Return and Browse the Collection`
  Spec ref: `spec.md > Persistence and Recovery`, `ExhibitGallery`, `Test Strategy and Acceptance Gates`
  Build: Complete draft reconciliation, fault handling, explicit read-only recheck, statuses, gallery navigation and baseline conflicts.
  Verify (mechanical): Run storage/model tests and browser failure/retry, draft, corruption and seven-exhibit tests; typecheck and build.
  Learner check: Close/reopen a draft, add several exhibits and browse them; verify light state on return.
  Commit: `Verify resilient drafts recovery and collection browsing`

- [x] **3. Polish the museum and prepare a verifiable release**
  Becomes usable: A polished responsive museum with verified keyboard/reduced-motion behavior, deployment settings, instructions and final review readiness.
  Why now: Refines a working experience, preserving time for visual QA and submission preparation.
  PRD ref: `prd.md > Look and Feel`, `Accessible and Responsive Use`, `What We're Building`
  Spec ref: `spec.md > Accessibility and Responsive Behavior`, `Deployment Steps`, `Test Strategy and Acceptance Gates`
  Build: Refine scene/artifacts, implement agreed creative feedback, check narrow/desktop layouts, document Vercel Hobby and Render Static Site backup, add app map after final review.
  Verify (mechanical): Typecheck, lint, unit and browser suites, production build; desktop/mobile/reduced-motion screenshots and focus checks.
  Learner check: Explore the whole app, including awkward text and narrow viewports; identify anything broken, confusing or worth changing before shipping.
  Commit: `Reinvent Almost as the Midnight Keepsake Museum`

## Hands-on Checkpoints

Slices 1–2 mechanical evidence: TypeScript, lint, 22 pure tests, production build, and 24 desktop/mobile browser scenario executions passed. Desktop empty-room and mobile creation/plaque screenshots inspected. Early feedback received as the learner's Midnight Keepsake Museum brief: replace the formal gallery with a miniature storybook world and Pip. This authorizes the redesign recorded in `redesign.md`; final review remains pending.

- [x] Early usable behavior explored — learner supplied detailed creative feedback and authorized the Midnight Keepsake Museum revision.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Observatory universe implemented and mechanically verified — exhibit stars, explicit golden threads, optional per-group names, preserved merge/split metadata, safe local recovery, keyboard/reduced-motion and responsive browsing.

- [x] Cohesion refinement implemented and mechanically verified — clearer exhibit hierarchy, consistent discovery feedback, subtle accessible room arrivals, optional journal purpose and responsive collision coverage.

- [x] Conservatory memory journal implemented and verified — themed notebook, dated entries/editing, safe independent persistence, recovery and responsive/keyboard checks.

- [x] Two story rooms implemented and mechanically verified — navigation, distinct stories/interactions, preserved core journey and exact storage bytes.

- [x] Expanded hall revision implemented and mechanically verified — architectural depth, optional room discoveries, preserved creation and storage flows.

- [x] Creative pass 2 implemented and verified — composed room, event-driven Pip, explicit unsaved preview stage, larger/readable exhibits and five-viewport QA.
- [x] Implement authorized Midnight Keepsake Museum reinvention and mechanically verify it — 22 unit tests, 34 browser tests, typecheck, lint and production build passed; desktop/mobile/tablet screenshots inspected.
- [ ] Learner explores the redesigned room, ritual, reveal and details; any further feedback is clarified and resolved.
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — focused evidence-based connection between safe retries and observable acceptance criteria
- [ ] Optional edit and transfer reflection addressed
- [x] `devpost/app-map.html` generated from current code, checked offline with JavaScript disabled, and opened/shown as a reference snapshot; final learner review remains pending

Activity and evidence: Reference recap prepared from actual passing tests: reveal/light independence, failed-save ceremony suppression and exact-byte preservation of twelve records. This is an agent explanation, not completed learner practice; final review is pending.
Route and stops: Reference-only route: CreationPanel / field → App / place, persist, light, replay → museumStorage / save, load, readDraft. Not toured interactively.
Edit outcome: Not offered during pending final review; no extra exercise required.
Reflection: Not asked; optional transfer reflection remains available after final review.
Activity mode: Fast execution with creative feedback and final focused wrap-up.

## Revisions

- Learner authorizes three supplied local room tracks and an animated SVG play/pause control. `room-music.md` narrowly extends the silent POC boundary for opt-in room music. Added one shared looping audio element, page-only intent, reduced-motion visuals and safe playback retry/cancellation. Moved the desktop player alongside room signs after the first full run exposed a below-fold creation invitation; updated obsolete no-audio-element tests to assert silent default behavior. Final verification: 103 unit tests, 116 browser executions, lint and production build passed. See `room-music-report.md`; learner creative acceptance remains open.

- Learner authorizes an Observatory star map and confirms a separate optional name for each connected group. `observatory-universe.md` extends the room-only ephemeral rule for independent sky persistence. 103 unit tests and 108 browser executions pass with typecheck, lint and production build. Corrected recheck/retry visibility, read-back acknowledgement followed by newer edits, and a Conservatory narrow-label collision exposed by the full suite. Exhibit/light/journal storage and the table’s current sizing remain intact. Final creative acceptance remains open.

- Learner clarifies that Pip, the bell, note and lamp should stand on the table. Replaced the separate shelf rows with one tabletop containing all five discoveries, including the guestbook, and placed the existing creation invitation in its front panel. All handlers/storage behavior remain intact. The focused tabletop/core-flow regression set passes; see `alignment-report.md`.

- Learner supplies a screenshot of crowded curator labels and asks for proper alignment. Grouped Pip/lamp and desk discoveries into a shared responsive grid with labels inside each button, common illustration/label rows and a small shared ledge. `alignment-report.md` records focused checks and screenshots. Existing uncommitted room-style adjustments were preserved rather than replaced.

- Learner authorizes a presentation-only cohesion pass across the three rooms. Rebalanced Hall spacing and mobile reading/tab order, retained all room discoveries, added CSS arrivals/short described introductions and clarified the optional journal. Storage/model/core-event code and dependencies are unchanged. `refinement-report.md` records executed checks and screenshot review; final learner acceptance remains open.

- Journal extension verified: typecheck, lint, 57 unit tests and 82 browser executions passed with a production build. Corrected duplicate field/dialog IDs and phone-size heading/discovery spacing. Original/updated timestamps, raw content, same-ID retry, corruption/conflict safeguards, cleanup reconciliation and existing exhibit bytes are covered. Final creative acceptance remains open.

- Learner authorizes a Conservatory memory journal. `journal.md` extends the side rooms’ prior no-persistence rule only for explicitly saved journal pages and session drafts; exhibit storage is unchanged.

- Two-room extension verified after learner confirmation of themes: 22 unit tests and 62 browser executions passed, plus typecheck, lint and production build. Both rooms inspected at five viewports; paper-label contrast and tablet feedback collision corrected. Collection page/mobile position, exact storage bytes and same-ID creation handoff retained. No new services, dependencies or storage schema changes; final creative acceptance remains open.

- Learner explicitly expands the museum to two additional themed story rooms. See `story-rooms.md`; existing creation and storage architecture remain intact. Themes offered for learner steering; final creative acceptance remains open.

- Hall revision verified: typecheck, lint, 22 unit tests, production build and 50 desktop/mobile browser tests passed. Inspected five viewport pairs (empty/ten exhibits), guestbook and plaque. Window crop, desk target interception and narrow-label spacing corrected. No model/storage/dependency changes. Final learner acceptance remains open.

- Learner’s hands-on feedback explicitly authorizes the environment redesign in `hall-redesign.md`; creation is working and should remain mostly intact. One continuous hall gains layered architecture and optional ephemeral discoveries. Final creative acceptance remains open.

- Learner's second creative review authorizes refinement of the existing world, including an explicit fourth unsaved preview stage. No persisted schema or storage semantics change; see `creative-pass-2.md`. Final hands-on review is reopened for the refined implementation.

- Implemented the authorized redesign with local SVG room scenery, Pip, notebook/name-tag/object-tray creation, keepsake-box details and independent shelf lanterns. Failed persistence bypasses the success ceremony. Added five browser scenarios for Pip, failure ceremony, 12-record preservation, network independence and narrow layouts.
- Tablet visual QA found the speech note colliding with the desk action; suppress that optional note at intermediate widths and give shelf rows more space. Measured paper-text and primary-control contrast; darkened essential text/control colors to at least 4.5:1 for the checked pairs.
- Added static Vercel settings and retained Render Free Static Site as backup. Removed one unused development lint plugin; no runtime dependency or storage schema change. Nothing pushed, published or deployed.
- Saved redesign source as `03c2132`. Added the offline app map as a clearly labeled reference snapshot; validated native details and essential content with scripts disabled and zero external requests. No interactive learner activity or final sign-off is claimed.

- Learner authorized a complete visual/interaction reinvention after the first playable checkpoint. Pip, asymmetric shelves, paper ritual and keepsake card replace the formal gallery. Storage schemas and semantics remain unchanged; see `redesign.md`.

- Grouped the learner-authorized implementation order into three end-to-end slices and used fast pacing as requested, avoiding a repeat plan-approval question. Early creative and final hands-on reviews remain required.
- App coordinates built-in React state and synchronous refs with pure upsert helpers rather than one large reducer. This preserves the specified model and prevents stale event handlers from dropping newer input.
- Browser/code review exposed pending-word loss during light saving, hidden seventh-exhibit selection after reveal, and same-ID draft conflict presentation. Corrected those paths and added regression tests before the first checkpoint.
- Visual QA exposed pointer interception by decorative SVGs and colored turbulence noise. Decorative artwork now ignores pointer input and uses neutral monochrome texture.
