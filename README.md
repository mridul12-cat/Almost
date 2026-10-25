# ALMOST — Every Unfinished Thing Has a Story

A small, browser-only museum for unfinished creative ideas. The Midnight Keepsake Museum is an original storybook hall with tall twilight windows, a distant archway, perspective wooden floors, curated shelves and plinths, and Pip’s keepsake desk. Describe something you began, choose its symbolic form, and give it a place in the room. Leaving a little light on acknowledges a possibility without asking you to finish it.

## Make a little place for it

The Whisper opens Pip's paper notebook. The Name Tag offers an editable deterministic title and live label preview. Choose a Vessel presents five original SVG keepsakes on a wooden tray. An unsaved fourth stage previews the chosen keepsake and name before the final Place action. Back or Escape retains the same draft; preview never creates an exhibit. One successful save starts the placement ceremony: the object arrives, its tag settles, and Pip notices a sparkle. A failed save skips that celebration and opens an honestly labeled temporary exhibit with retry/edit controls.

Click a shelf object to open its keepsake box and read your exact words. Selection and replay never change its lasting light. Desktop displays six shelf/plinth positions per collection page; mobile unfolds the hall vertically around a swipeable gallery with visible previous/next controls. More exhibits stay in the same room, in stable creation order.

Pip has event-driven welcome, sleepy, listening, anticipation, happy, looking and settling poses; short speech bubbles settle away. All character, room, and artifact animation is decorative and disabled under reduced motion. No font, artwork, or runtime service is fetched externally.

## Discover the hall

Look through the twilight window, switch the desk lamp, ring the silent visual bell, open the curator-written guestbook, read a note or empty-pedestal inscription, or ask Pip for a thought. Every object has a visible label, keyboard access and reduced-motion feedback. These optional discoveries use ephemeral React state only: they never change exhibits, drafts or saved lights. The room lamp resets on reload; the guestbook is a readable welcome, not a new visitor-writing feature.

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
