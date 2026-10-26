# Observatory: a personal universe

Authorized extension, October 26, 2026. The learner asks for exhibit stars, visitor-drawn connections, a living star map and optional authored constellation names. They explicitly choose **one optional name for each connected group**.

## Experience and boundary

- Every Main Hall exhibit appears as a softly glowing star, including unconnected beginnings. Selecting reveals the exact authored title. This does not change the exhibit, its order or its persistent light.
- Choose a star, select **Connect to another star**, choose the second, then explicitly **Tie a golden thread**. Selecting or browsing alone never writes. Same-star and duplicate/reversed pairs cannot create extra threads.
- Connected groups are constellations. An optional name is raw visitor text, at most 100 Unicode code points; blank explicitly leaves the group unnamed. No title generator or AI interpretation is involved.
- Joining named groups retains all their existing names. A visitor may explicitly save one name for the joined group. Untying is reversible; it removes only a thread, retaining both stars. A name follows its anchored star after a split; dormant names/threads are never silently erased.
- The telescope, constellation wheel, comet, room story and creation handoff remain available below the personal map.

No new service, account, dependency, external artwork or runtime AI. This is a local extension of the existing museum, not collaboration or an archival guarantee.

## Implementation

`App` supplies the current exhibits and saved flags to `MuseumScene`. `useObservatorySky` stays mounted there across room trips, preserving temporary changes and open naming inputs. `ObservatorySky` renders the responsive chart, selected-title paper, explicit connection controls, group names and optional indices. `StoryRoom` accepts this Observatory-only content.

Stable exhibit IDs identify stars. Deterministic layout uses five columns on desktop and three on phones with slight visual offsets; viewport scrolling and a native index keep large collections reachable. Append-only exhibit order keeps existing positions stable. Local SVG paths provide golden threads and a short arrival illumination. Reduced motion removes arrival animation without delaying state or saving.

`UniverseMap` is `{schemaVersion:1, edges:[{id,a,b}], names:[{anchorId,text}]}`. Each canonical unordered UUID pair has one deterministic ID. Graph connectivity, not subject matter or generated inference, defines a group. Names remain exact strings anchored to member IDs.

The independent localStorage key is `almost:observatory:universe`. One small personal-graph snapshot keeps thread/name changes together. Strict validation, raw-baseline checks, idempotent retries and matching read-back prevent silent overwrites and duplicates; exhibit/journal keys are never written. Previous failed-write snapshots allow acknowledging an earlier successful own write before saving newer edits. Unrelated changes in another tab still cause a conflict.

Corrupt/future/unreadable data is preserved and blocks persistent writes until an explicit read-only check. Unsaved sky changes and naming inputs stay in memory during room navigation, with an honest reload warning. A connection to a temporary exhibit stays temporary until the exhibit can be saved and the map retried. Removing known-unreadable stored data externally permits an explicit empty-baseline recheck; newly valid, differing saved graphs are not silently replaced. No automatic repair/migration, multi-tab transaction protocol, cloud sync or cross-device guarantee.

## Verification gates

- Pure graph/storage tests: canonical pairs, groups, merge/split names, raw text/limits, corrupt/future/read failures, duplicate/retry/read-back behavior, stale baselines and untouched exhibit/journal keys.
- Browser: creation-to-star, explicit connect/name/untie, independent groups and merging, room/reload retention, storage failures/recheck/conflicts, keyboard/reduced motion, empty/one/large collections and responsive chart.
- Inspect desktop, tablet, 390px and 320px with synthetic records; build, lint and typecheck must pass. Record executed results in `observatory-universe-report.md`.
