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

- [ ] **3. Polish the museum and prepare a verifiable release**
  Becomes usable: A polished responsive museum with verified keyboard/reduced-motion behavior, deployment settings, instructions and final review readiness.
  Why now: Refines a working experience, preserving time for visual QA and submission preparation.
  PRD ref: `prd.md > Look and Feel`, `Accessible and Responsive Use`, `What We're Building`
  Spec ref: `spec.md > Accessibility and Responsive Behavior`, `Deployment Steps`, `Test Strategy and Acceptance Gates`
  Build: Refine scene/artifacts, implement agreed creative feedback, check narrow/desktop layouts, document Vercel Hobby and Render Static Site backup, add app map after final review.
  Verify (mechanical): Typecheck, lint, unit and browser suites, production build; desktop/mobile/reduced-motion screenshots and focus checks.
  Learner check: Explore the whole app, including awkward text and narrow viewports; identify anything broken, confusing or worth changing before shipping.
  Commit: `Polish museum accessibility and deployment readiness`

## Hands-on Checkpoints

Slices 1–2 mechanical evidence: TypeScript, lint, 22 pure tests, production build, and 24 desktop/mobile browser scenario executions passed. Desktop empty-room and mobile creation/plaque screenshots inspected. Early feedback received as the learner's Midnight Keepsake Museum brief: replace the formal gallery with a miniature storybook world and Pip. This authorizes the redesign recorded in `redesign.md`; final review remains pending.

- [x] Early usable behavior explored — learner supplied detailed creative feedback and authorized the Midnight Keepsake Museum revision.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — focused evidence-based connection between safe retries and observable acceptance criteria
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Pending actual build verification and learner review.
Route and stops: Pending finished implementation.
Edit outcome: Pending; no extra exercise required if declined.
Reflection: Not yet offered.
Activity mode: Fast execution with creative feedback and final focused wrap-up.

## Revisions

- Learner authorized a complete visual/interaction reinvention after the first playable checkpoint. Pip, asymmetric shelves, paper ritual and keepsake card replace the formal gallery. Storage schemas and semantics remain unchanged; see `redesign.md`.

- Grouped the learner-authorized implementation order into three end-to-end slices and used fast pacing as requested, avoiding a repeat plan-approval question. Early creative and final hands-on reviews remain required.
- App coordinates built-in React state and synchronous refs with pure upsert helpers rather than one large reducer. This preserves the specified model and prevents stale event handlers from dropping newer input.
- Browser/code review exposed pending-word loss during light saving, hidden seventh-exhibit selection after reveal, and same-ID draft conflict presentation. Corrected those paths and added regression tests before the first checkpoint.
- Visual QA exposed pointer interception by decorative SVGs and colored turbulence noise. Decorative artwork now ignores pointer input and uses neutral monochrome texture.
