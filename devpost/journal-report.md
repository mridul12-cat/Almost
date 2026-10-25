# Conservatory Memory Journal — review

## Result

A pressed-fern notebook beside the Conservatory’s story opens a botanical memory journal: cream paper, ruled writing surface, sage binding, a ribbon marker and a readable page index. Visitors can write, optionally name, save, read and edit memories. The mobile index collapses to leave space for the page.

Each saved entry records the original date, time and time zone. Editing preserves those and adds an Updated timestamp. Visible timestamps include seconds and zone labels; semantic time elements retain the ISO values. Entries sort by original recording time, newest first, with five per index page. Names are optional; whitespace-only text is not saved. Limits are visible (100/5,000 Unicode code points), and input is never silently truncated or interpreted.

## Words and recovery

Saved journal pages and the session open-page draft use independent namespaces; exhibit records and `almost:draft` remain unchanged. Stable IDs, stored baselines, protected creation metadata and read-back verification allow safe retries without duplicates or replacing newer saved words.

The journal stays mounted outside the transient Conservatory room. Closing or room navigation keeps unsaved words in memory; session storage additionally supports draft recovery after reload. Failed saves keep the editor open with a retry action. Corrupt/unsupported journal records or drafts are left untouched. Journal writes remain blocked until an explicit readable-data recheck; no automatic reset or migration.

A single open draft can be continued while other pages are read. Starting a new page continues that draft rather than discarding it. Completed drafts left by a failed cleanup reconcile against the saved record on reload, so they do not create phantom entries.

## Source map

- `src/components/MemoryJournal.tsx`: notebook controller, index, exact text, dates, editor/read views, save/recheck/recovery.
- `src/model/journal.ts`: typed entry/draft data, Unicode limits and date/time-zone validation.
- `src/storage/journalStorage.ts`: independent per-ID persistence and baseline/draft protections.
- `src/components/StoryRoom.tsx`: illustrated Conservatory journal option.
- `src/components/MuseumScene.tsx`: retained journal instance across room changes.
- `src/components/PanelDialog.tsx`: journal variant using existing native modality and focus behavior.
- `src/styles/journal.css`: notebook/cover artwork, responsive index and reduced-motion styling.
- `tests/journalStorage.test.ts`, `tests/e2e/journal.spec.ts`: storage and browser regressions.

No runtime dependency, backend, account, audio, paid service, runtime AI or exhibit schema change.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test -- --run` — **57/57 unit tests passed**, including 35 journal model/storage cases.
- `npm run build` — passed. Final assets `index-D7lUdFgr.css` (17.31 kB gzip) and `index-FFNlcjmf.js` (101.44 kB gzip).
- `npm run test:e2e` — **82/82 passed in 52.2 seconds**: 20 journal executions plus all prior 62 museum/room regressions.
- Browser coverage includes exact Unicode/literal markup, duplicate prevention, original/edit timestamps and zones, room/reload preservation, draft recovery, failed writes/retries, corrupt/future records, stale-baseline protection, failed cleanup reconciliation, optional names, 5,000-code-point text and seven-entry pagination, duplicate DOM IDs, short-height actions and native focus restoration.
- Manual screenshots inspected at 1440×900, 1920×1080, 768×1024, 390×844 and 320×700. No horizontal page overflow in those journal captures.
- `git diff --check` — passed; original exhibit model/storage and dependency manifests remain unchanged.

QA fixed a duplicate title-field/dialog ID and narrow-layout crowding between the notebook option and cloud. Label associations, exact text, date metadata, failure/retry and recovery, DOM-ID uniqueness, keyboard focus, long pages, short viewports and the mobile index are covered. Screenshots use synthetic example memories in isolated browser contexts.

## Screenshots

| View | Welcome | Writing | Saved page |
| --- | --- | --- | --- |
| Desktop 1440×900 | [Open book](screenshots/journal/desktop-welcome.png) | [Writing](screenshots/journal/desktop-writing.png) | [Recorded date/time](screenshots/journal/desktop-saved.png) |
| Large 1920×1080 | [Open book](screenshots/journal/large-welcome.png) | [Writing](screenshots/journal/large-writing.png) | [Recorded date/time](screenshots/journal/large-saved.png) |
| Tablet 768×1024 | [Open book](screenshots/journal/tablet-welcome.png) | [Writing](screenshots/journal/tablet-writing.png) | [Recorded date/time](screenshots/journal/tablet-saved.png) |
| Mobile 390×844 | [Open book](screenshots/journal/mobile-welcome.png) | [Writing](screenshots/journal/mobile-writing.png) | [Recorded date/time](screenshots/journal/mobile-saved.png) |
| Narrow 320×700 | [Open book](screenshots/journal/small-welcome.png) | [Writing](screenshots/journal/small-writing.png) | [Recorded date/time](screenshots/journal/small-saved.png) |

[Conservatory notebook option](screenshots/journal/desktop-conservatory.png) · [Original and updated times](screenshots/journal/desktop-updated.png) · [Mobile page index](screenshots/journal/small-index.png)

## Limits

Records live in this browser/site’s localStorage; clearing data may remove them. Draft recovery is session-limited and may fail if storage is denied. This is not encrypted or cross-device storage. Original timestamps use the device clock and retain the entry’s recorded time zone. Baseline conflict checks do not provide atomic multi-tab transactions. No delete, attachment, export or synchronization feature is added.

Browser verification uses Chromium emulation, not physical-device or full assistive-technology testing. No push, publication or deployment. Final creative acceptance and the official learning wrap-up remain open.
