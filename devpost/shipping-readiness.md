---
doc: shipping-readiness
status: in-progress
---

# ALMOST — shipping readiness

Reviewed October 26, 2026. Technical preparation is complete. The creator explicitly authorizes pushing the full repository, including audio. GitHub publication is complete and anonymously verified at release commit `4ae45ee2264adc6503d9a5d186e81b501eb489a1`. Deployment, video upload and Devpost submission remain unauthorized and unperformed. Music redistribution rights are not independently confirmed and no blanket license is claimed.

## Build prerequisites

- Approved scope, PRD, specification and build checklist read from the actual project.
- All build slices complete. The learner confirms final hands-on review is finished.
- Completed the experienced-user learning wrap-up as an evidence-based recap: presentation/meaning principle → persistence-gated reveal → executed failed-save browser test. It was not a hands-on code tour or assessment of mastery. Optional reflection is kept only in the ignored learner profile.
- App map refreshed and checked offline with JavaScript disabled and zero external requests. See `checklist.md` for the completion record.
- Final sizing request implemented: display section, artifacts, shelves and plaques at 80%; navigation targets remain 44px. Measurements and screenshots: `display-size-report.md`.

## Executed verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed, no warnings |
| `npm run test -- --run` | 103 unit tests passed |
| `npm run test:e2e` | 116 production-browser executions passed |
| `npm run build` | Passed, including rebuild after license notices |
| Gallery-focused regression set | 16 desktop/mobile executions passed |

The browser suite integrates the real UI with browser storage. It covers three-room navigation, creation/preview/reveal, selection/light independence, exact text, stable IDs and duplicate submissions, reloads, blocked/corrupt/conflicting storage, retry recovery, journal dates/editing/drafts, per-group constellation naming/merging/untie, music and responsive/keyboard/reduced-motion behavior. These are the integration checks; there is no separate integration-test runner.

Tests use isolated synthetic data. Mobile means Chromium device emulation, not a physical iPhone or WebKit. No live-host, human listening, full screen-reader or exhaustive security certification is claimed. Tested local runtime: Node 25.5.0 / npm 11.8.0; verify a compatible supported Node release in the hosting build.

Production smoke checks at `http://127.0.0.1:4173/`:

- HTML, bundled JS/CSS, favicon, three MP3s and `third-party-notices.txt` return 200 with appropriate types.
- An MP3 byte-range request returns 206 with the expected `Content-Range`.
- All three room destinations work without changing the root URL; there are no path-based room routes requiring rewrites.
- No external requests or browser page errors during the smoke check.
- The private learner-profile content is not served from the production build.
- Production JS: approximately 351.7KB before compression; CSS: 105.1KB. Music adds approximately 6.3MB in static files and loads only after playback is requested.

## GitHub publication audit

Existing repository supplied by the learner: https://github.com/mridul12-cat/Almost . Anonymous GitHub API and page requests return 200; API reports `private: false`, default branch `main`. At the initial audit the remote Git repository was empty (tree/commit endpoints reported 409). After the authorized push, anonymous API checks confirm 212 tracked files, all required planning/source files, all three MP3s matching local blob hashes, MIT detection and no private/config paths. The remote `main` matched release commit `4ae45ee2264adc6503d9a5d186e81b501eb489a1`. At audit time no Git remote was configured locally. Existing macOS Git credentials passed a dry-run push check without uploading files. The creator subsequently authorized pushing to this existing repository, including audio. Added the token-free `origin` URL and pushed local `HEAD` to remote `main`; no force push, visibility change, account setup or repository creation was performed.

Audit baseline: local commit `420a129`, 15 commits reachable from all local refs, 225 historical text blobs and 201 tracked files. Pattern scans found no high-confidence private keys, GitHub/OpenAI/AWS/Slack credentials or credential-bearing HTTP URLs. No learner-profile, credential file or `.env` path was found in reachable history. This is a bounded pattern/path review, not proof that every possible secret is absent.

