---
doc: prd
status: approved
---

# ALMOST — Product Requirements

A small magical museum for visitors who want to give an unfinished creative idea a place to exist, without being asked to complete it.

Source: `scope.md > The Unique Kernel`, `Who It's For`, and `The POC Boundary`. This document defines the experience, not its technical implementation.

## The Core Journey

Source: `scope.md > The Core Loop` and `What "Working" Looks Like`.

1. Open the museum directly, without an account or setup. On first use, see a beautiful room and one empty pedestal, an inscription, a short explanation, and “Create your first exhibit.”
2. Open creation within the room. Describe an unfinished idea, review and edit a template-suggested title and the description, and choose a handcrafted artifact with a visual preview.
3. Select “Place in Museum.” The creation panel fades, the artifact appears, its spotlight illuminates, and its plaque presents the visitor's words. Confirm persistence only if saving succeeded.
4. Select an exhibit to read its full plaque. Selection never changes its saved light. Use the plaque's separate controls to leave a light on, replay the moment, or toggle the lasting light.
5. Return to the room, add another exhibit, or leave. On a later visit in the same browser, saved exhibits and light states return without an absence penalty.

Success is demonstrable in about a minute: create an exhibit, read its plaque, deliberately illuminate it, and reload to see that it remains.

## Screens and Layout

Source: `scope.md > Inspiration & Identity` and `The POC Boundary`.

### Museum Room and Arrival

The museum is the visual centerpiece, rather than a dashboard or large form. The empty scene has tall arched windows, twilight outside, warm wooden floors, and a single empty pedestal beneath a gentle spotlight.

Above the pedestal: **“Every unfinished thing began somewhere.”** Beneath it: **“Create your first exhibit”**, with supporting copy **“Give something you once started a place to exist.”** The invitation is clearly visible without overpowering the artwork. The empty room suggests possibility, not loneliness.

Once exhibits exist, pedestals and shelves gradually fill. A subtle, persistent **“+ Add an Exhibit”** action sits near the room's lower edge. Approximately six exhibit positions are visible on desktop; additional exhibits use simple browsing within the same room. No additional rooms or database-style record grid.

### Creation Panel

A softly lit panel opens within the museum without navigating away. Three short steps: **Remember**, **Give it a name**, **Choose its form**. Navigation lets visitors revise earlier input without losing later input. Closing returns to the room and keeps a session draft.

### Exhibit Plaque

Desktop selection softly illuminates the selected pedestal and opens the full plaque in an elegant side panel. Mobile selection opens a readable, dismissible panel. The title, description, and selected artifact remain clearly associated. Dismissing the panel returns easily to browsing.

Mobile exhibits form a horizontally swipeable gallery; explicit browsing controls also make every exhibit reachable without swiping. Controls never depend on hover.

## Look and Feel

**Hall redesign:** The learner’s subsequent review authorizes `hall-redesign.md`: one full-width architectural hall with window alcove, curated collection wall and foreground keepsake desk; optional, accessible room discoveries have ephemeral UI state only. This supersedes the boxed miniature presentation. Creation/preview, authorship, storage/recovery, lasting lights, cost and service boundaries remain intact. The distant arch is scenery, not another navigable room.

**Creative pass 2:** the learner authorized the focused refinements in `creative-pass-2.md`: less decorative clutter, larger exhibit artwork/readable two-line tags, integrated ticket navigation, a keeper/creation station, transient event-driven Pip speech, and a fourth visual preview before confirmation. Preview is explicitly unsaved and does not mutate the collection; only the final Place action saves. Existing three-step draft schema and direct failed-save retry remain unchanged.

**Authorized creative revision:** `redesign.md` and the learner's Midnight Keepsake Museum brief supersede the formal/symmetric architectural styling below. One irregular miniature room replaces the gallery wall: a moonlit window, doorway, varied wood shelves, desk, lamp, rug, celestial details and Pip's resting corner. Typography is warm storybook display type plus readable system body text and small handwritten-style labels, without tiny tracked gold microtext. Use no remote fonts or assets.

