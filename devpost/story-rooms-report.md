# Two rooms further inside — implementation review

The learner requested two differently themed rooms and confirmed the proposed Conservatory/Observatory direction. Both are implemented as navigable destinations alongside the existing Main Hall.

## The rooms

| Room | Visual identity | Curator story | Distinct features |
| --- | --- | --- | --- |
| Moonseed Conservatory | Curved sage glasshouse, moonlit panes, hanging greenery, terracotta floor, foreground leaves. | A keeper’s unplanted seeds and paper flower can already be a garden. | Reversible rain cloud, opening/folding paper petals, seed drawer revealing a little note. |
| Pocket-Sky Observatory | Plum dome, round night window, brass charts, bookcase, circular floor dais, lavender drapes. | A mapmaker leaves a route blank, with room for an imagined journey. | Telescope viewing panel, wheel cycling boat/kite/sleeping-fox constellations, replayable clockwork-comet orbit. |

Stories are explicitly fictional museum lore, not interpretations of visitor words. Pip is present in each room. All discoveries are optional and carry no progress, reward or return pressure.

## Navigation and core loop

Wooden signposts name the current destination, remain reachable while scrolling and support keyboard activation. Switching rooms focuses the new heading. The Main Hall’s gallery remains mounted; both desktop page and mobile item survive a round trip.

Creation from a side room returns to the Main Hall and invokes the original start/resume flow. An existing draft retains its exact text, chosen form and stable ID. Existing save, retry, corruption, preview/reveal and persistent-light semantics remain unchanged. Room interactions use only ephemeral local state; leaving resets them, and reload starts in the Hall.

## Implementation map

- `src/model/rooms.ts`: typed destination metadata, separate from saved records.
- `src/components/RoomNavigation.tsx`: accessible sticky signposts.
- `src/components/MuseumScene.tsx`: destination state, preserved Hall/gallery and creation handoff.
- `src/components/StoryRoom.tsx`: six discoveries, stories, telescope panel and cleared comet timer.
- `src/components/StoryRoomAtmosphere.tsx`: two distinct original SVG architectures.
- `src/styles/rooms.css`: responsive layout, readable paper labels, states and reduced-motion behavior.
- `tests/e2e/rooms.spec.ts`: navigation, state/focus, exact-byte preservation, creation handoff, five-viewport geometry and gallery-position regressions.

No new runtime dependency, service, schema or storage key. No migration, backend, audio or runtime AI.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test -- --run` — 22/22 unit tests passed.
- `npm run build` — passed; final assets `index-Dw9fm-ZX.css` and `index-AGLgG05d.js`.
- `npm run test:e2e` — **62/62 passed in 40.1 seconds**, against the fresh production build. All prior 50 cases plus 12 new room executions passed.
- Focused geometry and collection-position checks — 4/4 passed before the full suite.
- `git diff --check` — passed. Existing exhibit/draft models, storage modules and dependency manifests are unchanged.

Manual visual QA covers both rooms at 1440×900, 1920×1080, 768×1024, 390×844 and 320×700. Checks caught pale-glass label contrast and a tablet feedback collision; paper labels, darker wood signposts, a cloth backing behind the glasshouse inscription and adjusted spacing resolve them. Browser tests use isolated synthetic collections.

## Screenshots

| View | Conservatory | Observatory |
| --- | --- | --- |
| Desktop | [1440×900](screenshots/rooms/desktop-conservatory.png) | [1440×900](screenshots/rooms/desktop-observatory.png) |
| Large desktop | [1920×1080](screenshots/rooms/large-conservatory.png) | [1920×1080](screenshots/rooms/large-observatory.png) |
| Tablet | [768×1024](screenshots/rooms/tablet-conservatory.png) | [768×1024](screenshots/rooms/tablet-observatory.png) |
| Mobile | [390×844](screenshots/rooms/mobile-conservatory.png) | [390×844](screenshots/rooms/mobile-observatory.png) |
| Narrow mobile | [320×700](screenshots/rooms/small-conservatory.png) | [320×700](screenshots/rooms/small-observatory.png) |

[Garden interactions active](screenshots/rooms/desktop-garden-awake.png) · [Narrow telescope view](screenshots/rooms/small-telescope.png)

## Remaining limits

Chromium desktop/mobile emulation is not physical-device or full screen-reader verification. The browser/device/origin persistence and single-active-tab limits still apply to exhibits. The new room settings are deliberately temporary. Nothing pushed, published or deployed. Final creative acceptance and the official learning wrap-up remain open.
