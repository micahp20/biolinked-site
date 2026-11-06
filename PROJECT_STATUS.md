# Bio Linked Solutions — project status

Last reviewed: 2026-11-05 (America/Denver).
Repository: https://github.com/micahp20/biolinked-site
Production domain recorded in CNAME: https://biolinkedsolutions.com
Inspected main baseline: 0bd7f7117ee38a5e3693f35b0125705df589277b.
Memory branch: docs/project-memory-2026-11-05.

## Current assignment and handoff
Establish permanent repository instructions, status and change history without changing the live website.
Deliverables are root AGENTS.md, PROJECT_STATUS.md and CHANGELOG.md, stored in documentation-only commits on the memory branch and exposed through an unmerged draft PR.
No website feature development is authorized by this setup request.
Next session: read AGENTS.md and this file from the memory branch, fetch current main/history, then take the owner's next business request. Do not silently merge this setup into main.

## Recovery evidence and limits
Reviewed the complete recursive repository tree, 20 latest main commits, 40 earlier commits covering the previous evening, 20 recent closed issue/PR records, open PR list, main branch metadata, the five latest Pages runs and selected source files.
No AGENTS.md, PROJECT_STATUS.md or CHANGELOG.md existed in the inspected baseline tree. There was no root package.json or checked-in general test runner.
No open PRs were returned at inspection time; repository metadata reported zero open issues. This does not establish that all work is finished.
Recovered task summaries include previous Cursor PR descriptions and Git commit messages. Full earlier ChatGPT, Cursor and Claude conversations, local scratch files, private design approvals, and uncommitted work from other machines were not accessible. PR test claims below are historical reports, not tests rerun here.

## Completed in repository history
- Intake: pay-first cover, legal acknowledgement before questions, seven package benefits and four client-portal preview cards. Current paid fee is $19.99 with $20 credit toward a stack/protocol. Both intake.html and intake/index.html carry the flow. Evidence: PRs #118–120; 78b9080.
- Promo waiver: labeled code field, Apply/Enter submission, inline blank/invalid handling, full waiver opening the legal gate, distinct zero-paid metadata rather than Stripe/paid-credit metadata. Evidence: PR #123; baseline 0bd7f71. Source inspected; no payment or real submission made in this session.
- Public navigation hides Intake while retaining direct intake URLs; Stack Analyzer has request timeout and button recovery changes. Evidence: PR #117; 34abdf3. Existing public nav source inspected.
- Client layout migration and shared enhancements: quote payment buttons, calculator compound-name recovery, read-only schedule expansion and invoice-preservation gates were committed in batches on the previous evening. Evidence: 73b90fc, 89b714c, f76e27f and their following batch commits.
- Client-specific schedule/free-invoice fixes and shared Erica theme path/cache-prefix corrections were recorded in PRs #115–116. Other recent commits retain client-supplied item scheduling and correct recognized cadence values. Existing customizations must be preserved.
- Recent client quote, billing-display and nutrition-profile corrections are in main. These are committed source changes, not independently verified accounting transactions. No client financial or health details are copied into this general handoff.

## Structure and design
- Static public pages at root plus index/; many individual client portal folders; shared CSS/JS and local service workers/manifests.
- Public design uses the existing BL mark, gold identity, Cormorant Garamond/Montserrat typography, responsive cards, theme support and iOS header fixes. Later protocol/consistency CSS overrides parts of public-gold.css; read actual inclusion order.
- Client theme dependency: erica/protocol-theme.css. Conversion tooling currently uses dcoone/index.html as a template. Do not assume a single page can replace every client's data or custom behavior.
- Worker entry: worker/ask-worker.js through root wrangler.toml. Backend integration source/SQL is present separately. This setup did not access or change backend records.

## Outstanding issues and unknowns
1. Default-branch adoption: these memory files are intentionally on a non-publishing branch. Until merged, a default main checkout does not automatically see them. Future Codex tasks must select the memory branch or fetch/read these files explicitly. Merge later only under authorization that permits a Pages build.
2. Deployment/content mismatch has happened before: PRs #121–122 describe stale intake content after Pages build success and a queued build. The latest five Pages runs now report success, including baseline 0bd7f71. Live content was not independently checked in this documentation setup; do not declare that old issue fully resolved.
3. tools/github/README.md says the Supabase keepalive workflow needed manual installation because earlier credentials lacked workflow scope. The recursive tree contains tools/github/supabase-keepalive.yml but no .github/workflows/ directory. Installation/alternate keepalive and actual backend availability remain unverified.
4. tools/convert/run_wave.py references an old machine's private scratch directory. It cannot be treated as a portable ready-to-run test/migration command without preparing its inputs and reviewing its write behavior.
5. Complete design approvals, unfinished business requests from earlier chats, and a full production regression baseline are missing. Do not infer new business priorities from commit messages.
6. Current intake source recognizes a browser query/session flag as the paid-return unlock. End-to-end server-side payment verification was not audited here; source presence is not proof a payment was verified. Preserve existing behavior during unrelated work and assess it before a future payment-flow change.

