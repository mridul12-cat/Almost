# Conservatory Memory Journal — authorized extension

The learner requests a well-made journal in the Conservatory for recording memories with entry dates and times. The journal extends the prior side-room presentation-only boundary; its records are independent of exhibits and existing creation drafts.

## Experience

A small illustrated pressed-fern notebook appears beside the room’s story invitation. It opens a cream-paper journal with botanical accents, a page index and a readable writing/reading surface. Visitors can write a memory, optionally name it, revisit it and explicitly edit it. No AI interpretation, mood scoring, streak, deadline or productivity prompt.

Recording time is captured on the first explicit save, retained through retries and preserved on edits. The original time zone is kept with the entry. A later save updates a separate timestamp, shown as Updated. Dates and times are displayed with seconds and a time-zone label; semantic time elements retain the exact ISO values.

Titles allow 100 Unicode code points, memories 5,000; blank titles are allowed, blank bodies are not. Validation never truncates or rewrites words. Newest recorded entries appear first, five at a time. Mobile has a collapsible page index. One open draft can be continued while other saved pages are read; it cannot be silently replaced by starting another entry.

## Data and recovery

- Entry: schemaVersion 1, stable UUID, exact title/body, createdAt, updatedAt and original timeZone.
- Draft: schemaVersion 1, same stable ID, raw text, nullable createdAt/modifiedAt, timeZone and raw baseline for conflict checks.
- localStorage: `almost:journal:entry:<id>`, per-ID upserts with read-back verification.
- sessionStorage: `almost:journal:draft`, separate from `almost:draft`.
- No backend, account, runtime AI, new dependency, or migration of existing data.

Failed saving leaves the editor and draft intact and offers retry with the same ID/time. Unsupported, corrupted or unreadable journal data is preserved and blocks journal writes until an explicit recheck succeeds. Stale edits cannot overwrite a newer saved record. The exact successful pending record is recognized after reload if cleanup failed. Unreadable/different-ID drafts are not overwritten or removed automatically.

The journal component stays mounted outside the transient story room, retaining unsaved words while the book closes or the visitor changes rooms. If session storage fails, words remain in memory and the UI discloses reload limitations. Saved pages belong to the current browser/site address; clearing browser data can remove them. No permanent, encrypted or cross-device storage promise.

## Verification boundary

Verify write/read/edit and semantic timestamps, exact text, stable IDs, retries, failed/blocked storage, conflicting drafts, cleanup reconciliation, index browsing, modal focus/keyboard/reduced motion and desktop/mobile/short-viewport layouts. Existing exhibit and draft keys must remain byte-for-byte unchanged. Journal tests/screenshots use synthetic memories only. Final creative acceptance remains open.
