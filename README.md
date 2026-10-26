# ALMOST — Every Unfinished Thing Has a Story

A small, browser-only museum for unfinished creative ideas. The Midnight Keepsake Museum is an original storybook hall with tall twilight windows, a distant archway, perspective wooden floors, curated shelves and plinths, and Pip’s keepsake desk. Describe something you began, choose its symbolic form, and give it a place in the room. Leaving a little light on acknowledges a possibility without asking you to finish it.

## Make a little place for it

The Whisper opens Pip's paper notebook. The Name Tag offers an editable deterministic title and live label preview. Choose a Vessel presents five original SVG keepsakes on a wooden tray. An unsaved fourth stage previews the chosen keepsake and name before the final Place action. Back or Escape retains the same draft; preview never creates an exhibit. One successful save starts the placement ceremony: the object arrives, its tag settles, and Pip notices a sparkle. A failed save skips that celebration and opens an honestly labeled temporary exhibit with retry/edit controls.

Click a shelf object to open its keepsake box and read your exact words. Selection and replay never change its lasting light. Desktop displays six shelf/plinth positions per collection page; mobile unfolds the hall vertically around a swipeable gallery with visible previous/next controls. More exhibits stay in the same room, in stable creation order.

Pip has event-driven welcome, sleepy, listening, anticipation, happy, looking and settling poses; short speech bubbles settle away. All character, room, and artifact animation is decorative and disabled under reduced motion. No font, artwork, or runtime service is fetched externally. The exhibit display section and its contents are scaled to 80% of their earlier size; browsing targets remain 44px.

## Discover the hall

Look through the twilight window, switch the desk lamp, ring the silent visual bell, open the curator-written guestbook, read a note or empty-pedestal inscription, or ask Pip for a thought. A small brass diamond marks objects you can touch. Every object has a visible label, consistent hover/focus/press feedback, keyboard access and reduced-motion feedback. On phones, the curator table and creation invitation sit above the swipeable collection. These optional discoveries use ephemeral React state only: they never change exhibits, drafts or saved lights. The room lamp resets on reload; the guestbook is a readable welcome, not a new visitor-writing feature.

## Two rooms further inside

Use the wooden signposts to explore two more rooms, each with an original illustrated environment and a short fictional curator story:

| Room | Story | Discoveries |
| --- | --- | --- |
| Moonseed Conservatory | A seed can rest without needing to grow. | Toggle a tiny rain cloud, unfold paper petals, open a seed drawer. |
| Pocket-Sky Observatory | An imagined journey can keep its place in the sky. | Look through a telescope, turn three constellations, wake a clockwork comet. |

A brief, motion-sensitive arrival transition and a short atmospheric introduction connect each room; reduced motion removes the transition immediately. Pip visits both. Room discoveries reset when you leave; they never alter exhibits or drafts. Your collection stays in the Main Hall, retaining its browsing position. “Keep a beginning” returns to the existing creation desk; “Continue your beginning” resumes the same draft. Reload starts in the Main Hall. Keyboard navigation, modal focus restoration and reduced motion apply throughout.

## Your Observatory universe

Every exhibit becomes a glowing star. Select one to read its title, choose **Connect to another star**, choose its companion, then **Tie a golden thread**. Stars shine even when unconnected; their museum lights are unchanged.

Each connected group can have its own optional name, written entirely by you. Joining named groups keeps both names until you explicitly save one chosen name. **Threads in this constellation → Untie** removes a connection while leaving its stars. A name follows the star selected when it was kept if a group separates. The telescope, constellation wheel and comet remain below the map.

Connections and names use the separate local key `almost:observatory:universe`. Safe retries, strict validation and stale-tab checks protect the saved sky. Failed changes and open names remain through room visits in the current page; unsaved data may disappear on reload. Corrupt/future data is left untouched. A thread involving a temporary exhibit is temporary until its source is saved and the sky retried. A scrollable map and **Find a beginning** index keep large collections accessible by touch and keyboard.

## The Conservatory memory journal

“A place for memories that don’t need a pedestal.” Open the optional **Memory journal** beside the Conservatory’s story invitation. The botanical notebook lets you write, name (optionally), read and edit personal memories. Each page records its original date, time (including seconds) and time zone; editing adds a separate Updated timestamp. Original recording metadata is retained.

Pages save explicitly in this browser under `almost:journal:entry:<id>`. One open page uses the separate session key `almost:journal:draft`, so closing the journal or changing rooms preserves unfinished words. This journal is the exception to the room discoveries’ temporary-state behavior. It does not alter exhibits or their creation draft.

Names allow 100 Unicode characters and memory text 5,000, with visible limits and no silent truncation. Failed saves retain an editable page for same-ID retry. Corrupted/unsupported journal records remain untouched and block journal writes until a readable-storage recheck. Newest recorded pages appear first, five at a time; mobile has a collapsible index.