## Next priorities
1. Keep this documentation visible through the draft PR; use its branch for the next session's memory.
2. When authorized to allow a publishing-branch update, merge the documentation so ordinary main checkouts receive AGENTS.md automatically.
3. Take the owner's next requested feature or fix. Do not invent a feature backlog.
4. For that request, confirm affected dependencies, establish relevant behavior checks, make the change, and update this file and CHANGELOG.md before finishing.
5. Investigate the recorded deployment/keepalive/tool portability questions only as relevant to the next authorized task.

## Verification and release record for this setup
- Scope: exactly three new Markdown files; no HTML, JavaScript, CSS, client data, service worker, domain, backend or hosting configuration changes intended.
- Required verification: compare the new tree with baseline and ensure every existing path retains its original blob SHA; fetch all three documents from the remote commit/branch; verify main remains at baseline; inspect runs for the documentation SHA.
- Application tests: not needed for documentation-only changes; no runtime test or live behavior validation claimed.
- Delivery method: GitHub API tree/commit and non-publishing branch, not a local git push.
- Merge: intentionally not performed. Production deployment: not requested or initiated. A later session must verify its own current branch, commit and deployment state rather than relying on this historical record.

## Owner workflow preferences saved — 2026-11-06 UTC
- Added permanent AGENTS.md instructions to include every new protocol in /share/ and ask before inventory deductions.
- Scope: documentation only; no Share page, client page or inventory changes in this preference-saving task.
- AGENTS.md saved directly on main under the owner's current request. Earlier documentation-setup branch restrictions above describe that historical setup.
- Checked existing instructions, status and changelog; content-only documentation checks apply. Main documentation commits may trigger Pages; no live behavior change is claimed.

## Schedule pilot — 2026-11-06 UTC / 2026-11-05 America/Denver
- Owner explicitly authorized deployment on the existing /mmoritz/ portal only before wider rollout. Added a current-cycle card, transition preview, Undo and completed history, foundation-only phase, unique compound count, and client schedule editing on the normal link.
- Paths: mmoritz/index.html, mmoritz/schedule-pilot.js, mmoritz/schedule-pilot.css, mmoritz/sw.js. Billing, compound definitions, storage ownership and other portals are preserved. Cycle state uses the existing versioned schedule payload; no database/schema changes or inventory actions are part of this pilot.
- Source baseline on main: 782dcdb00af88095755ae0c789e7e83793a78b6d. Publishing as one GitHub API commit on main, not a local git push or separate merge. Earlier no-deployment wording describes the historical documentation setup, not this explicitly authorized pilot deployment.
- Checks: all inline and pilot JavaScript syntax passed. Headless Chromium smoke verified initial phone view, Cycle 2 preview/transition and mocked schedule sync with no page errors. Model checks passed preview/cancel, advance/Undo, ongoing foundation, personal additions, pause/restore, synced hydration, Cycle 6 KLOW, foundation-only, completion history, empty schedule and unchanged protocol data. Full follow-up browser coverage was limited by the execution sandbox; do not claim complete device regression coverage.
- Release validation pending: inspect the main Pages run for this exact commit and read live assets if reachable. Report deployment and live-verification status separately. Wider rollout remains unapproved.

### Pilot release result — 2026-11-06 UTC
- Feature commit e7010bcc30d30ed4760c710abc130ae63889d7a4 is saved directly on main via GitHub API (no local push or PR merge).
- GitHub Pages run 42157523372 completed successfully for that exact main SHA; build and deployment reported success. https://github.com/micahp20/biolinked-site/actions/runs/42157523372
- Remote pilot asset was fetched back and verified. The web-reading tool could not access the production domain, so independent live-page retrieval remains unavailable; do not claim a live-browser test.
- Scope remains the existing mmoritz/ portal only. No wider rollout or production schedule-state migration was performed. Test sync used a mock, with no live member-state writes.