Creation retains the same editable data and validation but is presented as **The Whisper → The Name Tag → Choose a Vessel**, with paper writing surfaces, a live title tag and an object tray. Placement is a separate visual ceremony after one guarded successful save. Failed persistence skips the success ceremony and clearly labels the exhibit temporary. Details open as an illustrated cream keepsake card/box with the same independent light/replay controls and exact visitor words. All saved IDs, ordering, forms, drafts, and recovery semantics remain unchanged. Pip is a quiet original SVG character with welcome, idle, writing, placing and light-acknowledgment poses, no chat/AI, and reduced-motion equivalents.

Source: `scope.md > Inspiration & Identity`; expanded by the learner during the PRD interview.

- A small museum coming alive after closing hours: storybook illustration, hand-painted and watercolor character, deep twilight blues, warm amber illumination, wooden floors, tall arches, elegant pedestals, and delicate golden details.
- Miniature handcrafted artifacts and restrained atmospheric details. Gentle transitions and subtle animation support the exhibit rather than competing with its words.
- Restrained, readable typography with clear hierarchy between inscription, exhibit title, description, and controls. Exact fonts remain a technical-plan decision; no specific font has been chosen.
- Preserve the room's presence while panels are open. The selected artifact remains visually connected to its plaque.
- Avoid generic SaaS styling, excessive cards, overwhelming layouts, memorial solemnity, forced positivity, and therapeutic language.
- Emotional principle: “The visitor creates the meaning. ALMOST creates the moment.” No generated emotional claims or pressure to revive an idea.

## Features and Behavior

### Describe and Name an Exhibit

Source: `scope.md > The POC Boundary` and `The Unique Kernel`.

The visitor writes a short free-text description. ALMOST offers a title through simple, transparent templates, not AI interpretation. The visitor can edit both title and description before placement. Suggestions never silently overwrite visitor edits or rewrite the description.

Show one editable suggestion, clearly labeled as template-based, with a neutral fallback. “An Unfinished Beginning” is illustrative wording; exact wording remains for the technical plan. Any inclusion of visitor text must quote their own words rather than infer a subject or feeling. No extra naming questionnaire or title-generator feature.

Acceptance criteria:

- [ ] The original description carries into the editable description field without paraphrasing or emotional interpretation.
- [ ] The final plaque shows the visitor's chosen title and description, preserving punctuation, Unicode, and meaningful line breaks.
- [ ] Visitors can change a suggested title and move between creation steps without their edits being replaced.
- [ ] Whitespace-only title or description prevents placement. The field has a specific, gentle explanation, such as “Give your exhibit a few words before placing it.” Input is retained.
- [ ] Any input limits are visible before placement, never silently truncate words, and produce readable validation. Exact limits are to be set during the technical plan.

### Choose a Handcrafted Form

Source: `scope.md > The POC Boundary`.

Visitors choose a symbolic home for their idea themselves. No automatic artifact classification or claim that the museum has interpreted their story.

The approved set is **book, spaceship, plant, music box, canvas**. Each has a small visual preview and a clear name. Artifact identity, lighting, and motion carry the visual variation; additional color customization is not required for this POC.

Acceptance criteria:

- [ ] All five forms have distinct, recognizable previews and a visible selected state.
- [ ] A visitor can explicitly choose any form regardless of their description, change it before placement, and retain their words.
- [ ] Placement requires a selected form, and the exhibit uses exactly the chosen form.

### Place and Reveal

Source: `scope.md > What "Working" Looks Like`.

“Place in Museum” initiates a brief reveal in the existing room. The creation panel gently fades; the selected artifact appears on its pedestal; its display spotlight illuminates; an elegant plaque displays the chosen words. The reveal does not complete or upgrade the artifact.

Acceptance criteria:

- [ ] One deliberate submission creates one exhibit; repeated activation during placement does not create duplicates.
- [ ] The revealed artifact and plaque match the reviewed choices.
- [ ] The reveal ends in a usable museum with the new exhibit selected and its plaque available.
- [ ] A successful save quietly confirms “Your exhibit has found its place.” A failed save never shows that persistence confirmation.
- [ ] Under reduced motion, the exhibit and plaque appear directly without the animated reveal.