Saved memories belong to this browser/site address; clearing browser data can remove them. If browser storage fails, the journal explains that in-memory words may not survive reload. No account, backend, cross-device or encrypted-storage promise is introduced.

## Optional room music

Click the little smiling SVG music box beside the room signposts (beneath them on mobile) to start or pause music. Main Hall, Conservatory, and Observatory each use their corresponding supplied MP3. Music starts off, loops quietly at 35% player volume, and switches to the new room’s track when already enabled. Pausing keeps it off across room changes; a reload starts quiet again. There is only one audio player, so tracks never overlap.

The record player sways and floats notes only during playback; reduced-motion visitors get a static playing indicator. Keyboard Enter/Space work too. Playback/network failures show a retry invitation without affecting your museum. Browser autoplay restrictions may require another click after switching rooms. Music is separate from all exhibit and light interactions.

Original supplied files remain in `music/`. Deployment copies live in `public/music/` and are bundled into `dist/music/`; no streaming provider or external requests. Tracks load only after a visitor chooses playback. No new dependencies or storage keys.

## Run locally

Use a supported Node.js release compatible with Vite and Vitest (Node 22.12+ or a newer supported release) and npm.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173/ . No API keys, runtime services, or visitor account are required.

## Verify

```sh
npm run typecheck
npm run lint
npm run test -- --run
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright runs the production preview on port 4173 with desktop and mobile Chromium profiles. The browser suite uses isolated contexts and controlled browser-storage failures; it does not alter your personal museum.

Preview the production build with:

```sh
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

## Your words and your light

- Descriptions and edited titles are rendered as text, never interpreted or rewritten by AI.
- Five original SVG forms: book, spaceship, plant, music box, canvas.
- Selecting an exhibit opens its plaque. It never changes the light.
- The reveal spotlight is temporary. A newly placed exhibit's saved light starts off.
- Leave a little light on explicitly turns the saved light on and plays the brief animation. Replay changes no saved state. The labeled checkbox turns the saved light on or off.
- Reduced-motion preferences disable decorative movement without changing the actions.

## Storage and recovery

Exhibits are versioned records under `almost:exhibit:<stable-id>` in this site's localStorage. A creation draft uses `almost:draft` in sessionStorage. IDs are allocated once per creation; retries update that same ID rather than inserting duplicates.

When saving fails, the exhibit remains visible and its pending creation stays editable. Retry saves the same exhibit. Unreadable or unsupported records are left untouched and block persistent writes; Check again only rereads. No automatic reset, repair, or migration is performed.

Storage belongs to this browser and exact site address. Clearing browser data can remove exhibits. In-memory content may disappear after a reload if browser storage fails. Simultaneous edits of the same exhibit in separate tabs are not transactional; baseline conflict checks avoid ordinary stale overwrites, but this is a single-active-tab proof of concept.

## Deployment target

Preferred: GitHub-connected Vercel Hobby, only if eligible under its personal/non-commercial terms. Framework preset Vite; build command `npm run build`; output directory `dist`. No environment variables. Keep the production URL publicly accessible for judges.

Backup: Render **Free Static Site** from the same repository; build command `npm ci && npm run build`; publish directory `dist`. Do not create a Render Web Service. Both paths must stay within the ₹0 budget. No paid upgrade, backend, or custom domain purchase is required. Recheck account eligibility and free usage at deployment time.

Localhost, preview deployments, Vercel, and Render each have separate browser collections. Use the stable production URL for judging; hosting changes do not transfer stored exhibits.

## Planning and progress

Approved planning lives in `devpost/scope.md`, `devpost/prd.md`, and `devpost/spec.md`. Build progress, hands-on reviews, and remaining verification are recorded in `devpost/checklist.md`. Personal learner context and local credentials are excluded from commits by `.gitignore`.

No runtime AI, authentication, backend, analytics, remote artwork, or remote fonts.

## License and asset rights

ALMOST’s application source code and original SVG artwork are licensed under the [MIT License](LICENSE), copyright © 2026 Mridul Dabral. Third-party packages retain their own licenses; see [runtime notices](THIRD_PARTY_NOTICES.md). The deployed static files include `third-party-notices.txt`.

**The MP3 files in `music/` and `public/music/` are expressly excluded from the MIT license.** They were generated with Google Gemini/Lyria from project-specific prompts supplied by the creator. Their origin and unresolved redistribution rights are recorded in [MUSIC_RIGHTS.md](MUSIC_RIGHTS.md). No blanket redistribution permission or exclusive ownership is claimed. The creator explicitly authorizes including these tracks in this GitHub publication; their applicable redistribution rights have not been independently confirmed.

## Submission preparation

Executed checks and publication/deployment blockers are recorded in [shipping readiness](devpost/shipping-readiness.md). The [demo recording checklist](devpost/demo-checklist.md) describes actions to demonstrate, not narration. The [submission checklist](devpost/submission-checklist.md) distinguishes confirmed public rules from authenticated form questions still to be reviewed. No repository publication, deployment, video upload or Devpost submission has been performed by this workflow.
