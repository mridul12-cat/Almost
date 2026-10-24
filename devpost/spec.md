---
doc: spec
status: approved
---

# ALMOST — Technical Spec

## How This Works, In Plain Language

ALMOST is one React page: a museum room, a creation panel, and an exhibit plaque. The visitor writes the words and chooses the object; the app supplies the presentation. Five local SVG illustrations and CSS create the museum and its small magical moments without external image or AI services.

Each exhibit receives an ID when its creation begins. That ID stays with its draft, temporary exhibit, saved record, and every retry. Saving replaces only the record with that ID, never appends a duplicate or replaces the entire collection. React keeps the current collection and unsaved words in memory. localStorage remembers successfully saved exhibits; sessionStorage remembers the unfinished creation in that tab. Both can fail, so the app reports what is actually saved.

The reveal spotlight, selection highlight, and replay animation live only in temporary screen state. The lasting light is a separate saved boolean, initially off. Looking at an exhibit or replaying its animation never changes that boolean.

No server processes visitor text. Storage remains tied to the exact site origin and browser; clearing browser data, changing the deployment address, or losing access to storage can prevent recovery. In-memory content cannot survive a reload. This is a personal museum proof of concept, not a permanent archival service.

Implements `prd.md > The Core Journey`, `Product Decisions`, and `States and Boundaries`.

## The Core Journey Through the System

1. **Arrival:** the app reads ALMOST records through the storage module before enabling writes. Valid records become the collection. No records produces the empty pedestal; unreadable records produce a warning and session-only mode, not a misleading empty-state success.
2. **Begin:** opening new creation allocates one stable ID. Controlled fields preserve raw text in React; draft updates are written to sessionStorage with caught failures. Reopening resumes the same draft and step.
3. **Name and choose:** the naming helper offers one deterministic suggestion. Once initialized, the title is not regenerated on back/next or description changes. Native form choices select one of five artifact IDs; no classification occurs.
4. **Place:** a synchronous submission guard validates the draft, creates or updates one in-memory exhibit by ID with its persistent light off, and attempts a save. Success clears the completed draft; failure retains editable recovery data with that same ID. The exhibit appears either way, with an honest saved/temporary status.
5. **Reveal:** temporary UI state animates the selected SVG and spotlight. On completion, reveal state clears; its completion never writes a light value. Reduced motion completes this immediately.
6. **Browse and remember:** selection opens a plaque only. Leaving a light on updates the boolean and attempts persistence, while replay changes temporary animation state only. Light toggle writes the visitor's explicit new value.
7. **Retry:** validate current storage and retry only the pending ID's latest intended record. Successful retry marks it saved without inserting another exhibit. Read/schema failures prohibit any persistent write.
8. **Return:** reread saved records and the session draft; reconcile matching IDs so a stale draft cannot create a second copy of an already saved exhibit. Restore saved light booleans, never reveal or playback state.

Implements `prd.md > The Core Journey`, `Place and Reveal`, and `Save Failure and Retry`.

## Stack