The reveal spotlight is a temporary presentation effect, independent of the exhibit's saved persistent-light state. A new exhibit's persistent light starts **off**. Turning it on remains the visitor's deliberate choice. Settling or replaying presentation effects never changes that saved state.

- [ ] Immediately after placement and after a successful save and reload, a new exhibit's persistent light is off until the visitor explicitly changes it.
- [ ] Ending the temporary reveal spotlight does not toggle or save the persistent light. Selection lighting and replay animations also leave its saved state unchanged.

### Select, Illuminate, and Replay

Source: `scope.md > The Unique Kernel`.

Selecting an artifact opens its plaque without altering its light. Inside the plaque:

- **“Leave a little light on”** plays the artifact's 2–3 second animation, turns its lasting golden light on, and shows **“A little light, left on.”** Repeated use leaves it on rather than toggling it.
- **“Relive the moment”** replays the same animation without changing the light state.
- A clearly labeled light toggle turns the lasting light on or off. Turning it off does not imply rejection, retirement, or loss of the exhibit.

The spacecraft's tiny lights flicker; the book opens slightly and pages flutter; the plant unfolds a glowing leaf; the music box gently turns; the canvas shimmers. A warm golden glow accompanies the brief moment, then settles. No sound is required for the POC.

Acceptance criteria:

- [ ] Clicking, tapping, or keyboard-selecting an artifact opens its plaque and never changes saved light state.
- [ ] “Leave a little light on” animates the selected artifact, shows its message, and leaves its lasting light on after the animation settles.
- [ ] “Relive the moment” works with the lasting light either on or off and preserves that state.
- [ ] The toggle exposes its on/off state in words as well as visually; the artifact's lasting glow reflects the state.
- [ ] Repeated animation activation does not stack runaway effects or block browsing.
- [ ] Successful light-state saves survive reopening. No light fades with time or absence.
- [ ] Reduced motion substitutes immediate light/state feedback and the text message for flickering, movement, shimmer, or spreading glow.

### Return and Browse the Collection

Source: `scope.md > The Core Loop` and `The POC Boundary`.

The same browser restores the visitor's saved collection and lasting lights. Returning visitors see their exhibits directly, with the add action available. Selecting one connects it to its full plaque. Browsing beyond the initial positions does not create new rooms.

Acceptance criteria:

- [ ] Multiple exhibits retain their own title, description, form, and light state after a successful save and reload.
- [ ] At least seven exhibits can be created and browsed; the seventh is reachable without overlapping or hiding the initial positions.
- [ ] Mobile supports swiping and explicit accessible browsing controls. Desktop supports visible browsing controls when needed.
- [ ] Long plaques remain readable and scrollable without clipping essential controls or breaking the room layout.
- [ ] The UI explains that saving is limited to this browser/device and that clearing browser data may remove the collection. It does not promise permanent or cross-device preservation.

## States and Boundaries

Source: `scope.md > The POC Boundary`; interruption and error choices supplied by the learner.

### Session Draft and Cancellation

- Keep creation inputs, edited title/description, chosen artifact, and progress when creation closes during the current browser session. Offer **“Continue where you left off”** when reopened.
- Continuing returns to the unfinished creation rather than creating an exhibit prematurely. A draft is distinct from a placed exhibit.
- After successful placement, reopening creation starts a new exhibit. A failed save retains the editable creation data for retry.
- Draft recovery is session-limited; do not promise it after the browser session ends.

Acceptance criteria: close and reopen midway without losing words or selection; repeat after navigating between steps; successful placement must not later reappear as an unfinished draft.

### Save Failure and Retry

- Keep an unsaved exhibit visible and its source words editable during the current session.
- Explain **“Your exhibit is here for now, but this browser couldn't save it for your next visit.”** Offer retry; never imply durability until retry succeeds.
- Failed light-state saves also keep current session state visible and honestly report that it may not survive a return.
- Retry updates the same exhibit, never inserts a duplicate. Do not erase other exhibits or discard the visitor's words as an error-recovery shortcut.
- If previously saved content cannot be read, explain that it could not be loaded rather than pretending the museum is simply empty or silently replacing it.