- `devpost/scope.md`, `prd.md`, `spec.md`, `checklist.md` and `app-map.html` are tracked.
- `devpost/learner-profile.md` remains ignored, untracked and absent from history; local reflection is not copied into public artifacts.
- `.env` and `.env.*` are ignored, allowing only a secret-free `.env.example`. No app environment variables are needed.
- Git author metadata contains the author's name and machine-local email. That metadata becomes public if existing history is pushed; it has not been rewritten.
- The two pre-existing presentation edits in `MuseumEnvironment.tsx` and `refinements.css` were preserved in the reviewed release checkpoint, so the published source matches the tested experience.
- Untracked course/config directories (`.agents/`, `.claude/`, `agent/`), `skills-lock.json` and original `music/` sources are outside the publication whitelist. Never use a blanket `git add` or upload the whole workspace.
- Audio is already in local commit `420a129`. After this was explained, the creator explicitly instructed “push the audio files too”, superseding the earlier hold for the GitHub push. Preserve the full history; no music-free history or history rewrite is authorized. Audio remains excluded from MIT and no verified redistribution license is claimed.

The existing public repository is now populated and anonymously verified. Original local history is preserved. No credential or learner-profile paths were published.

## License and assets

- The learner approved the standard MIT License for application source and original SVG artwork: copyright 2026 Mridul Dabral. Root `LICENSE`, package metadata and README reflect that decision.
- MP3s are expressly excluded from MIT. Their Gemini/Lyria origin is recorded in `MUSIC_RIGHTS.md`; unrestricted redistribution and exclusive ownership are not claimed. Applicable redistribution rights remain unconfirmed; the creator nevertheless explicitly authorizes this GitHub publication.
- Runtime React, React DOM and Scheduler use MIT. Their installed notices are retained in `THIRD_PARTY_NOTICES.md` and the deployed `third-party-notices.txt`.
- Lockfile metadata records licenses for all installed dependencies. Build/test dependencies include MIT, Apache-2.0, ISC, BSD variants, MPL-2.0, CC-BY-4.0 and BlueOak-1.0.0; they retain their own terms. No dependency is relicensed by the application's MIT license.
- Room/Pip/artifact illustrations are repository-native SVG/CSS; no external artwork or font service is required. QA screenshot exhibits and memories are synthetic.

## Vercel deployment readiness

`vercel.json` is present: Vite preset, `npm ci` install, `npm run build`, output `dist`. No environment variables, functions, backend, authentication or paid APIs. Connect GitHub only after the reviewed source is published with authorization. Keep the free provided domain.

Vercel Hobby is conditional on personal, non-commercial eligibility and account limits. Git integration also checks the commit author against the Hobby owner; the current machine-local author email may need a verified GitHub identity on future commits. Do not rewrite old history or change global identity without agreement. Current local branch is `master`, while the empty repository advertises `main`; choose the intended remote/production branch explicitly when publishing. No forced push is prepared.

Provider references: [Hobby terms](https://vercel.com/docs/plans/hobby), [Vite](https://vercel.com/docs/frameworks/frontend/vite), [Git integration and author checks](https://vercel.com/docs/git). Backup remains [Render Free Static Site](https://render.com/docs/static-sites), build `npm ci && npm run build`, publish `dist`; no Render Web Service, paid upgrade or Cloudflare Pages.

After separate deployment approval and a decision about its soundtrack rights, perform a fresh public HTTPS desktop/mobile smoke check: no deployment login barrier, all assets load, create/light/reload, journal and constellations persist, and music works only by choice. Browser collections are specific to their origin; local data will not transfer to a deployment. Account eligibility, provider build and live HTTPS behavior remain unverified because no deployment was made.

## Remaining shipping work

- [x] Record music provenance, MIT exclusion and explicit creator authorization to publish the supplied MP3s to GitHub despite unresolved redistribution rights.
- [x] Creator authorizes the full existing source/history, including audio, to the supplied GitHub repository.
- [x] Verify the populated public repository without authentication — main/4ae45ee, required files and audio match; private paths absent.
- [ ] Approve deployment and confirm Hobby eligibility; then verify the actual live URL.
- [ ] Record and publicly upload the demo; verify its link without authentication.
- [ ] After the demo is ready, review authenticated form fields and exit-survey prompts with the learner. The learner has not started the form and explicitly defers this step; it does not block technical preparation.
- [ ] Learner writes all submission descriptions and reflections and completes the exit survey.
- [ ] Learner explicitly authorizes Devpost submission, or submits it personally.

The authorized GitHub push and anonymous verification are complete. No deployment, video upload or Devpost submission has been performed. See `demo-checklist.md` and `submission-checklist.md` for the remaining mechanics.