| Tool | Decision and reason | Documentation |
| --- | --- | --- |
| React + React DOM | User-preferred UI; built-in reducer/hooks and props suffice. No global-state library or router. | [React](https://react.dev/learn) |
| Vite + official React plugin | User-preferred local development and static production build. | [Vite guide](https://vite.dev/guide/), [React plugin](https://github.com/vitejs/vite-plugin-react) |
| TypeScript, strict mode | Small typed model and explicit action/results; runtime validation still required for storage. | [TypeScript](https://www.typescriptlang.org/docs/) |
| CSS + inline SVG | Local, handcrafted room and artifacts, responsive styles and lightweight animation. No canvas/3D or animation library. | [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |
| Web Storage | localStorage exhibits; sessionStorage draft; caught synchronous operations and no database. | [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), [setItem failures](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem) |
| Vitest, development only | Pure storage, naming, validation, and reducer tests in Node; injected storage adapter avoids a DOM dependency. | [Vitest](https://vitest.dev/guide/) |
| Playwright Test, development only | Real-browser critical flows, fault injection, reloads, keyboard and mobile/reduced-motion tests. | [Playwright](https://playwright.dev/docs/intro) |

Use npm and one package-lock.json. Resolve compatible stable package versions at setup, inspect engine/peer requirements, and lock the exact installed versions; none are installed or pinned in this planning stage. Documentation checked October 24, 2026: Vite lists Node 20.19+ or 22.12+; current Vitest lists Node >=22.12 and Vite >=6.4. Use a supported Node 22 release >=22.12 or a compatible newer LTS, verified against the resolved tools. Do not blindly pin an old package major or modify the user's global runtime.

Runtime dependencies are React and React DOM only. Tooling may retain the Vite template's small lint setup; do not add UI kits, schema packages, animation libraries, analytics, font CDNs, or network services.

## Where It Runs and How Someone Tries It

Implements `scope.md > The POC Boundary` and `prd.md > Non-Goals`.

- Modern desktop/mobile browsers with SVG, CSS media queries, native dialog, and Web Storage. Run over localhost or HTTPS, not by opening index.html as a file.
- Planned setup after build approval: `npm install`; subsequent reproducible installs use `npm ci`.
- Planned local start: `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`; open **http://127.0.0.1:5173/**.
- Planned checks: `npm run typecheck`, `npm run lint`, `npm run test -- --run`, `npm run test:e2e`, and `npm run build`. Scripts must be defined during build; they do not exist yet.
- Planned production preview: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`; open **http://127.0.0.1:4173/**. Browser tests use this production preview through Playwright's webServer configuration.
- No API keys or environment variables required. Never request credentials in chat. A deployment operator needs a hosting account; visitors do not.
- A public GitHub repository and short demo video remain required. A deployed link supplements them. Record the core journey on the deployed site or local preview; use a clean browser context so the empty state can be demonstrated without deleting a personal collection.

## Look and Feel

Implements `prd.md > Look and Feel`, `Museum Room and Arrival`, and `Exhibit Plaque`.

- CSS custom properties: deep twilight navy, amber highlights, warm wood, muted parchment text surfaces, and restrained gold. Candidate implementation tokens: twilight #142238, wood #644633, amber #E6B66F, parchment #F6E9CF, plaque ink #29251F. Verify actual text/control contrast rather than assuming these combinations pass.
- Typography: local system serif stack (Georgia and fallbacks) for inscription and exhibit names; system sans-serif for body/control text. No font request or additional asset licensing dependency. Readable line lengths and generous spacing matter more than decorative type.
- CSS/SVG room layers: arched windows and twilight backdrop, wall texture, floorboards, plinths/shelves, restrained light pools, and a few decorative particles. Use original local SVG paths and CSS gradients; no raster image generation, remote artwork, heavy blur, or expensive animated filters.
- Five distinct artifact drawings with grouped parts for the approved book, spaceship, plant, music box, and canvas motions. Reuse their viewBoxes for previews and placed exhibits; generate unique SVG gradient/mask IDs per rendered instance.
- Persistent-light mark, reveal spotlight, selection outline, and replay glow each have their own CSS class/element. None is inferred from another effect being visible.
- One short reveal, approximately 1–1.5 seconds; artifact replay 2.5 seconds. Very subtle ambient movement stops under reduced motion. No rapid strobing, reward bursts, audio, or excessive UI cards.
- UI copy uses the PRD's supplied wording. No psychological interpretation, productivity language, completion prompts, or engagement pressure.

## Components

### App

Owns top-level built-in React state and synchronous refs for the initialized collection, draft, selection, active panel, and save/load statuses; ExhibitGallery owns browsing position. Pure helpers upsert records by ID. Calls a single storage module from explicit event handlers, not from render or pure model functions. A pure initial read may run twice under React development checks; it must not write or allocate exhibit IDs. Passes small callbacks and data to children.

Implements `prd.md > The Core Journey` and `Product Decisions`.

### MuseumScene

Draws the room and empty pedestal/inscription. Provides the first-create or add action, saved/temporary collection status, and the gallery location. Decorative layers are hidden from assistive technology and pointer input. Keeps the museum visible behind panels.

Implements `prd.md > Museum Room and Arrival` and `Look and Feel`.

### ExhibitGallery

Desktop: groups of at most six visible exhibits on composed pedestals/shelves, using Previous/Next controls for additional groups. Mobile below an initial 768px breakpoint: all exhibit positions in a horizontal scroll-snap gallery, with Previous/Next controls scrolling to the adjacent item. Use native scroll/touch behavior rather than custom gesture recognition. At intermediate widths use fewer positions per row within the same room.

Artifacts are labeled native buttons; show a short title and a small labeled light/status marker. Selection and browsing never write. Creating an exhibit switches to the relevant desktop group or mobile item. Stable creation order is retained; selecting never reorders items. No fixed total of six and no additional room.

Implements `prd.md > Return and Browse the Collection` and `Screens and Layout`.

### Artifact

Renders one of five original inline SVG designs from `artifactDefinitions.tsx`. Inputs are artifact type, persistent-light boolean, temporary reveal/selection/playback status, and unique instance ID. It never accesses storage or mutates exhibit data. Light is a separate rendered element; class changes animate grouped SVG parts. Preview illustrations never play automatically.

Implements `prd.md > Choose a Handcrafted Form`, `Place and Reveal`, and `Select, Illuminate, and Replay`.

### CreationPanel

Three steps with controlled inputs, visible field guidance, Back/Next, Close, and Place. Native radio inputs and previews select a form; nothing is selected implicitly. On first entering naming, initialize one suggestion and keep it thereafter. Render validation near fields and explain disabled placement; retain raw input on every error. No progress bar.

A guarded event path in App prevents repeated submission before rerender. A stable draft ID is reused after failure. A recovery entry opens this same panel to edit a temporary creation; this does not introduce general editing of saved exhibits. Initially allow only one unfinished/recovery creation at a time: adding while one exists offers its continuation, rather than overwriting its words.

Implements `prd.md > Describe and Name an Exhibit`, `Creation Panel`, `Session Draft and Cancellation`, and `Save Failure and Retry`.

### ExhibitPlaque

Shows full title, description, form association, saved/temporary status, and three distinct controls: Leave a little light on, Relive the moment, and a labeled on/off checkbox. On desktop it is styled as a side panel; on mobile as a readable panel above the scene. Includes Retry and Continue editing only when applicable to a failed creation. A light-write failure offers retry without enabling editing of an already saved exhibit's words.

Leave-light is idempotent: set true plus playback. Replay never writes. Checkbox sets its requested value without replay. Repeated playback while active is ignored until the 2.5-second effect settles; browsing stays available. Changing selection cancels old playback and timers, not pending saves or light values.

Implements `prd.md > Exhibit Plaque`, `Select, Illuminate, and Replay`, and `Save Failure and Retry`.

### PanelDialog

Reusable native modal dialog wrapper for creation and plaque, with a visible title and Close button. Only one panel is open at a time. Use showModal, accessible naming, focus placement/containment, Escape handling, and restoration to the invoking control. The room remains visible; a light backdrop and positioning preserve the selected exhibit's visual connection. Closing creation retains its draft. When reveal opens the plaque, focus its title; when closing it, focus the revealed artifact button (first scroll/page it into view).

Implements `prd.md > Accessible and Responsive Use`. Native dialog behavior and focus handling still require browser verification; see [dialog documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

### StatusNotice

Shows scoped save/read/draft warnings, Retry or Check again actions, and brief successful-save/light feedback. Use polite status announcements; do not repeatedly announce decorative animation frames. Identify temporary exhibits with words as well as a marker. A storage warning remains visible until resolved or the affected page session ends; do not show an automatic success toast alongside it.

Implements `prd.md > Save Failure and Retry` and `Accessible and Responsive Use`.

## Data Model

Implements `prd.md > Describe and Name an Exhibit`, `Session Draft and Cancellation`, and `Return and Browse the Collection`.

### Exhibit Record

| Field | Type / invariant |
| --- | --- |
| schemaVersion | Literal 1; unknown versions block writes, no migration |
| id | Nonempty stable UUID string, identical in key, draft, and record |
| title | Visitor-approved string, non-whitespace, maximum 100 Unicode code points |
| description | Exact visitor-written string, non-whitespace, maximum 1,000 Unicode code points |
| artifactType | book / spaceship / plant / music-box / canvas |
| lightOn | Boolean, false on initial placement |
| createdAt | ISO timestamp allocated once at placement, reused during retry |

Store one versioned record per key **`almost:exhibit:<id>`**. No separate collection index, count, or whole-collection overwrite is needed; enumerate this namespace at startup and sort by createdAt, then ID for ties. Explicit fixed fields are serialized; temporary state never leaks into these records. Unrelated site storage is untouched.

Validate parsed unknown data manually using small TypeScript type guards: object shape, supported version, key/ID agreement, supported artifact, finite valid timestamp, field types and length, and nonblank text. Reject unexpected fields rather than silently stripping possible future-format data. Never coerce, truncate, sanitize away, or repair stored visitor text. A malformed namespaced record blocks persistent writes globally until a successful explicit reread; retain valid readable records in the display if available, while warning that the collection is incomplete.

### Creation Draft

One sessionStorage key **`almost:draft`**, version 1: stable id; step (remember/name/form); raw title and description; titleInitialized flag; chosen artifact or null; phase (creating/pending-save); and placedAt or null. Drafts can contain blank or over-limit text, because they must preserve input that is not ready to submit. Validate types/version without applying final placement validation to unfinished words.

Allocate the ID with crypto.randomUUID at the first explicit new-creation action, not in render. Use the same draft through close, resume, failed placement, editing, and retries. Draft updates immediately update memory and attempt sessionStorage writes in a caught operation; no requirement to keep working after the browser session ends.

On startup reconcile by ID: if a session draft matches an already saved exhibit's title, description, form, and placement timestamp, it is stale completed creation and must not offer duplicate placement (light may legitimately differ). Clear that stale draft if storage permits. If the same ID exists with different creation content, retain the draft separately, warn of a conflict, and prohibit overwriting the saved record. Do not silently discard either version.

### UI and Save State

Memory only: selected ID, active panel, desktop group/mobile index, reveal ID, playback ID/token, timers, submission guard, validation, load status, and status messages. Effects clear timers on selection change/unmount and finish immediately for reduced motion, including when the preference changes during playback.

Per exhibit: current record; last successfully read/written serialized baseline or null; dirty desired record; status saved/temporary/unsaved-change/conflict. A saved exhibit with an unsaved light change is not labeled fully saved. Pending creation retains its editable draft until successful persistence. There is one creation draft, not a draft library; subsequent light changes can remain pending by ID independently.

### Naming and Input Rules

Recommended deterministic title: if the first nonempty description line fits within 60 Unicode code points, suggest **“A beginning: ”** followed by that exact line. Otherwise use **“An Unfinished Beginning.”** The line is copied as written; no keyword extraction, paraphrase, capitalization correction, or emotion inference. Explain that it is a template and editable. Never overwrite an initialized title after a description edit. These are implementation defaults for approval, not previously selected wording.

Title limit 100 and description limit 1,000 code points are visible guidance. Count with Unicode iteration; validate with trimmed copies solely to detect blanks, then persist the original strings. Do not apply a truncating HTML maxlength to pasted content: retain over-limit input and show a specific error. Render text as React text nodes with `white-space: pre-wrap` and safe wrapping, never as HTML. Preserve Unicode and meaningful line breaks supplied by the text controls; do not trim text before saving.

## Persistence and Recovery

Implements `prd.md > Save Failure and Retry`. This section records the learner-approved safety policy.

### Reads and Write Blocking

- Missing ALMOST records is normal first use. Catch access, enumeration, JSON parsing, schema, and write errors, including accessing the storage property itself.
- Any unreadable/corrupt/unsupported exhibit record sets persistent mode to **blocked**. Preserve existing bytes; no reset, delete, migration, fallback rewrite, or automatic repair.
- Show a gentle warning that the saved collection cannot currently be loaded fully. Display readable records where possible; allow session-only creation and mark it temporary.
- Disable all exhibit persistence attempts while blocked. **Check again** is a read-only explicit revalidation action, not a retry write. Only a complete successful validation unlocks writes; then pending changes still require explicit Retry.
- An unreadable draft is also preserved rather than silently overwritten: disable draft-storage writes, keep any new current inputs in memory, and explain session-only recovery limitations. This does not block valid exhibit saves.

### Upsert and Duplicate Prevention

Before placement, set a synchronous ref guard; repeated clicks/Enter are ignored while placing. Use a pure reducer action that upserts memory by stable ID. Generate neither IDs nor writes in reducers, mount effects, or render. A retry edits/saves the same record and createdAt; it never appends another item or runs a second initial reveal.

Immediately before a write, validate the current ALMOST collection and reread the target key. Preserve every other key. For a new ID, require target absent or identical to the pending record. For an existing exhibit's intentional light update, require current stored content to match the last known baseline, or already equal the desired record (idempotent success). A different value is a conflict: leave it untouched, retain the local intended change, show the limitation, and do not blindly overwrite it. This is conflict detection, not automatic recovery.

Editing a failed creation changes its retained title, description, or form by the same ID; it preserves its allocated placement timestamp and latest in-memory light value. Initial light-off initialization runs only once when the exhibit is first placed, never again during recovery or retry.

Write only the selected ID's complete validated record with setItem inside try/catch; mark saved only after successful write and matching read-back. Failed writes keep the baseline, desired record, editable pending creation, and visible in-memory exhibit. Retry uses the latest retained draft/light state, not a stale closure or old collection snapshot.

### Draft and Failure Lifetimes

If localStorage saving fails, retain the draft and temporary exhibit. Where sessionStorage remains available, it can restore the pending creation after same-tab reload; it is still not a saved museum exhibit. If sessionStorage also fails, warn that words remain only while this page stays open. Preserve the user's ability to select and copy their words; no export feature is required.

If a save succeeds but draft removal fails, report the draft-cleanup limitation without reversing the successful exhibit save. Startup ID reconciliation prevents the old draft producing a duplicate. Never clear a pending draft on reveal completion or a failed write.

Use the PRD's exact save-failure and success copy. Session-only and load-error notices must also state that temporary content may disappear after reload. No silent fallback to an empty saved collection and no misleading save success.

### Limitations and Tradeoffs

Per-ID records avoid replacing other exhibits and make upsert/retry simple. They require namespace enumeration and cannot offer a transaction across records. localStorage has no atomic compare-and-swap: reread/baseline checks catch ordinary stale edits but cannot guarantee conflict-free simultaneous edits to the same exhibit in different tabs. Listen for storage events and flag affected stale baselines; do not pretend this implements collaboration. The supported demo flow uses one active tab. No database, lock service, multi-tab transaction protocol, or conflict merge is introduced.

Saving still depends on browser policies, quota, user-cleared data, and origin continuity. After any failure, memory is an honest temporary fallback; it is not durable recovery. No automatic migration or corrupted-data repair exists in this POC.

## Accessibility and Responsive Behavior

Implements `prd.md > Accessible and Responsive Use`.

- Native buttons, labeled text controls, fieldsets/radios for forms, and a checkbox with explicit on/off text for the persistent light. Artifact buttons expose title and selected state; SVGs inside labeled controls are decorative.
- Visible focus; predictable tab order; dialog title/close controls; keyboard Back/Next and gallery navigation; focus return on close. A placement result focuses its plaque rather than an element hidden by animation.
- Errors linked with aria-describedby and invalid flags. Explain disabled Place near fields; do not rely on a disabled button to explain the issue. Polite live regions announce outcomes and saving limitations once per relevant change.
- Narrow-screen target starts at 320px CSS width, desktop check at approximately 1280px; verify 200% zoom and a short viewport. No horizontal page overflow. Dialog content scrolls, actions remain reachable above/below an on-screen keyboard, and gallery controls have comfortable touch targets (aim at least 44px).
- Text/control contrast is checked against its actual backdrop; preserve a distinct focus outline. State is communicated in text, not just gold color or glow.
- `prefers-reduced-motion` CSS disables ambient animation, transitions, and artifact keyframes; a matchMedia hook controls reveal/playback completion in logic. No dependency on animationend for data commits or unlocking controls.

## File Structure

Planned files only; no application files are created by this spec. Each named UI component has its heading under Components.

```text
Almost/
├── index.html                         # Single entry, title and viewport
├── package.json                       # Runtime/tooling deps and scripts
├── package-lock.json                  # Exact resolved versions
├── .gitignore                         # Preserve profile/credential exclusions
├── tsconfig.json                      # Strict project references
├── tsconfig.app.json                  # Browser TypeScript checks
├── tsconfig.node.json                 # Tooling TypeScript checks
├── vite.config.ts                     # React plugin and static build
├── vitest.config.ts                   # Node-only pure-module tests
├── playwright.config.ts               # Production-preview browser tests
├── eslint.config.js                   # Small template-compatible lint setup
├── public/
│   └── favicon.svg                    # Original local mark
├── src/
│   ├── main.tsx                       # React entry
│   ├── App.tsx                        # Root component and event orchestration
│   ├── vite-env.d.ts                   # Vite browser typings
│   ├── components/
│   │   ├── MuseumScene.tsx
│   │   ├── ExhibitGallery.tsx
│   │   ├── Artifact.tsx
│   │   ├── CreationPanel.tsx
│   │   ├── ExhibitPlaque.tsx
│   │   ├── PanelDialog.tsx
│   │   └── StatusNotice.tsx
│   ├── artwork/
│   │   └── artifactDefinitions.tsx     # Five original SVG designs/grouped parts
│   ├── hooks/
│   │   └── useReducedMotion.ts         # Match preference and runtime changes
│   ├── model/
│   │   ├── types.ts                    # Records, draft, UI/action/result types
│   │   ├── validation.ts               # Runtime guards and input checks
│   │   ├── naming.ts                   # Deterministic suggestion
│   │   └── museumReducer.ts            # Pure UI/data transitions and ID upserts
│   ├── storage/
│   │   └── museumStorage.ts            # Only Web Storage boundary, injected adapter
│   └── styles/
│       ├── base.css                    # Tokens, typography, focus and controls
│       ├── museum.css                  # Room, layouts, panels and gallery
│       └── artifacts.css               # SVG appearance and motion overrides
├── tests/
│   ├── storage.test.ts                 # Faults, IDs, baselines, protected records
│   ├── model.test.ts                   # Text, naming, reducer/light separation
│   └── e2e/
│       └── museum.spec.ts              # Critical real-browser journeys
├── README.md                          # Setup, tests, limits, demo and hosting
└── devpost/
    ├── learner-profile.md              # Ignored personal learning context
    ├── scope.md                        # Approved scope
    ├── prd.md                          # Approved product requirements
    └── spec.md                         # Approved technical blueprint
```

Course materials remain in place. Use the existing folder without scaffolding over or replacing planning files. No application code, dependency install, repository publication, or deployment occurs during `4-spec`.

## External Services and Dependencies

No visitor runtime APIs: no endpoints, request payloads, credentials, AI calls, backend, analytics, or external font/artwork requests. Runtime traffic is static HTML/JS/CSS/SVG only. Web Storage is synchronous; keep records small and writes tied to draft edits or deliberate actions rather than animation frames. See [Web Storage behavior](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).

**Approved preferred hosting: GitHub-connected Vercel Hobby**, conditional on eligibility for its personal, non-commercial terms. Use the Vite framework preset, build command **`npm run build`**, and output directory **`dist`**. Use a free HTTPS vercel.app address. No hosting package, API token, or secret belongs in the app; the operator connects GitHub through the hosting dashboard.

**Approved backup: Render Free Static Site**, connected to the GitHub repository, with build command **`npm ci && npm run build`** and publish directory **`dist`**. This is a Static Site, not a Render Web Service; it needs no server start command. Use a free HTTPS onrender.com address.

Verified October 24, 2026: [Vercel Hobby](https://vercel.com/docs/plans/hobby) is restricted to personal, non-commercial use; [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite) documents Vite deployments and Git integration. [Render Static Sites](https://render.com/docs/static-sites) documents free static hosting from a linked repository, subject to workspace bandwidth and pipeline-minute allowances. Check current terms, account eligibility, and included usage before deployment; do not assume account access is already available. Keep hosting and dependencies within **₹0**: no paid upgrade, paid add-ons, custom domain purchase, backend, or paid service. If Hobby eligibility or access is unsuitable, use the approved Render Static Site backup within its free allowances.

### Deployment Steps

1. Pass the defined checks and build to `dist/`; verify with the local production preview.
2. Prepare the required GitHub repository with the approved application and planning artifacts, preserving personal-context and credential exclusions. If eligible for personal, non-commercial Hobby use, import that repository into Vercel Hobby, select Vite, set build command `npm run build`, output directory `dist`, and deploy. Keep the free vercel.app address. If ineligible or blocked, create a Render **Free Static Site** from the same repository, set build command `npm ci && npm run build` and publish directory `dist`; do not create a Web Service. Neither path requires runtime environment variables.
3. Open the resulting public HTTPS URL in a clean desktop and mobile context. Verify creation, all form choices, light independence, reload persistence, and absence of login barriers.
4. Keep the same production origin for judging. Localhost and preview domains have separate collections; deployment does not transfer their contents.
5. Record the short demo and verify public repository and deployment access through the later shipping workflow. Ensure judges can open the production site without deployment-protection login barriers. If both approved hosting paths are blocked, retain the local production demo and resolve access without adding paid services or another hosting provider. No repository connection, publication, or deployment is performed during this specification update.

## Important Failure Modes

- **Storage denied/full or failing write:** preserve memory and editable recovery draft; show the exact PRD warning, mark temporary/unsaved changes, and retry the same ID only. No success claim until persistence succeeds.
- **Unreadable/unsupported stored records:** preserve bytes, show a load warning, block all persistent writes, and allow clearly temporary creation. Explicit read-only recheck can unlock writes only when all exhibit records validate; no repair or migration.
- **Repeat actions, stale drafts, and interrupted effects:** synchronous guard plus ID upsert prevents duplicates; stale completed drafts reconcile against saved IDs; temporary animations cannot set persistent light or gate saving. Native dialogs and immediate reduced-motion completion keep controls usable.

## Test Strategy and Acceptance Gates

Implements all acceptance criteria in `prd.md > Features and Behavior` and `States and Boundaries`. These checks must actually run during build; none has run in this planning stage.

### Pure Critical Tests

Vitest with injected in-memory Storage-like adapters and throwing reads/writes:

- Stable-ID upserts and repeated attempts yield one exhibit; retrying one ID leaves unrelated saved record bytes unchanged.
- Failed writes preserve baseline and desired content; retry succeeds with the same ID and timestamp. A read-back failure is never reported as saved.
- Malformed JSON, unsupported version, invalid fields, namespace-ID mismatch, and enumeration/access errors block writes. Assert zero write/delete calls and unchanged original bytes; explicit valid reread unlocks retries only.
- Baseline conflict leaves stored content unchanged. A matching desired record counts as idempotent success. Draft reconciliation prevents stale completed creation from being placed again.
- Text round-trips punctuation, whitespace, Unicode, line breaks, and HTML-like literal text. Blank/over-limit inputs are rejected for placement without modifying draft strings.
- Naming is deterministic, uses only exact visitor text or fallback, and never overwrites initialized edits.
- Reveal start/end, selection, and replay do not alter lightOn; explicit leave-light/toggle actions do. New exhibits start off.

### Critical Browser Tests

Playwright uses isolated browser contexts. Inject a selective, controllable Storage.prototype failure before page initialization to fail only localStorage or sessionStorage as required; exercise the production UI rather than a test-only app route.

1. Create via all three steps, edit suggested words, choose a form, rapidly repeat Place, and verify exactly one record and one exhibit. Reload: original words/form remain, light is still off.
2. Leave light on, replay, select another exhibit and return, toggle off, and reload. Verify each action changes only the intended saved light state; replay while off leaves it off.
3. Force local writes to fail. Verify temporary label, warning, editable recovery draft, no saved-success message, and visible artifact. Edit/retry after enabling writes; verify one ID, exact updated words, and reload success. Seed another exhibit and assert its stored bytes are unchanged.
4. Close/reopen draft, navigate steps, and reload in the same tab with sessionStorage available. Test both storage mechanisms failing: words remain in the open page and the reload limitation is stated. Test successful save plus failed draft removal: no duplicate continuation after reload.
5. Seed corrupt/unsupported storage and a valid record. Verify warning, valid record preservation, temporary creation, zero persistent writes even on attempted retry, and read-only recheck. Seed a failed-read condition separately. No automatic reset/migration.
6. Create at least seven exhibits; reach the seventh on desktop and mobile using explicit navigation. Read a long plaque without clipped controls.
7. Complete the flow by keyboard alone; verify dialog focus and return, Escape draft retention, field errors, and labeled light state. Repeat with reduced motion: no artifact/ambient motion, no animation-dependent lock, same save semantics.

Run Chromium desktop plus a narrow mobile viewport for the core suite; do a focused WebKit smoke check if the runtime is available. Missing browser binaries are a setup issue to resolve, not a passing check. Manual QA additionally checks storybook composition, all five artifact motions, real touch interaction, contrast, 200% zoom, short viewports, and deployed behavior. Do not substitute unit tests or screenshot snapshots for the core browser flows.

## Implementation Milestones

These are verification gates for `5-build`, not authorization to start. Build order deliberately proves the smallest end-to-end experience before expanding visual polish.

| Milestone | Concrete outcome and gate |
| --- | --- |
| 1. Runnable shell and storage model | Vite/React/TS setup, empty museum composition, typed model, storage/validation tests. Corrupt records are never overwritten. |
| 2. One complete exhibit | Creation, editable template title, one initial SVG form, save/retry, session draft, reveal and plaque. Browser test proves create/reload with light off and duplicate prevention. |
| 3. Remembering interaction | Separate leave-light, replay, toggle, selection, saved boolean, and reduced-motion behavior. Tests verify reveal/replay independence and recovery after light-write failure. |
| 4. Complete collection and presentation | All five forms and their small motions; desktop six-position browsing and mobile gallery; at least seven exhibits reachable; keyboard/dialog and recovery tests pass. |
| 5. Polish and delivery readiness | Refine room/artifact coherence; pass typecheck/lint/unit/browser/build gates, inspect desktop/mobile, verify free live deployment, prepare demo path and repository instructions. |

Within the learner's 6–10 total hours, protect early functional completion and reserve roughly the final 1–2 hours for visual verification, deployment, and recording/submission preparation. This is a planning allocation, not a delivery guarantee; cut extra decoration before any approved persistence, accessibility, or core-loop behavior. Deadline: October 27, 2026, 2:30 AM IST.

## What Was Simplified and Why

- One page, local React state/reducer, explicit events, and native dialogs instead of routing/global-store/UI-kit layers: the room and two panels need no larger framework.
- Five original SVG artifacts and CSS instead of runtime generated images or 3D: retains the handcrafted identity without cost or heavy rendering.
- Per-ID records and one session draft instead of a database, collection-index protocol, or draft library: protects unrelated records and keeps retries idempotent.
- Explicit session-only fallback and no repair/migration instead of pretending failed storage is durable: preserves honesty and existing bytes.
- Static free deployment, no remote fonts/assets or runtime services: judges can enter immediately and the demo does not depend on API availability.

## Decisions and Open Issues

**Learner choices:** React/Vite/TypeScript; CSS/SVG local artwork; localStorage exhibits and sessionStorage drafts; no backend/auth/database/runtime AI/paid services; stable creation IDs, ID upserts, retained editable failure state, honest retry, and critical persistence tests. The learner explicitly approved preserving unreadable/corrupt/unsupported stored data, blocking persistent writes, session-only creation, and no automatic migration/recovery.

**Genuine uncertainty resolved in the interview:** reliable recovery without duplicate exhibits or lost content. A stable draft ID, guarded placement, per-ID upsert, retained memory/draft, and explicit save outcomes address it; tests will demonstrate repeat attempts, failed writes, retry, and reload behavior. Limitations remain explicit: memory dies on reload, storage can be unavailable, and multi-tab same-record races are not transactional.

**Approved implementation details:** per-ID keys with versioned records and baseline conflict checks; one editable recovery draft; the deterministic title rule and visible 100/1,000 code-point limits; desktop six-item grouping/mobile scroll-snap; system fonts; native dialogs; Vitest plus Playwright as development-only tooling. The learner approved the specification with a hosting change: GitHub-connected **Vercel Hobby preferred**, conditional on personal/non-commercial eligibility, and **Render Free Static Site backup**. Build output is `dist`; the Vercel build command is `npm run build`. Hosting and dependencies must remain within ₹0.

**No additional product-defining question remains.** Exact installed versions, local runtime availability, hosting account access and Hobby eligibility, and browser-test binary availability are unverified implementation prerequisites to check at the first relevant milestone. Any dependency incompatibility must be resolved before relying on its tests/build; any consequential deviation from this blueprint returns to the learner. This specification is approved. The learner explicitly requested stopping before `5-build`; do not start implementation or create application code until separately authorized.