Acceptance criteria: simulate failed saving, observe the warning and retained words, retry successfully without duplicates, then reload and verify the exhibit. A load error must be visibly distinguishable from first use.

### Accessible and Responsive Use

- All creation steps, form choices, plaque controls, dismissal, and browsing are usable with keyboard alone and visible focus.
- Panels have clear names, sensible focus order, and predictable focus return on dismissal. Escape closes a panel without silently discarding the session draft.
- Fields have visible labels; validation and save feedback are available to assistive technology. Decorative museum elements do not obscure controls or create meaningless navigation stops.
- Text and controls remain legible against the atmospheric scene. Meaning and light state never rely only on color, motion, or sound.
- Respect reduced-motion preferences for ambient effects, reveal, and artifact interactions while preserving immediate state feedback.
- Desktop and mobile retain the same core functions. Mobile supports readable plaques, comfortable touch controls, and vertical scrolling when the keyboard or short viewport reduces space. Horizontal movement is limited to the deliberate exhibit gallery rather than the entire page.

Acceptance criteria: complete the core journey by keyboard; repeat on a narrow mobile viewport; enable reduced motion and verify that all actions and saved states still work without the decorative animations.

## Product Decisions

- The museum remains the centerpiece; creation and plaques open within it rather than navigating to separate pages.
- Three short creation steps balance remembrance, editable words, and an explicit symbolic choice.
- Visitor authorship is preserved: transparent title templates, no description rewriting, and manually chosen artifacts.
- Selection, illumination, replay, and the lasting-light toggle are distinct. Exploring never accidentally changes an exhibit.
- The lasting light is reversible, saved, and never affected by absence.
- Desktop uses pedestals/shelves with a side plaque; mobile uses a horizontal gallery and dismissible plaque.
- Approximately six initial positions keep the museum intimate; simple browsing accommodates more.
- Session drafts and honest, recoverable save failures protect the visitor's words without promising storage the browser cannot provide.
- Approved artifact set: book, spaceship, plant, music box, and canvas; one editable title suggestion with a neutral fallback.
- New exhibits start with their persistent light off. The reveal spotlight is temporary and independent of persistent-light state.
- No audio or general post-placement editing in this POC; creation and save-recovery editing remain included.

## What We're Building

One atmospheric room; empty and returning states; the three-step creation panel; editable template title and description; a small handcrafted artifact set; placement/reveal; readable plaques; separate light/replay/toggle actions; collection browsing; same-browser persistence; session draft recovery; accessible, responsive, reduced-motion behavior; validation and honest save/retry feedback.

## Deferred From the POC

Source: `scope.md > Later` and `Explicitly Cut`.

- More forms, richer customization, additional spaces, and a dedicated retirement experience: protect time for the central interaction.
- General post-placement editing, deletion, search, sorting, export/import, and draft libraries: not part of the approved core loop. Editing retained words during creation or save recovery remains included.
- Sound: visual and textual feedback fully demonstrates the kernel without extra assets or controls.

## Non-Goals

No accounts, backend services, public gallery, social systems, cross-device sync, runtime AI, generated per-submission artwork, automatic emotional interpretation, motivational advice, complex 3D navigation, productivity goals, streaks, achievements, progress bars, notifications, or artificial urgency. These either exceed the small proof of concept or conflict with its identity.

## Open Questions

No unresolved product decisions block approval. The learner explicitly approved all four review proposals, now recorded under Product Decisions.

**Can wait for `4-spec`:** exact title-template wording and mechanical use of visitor text within the agreed meaning-preserving rule; visible input limits; specific browsing controls; fonts and implementable styling; storage/retry mechanics; free hosting choice. These must preserve the product behavior above and introduce no additional services or scope.

Deadline and delivery constraints remain those in `scope.md > The POC Boundary`: ₹0, 6–10 total active hours, live deployment strongly preferred, public repository and short demo video, submission by October 27, 2026 at 2:30 AM IST. No implementation begins through this document.
