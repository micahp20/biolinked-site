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

## Quote-only revision — 2026-11-06 UTC
- Owner requested a single-item quote on existing nprince/ portal; revised quote line items and total, retaining quote status. No inventory, paid ledger, dosing, schedule or historical clinical data changes.
- Paths: nprince/index.html and nprince/sw.js. Arithmetic and preserved-data checks passed; publishing directly to main via GitHub API under the website update request. See the corresponding main commit/Pages run for release result; live deployment not yet verified at this entry.

## Existing quote add-on — 2026-11-06 UTC
- Added the requested Cagrilintide line to the existing nprince/ quote and retained its existing protocol entry. Preserved quote status, shipping, BAC allocation, dosing, and schedule state; no inventory movement.
- Paths: nprince/index.html and scoped service-worker cache. Verified exact line-item sum; committed through GitHub API on main under the owner's update request. Deployment result must be checked separately.

## Protocol/quote alignment correction — 2026-11-06 UTC
- Owner identified the nprince/ protocol still showing the earlier multi-compound recommendation after the quote was narrowed. Corrected the protocol list and cycle/handling notes to the two selected compounds and updated the changed vial-strength draw conversion, preserving the existing dose/timing and quote data.
- Paths: nprince/index.html and scoped service worker. Checks passed: all inline JS syntax; actual aboutCompound/renderAbout output contains exactly two selected cards; removed items absent from client notes/overview; concentration arithmetic; unchanged quote total/status and inactive schedule defaults.
- No inventory, paid status or live schedule-state changes. Source baseline: f2fbe2133cb5c59f49f3f9c2f42fbddeccc53478. Saved through GitHub API on main; deployment must be verified separately from source.

## Protocol explanations and second schedule pilot — 2026-11-06 UTC
- Owner requested the accepted schedule pilot on arasche/ only, keeping wider schedule rollout deferred. Reused the client-scoped implementation with the existing local and cloud identity; no production schedule-state writes.
- Updated explanatory prose across 141 data-driven portals and added definition/rationale adapters to five legacy protocol layouts (146 pages total). Compound descriptions lead with a plain definition and role, while existing notes remain expandable. Cycle rationale is based on actual listed membership and separates proposed complementary mechanisms from demonstrated combination benefits. Dose/timing facts remain in their original fields.
- Shared assets: protocol-copy.js (editorial definitions/rationale), protocol-context.js, protocol-context.css. Updated each affected scoped worker cache. Existing active schedules, invoices, payment states, calculator entries, patient notes and client keys preserved by per-page checks; no inventory movement.
- Validation: 146 page preservation checks and 473 inline-script syntax checks passed; 132 standard render checks passed (two customized renderers require their existing extra helpers, not treated as failures of production code); all 144 worker scripts parsed. Editorial lookup covers every one of the 201 observed compound labels. August pilot model passed transitions, preview/cancel, Undo, current/future distinction, personal additions, pause/restore, synced hydration, foundation-only phase and empty schedules. Full browser regression across all clients was not performed.
- Definition/claim checks consulted https://medlineplus.gov/druginfo/meds/a622022.html, https://www.lilly.com/news/stories/what-to-know-about-retatrutide and https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks. These sources distinguish hormone definitions, receptor mechanisms and evidence limits; no combined-efficacy claim is inferred.
- Release baseline main 131bbca00c00ce552c09f88fece0959c10d0f4bc; publishing through one GitHub API commit. No local git push or separate PR merge. Pages/live verification remains a separate release step. General memory intentionally excludes client financial and clinical particulars.

## New protocol quote, instructions pending — 2026-11-06 UTC
- Built a new mmenkveld/ quote portal from the current shell with per-client identity/storage isolation and added its link to share/. The requested schedule applies only to the second blend; missing first-blend instructions and dose-basis clarification are explicitly pending rather than inferred.
- Cleared inherited health notes, compound/invoice/cycle data and demographic measurements. Quotes remain inactive and unbilled; no paid flag, sales entry, inventory deduction or external message was created.
- Paths: mmenkveld/index.html, manifest.json, sw.js and share/index.html. Inline JS syntax, quote arithmetic, item count, absence of excluded charges, old-client identity removal, storage keys, schedule defaults, and recon/day fields passed. Shipping/BAC excluded as requested.
- Baseline main 91c38f2493a8512786a8afd9499b710ff6816489. Publishing reviewable quote/protocol with clearly pending instructions; dependent dosing fields must be completed when the owner replies. This does not represent finalized dosing instructions. Deployment checked separately.

## Pending protocol instruction clarification — 2026-11-06 UTC
- Owner confirmed CJC/IPA weekday evenings on mmenkveld/. Updated its protocol days/time and notes; recon and dose remain explicitly pending. Preserved quote, payment and inactive schedule defaults; no inventory action.
- Verified invoice data unchanged and weekday array. Saved to main via GitHub API; deployment is a separate check.

## Existing quote quantity revision — 2026-11-06 UTC
- Owner reduced mmenkveld/ quantities to two of each selected blend. Updated quote summary, line amounts, due total and quantity note; retained quote status and excluded shipping/BAC. Clinical fields and Share entry unchanged; no inventory action.
- Checked line-item sum and clinical-data equality. Saved to main through GitHub API; publishing status checked separately.

## Confirm dosing and enable requested schedule — 2026-11-06 UTC
- Updated mmenkveld/ with owner-confirmed CJC/IPA recon/dose and clearer compound/cycle explanations. Checked the existing shared master dosing guide before applying the values. The second blend follows the owner's client-specific dose rather than replacing the shared guide.
- Added both selected compounds to protocol defaults and calculator entries at the owner's explicit request, independently of quote/payment status. No inventory action or billing change. Existing schedule state is to be updated after deployment while preserving unrelated client edits.
- Paths: mmenkveld/index.html and scoped worker. All inline syntax, dose conversion, weekday membership/shot counts, calculator entries, absence of pending clinical fields and unchanged quote status/total passed. Saved through GitHub API on main; deployment and synced-state verification are separate release checks.


## Profit-and-loss phone layout — 2026-11-06 UTC
- Owner requested a mobile-first operations page matching the public site. Added scoped presentation assets to profit-loss.html: labeled phone cards, bottom tabs, mobile sorting, larger controls and bounded dialogs. Desktop tables remain available. Original accounting, data access and inventory scripts are byte-for-byte unchanged; no database/inventory writes performed.
- Paths: profit-loss.html, profit-loss-mobile.css, profit-loss-mobile.js. Source baseline main f570f45cca0b976d05c898325c8ef85a6b6e768a. All inline/new script syntax passed. DOM interaction checks passed for five tabs, labels, sort, search, and six form open/close flows. Original inline-script equality passed.
- Visual browser checks at phone/desktop widths remain unverified: Chromium launch requires sandbox network permission; attempts did not complete approval. DOM tests do not establish visual correctness. Release saved via GitHub API; verify hosting SHA/result separately.
- The requested all-protocol Schedule/Calculator audit remains active. Current mock-DOM checks have identified saved-calculator unit/count errors; no blanket functionality claim has been made. Next: fix confirmed defects, extend persistence checks, and complete per-page audit.

## Protocol Schedule/Calculator control audit — 2026-11-06 UTC
- Owner requested controls checked across protocols. Audited 142 current portals plus six older layouts using mock DOM/storage/network data. Fixed saved-unit/count errors, edit-before-save data loss, restored calculator units, capacity validation, syringe input persistence, intentional empty schedules, and lost recon context in added schedule rows.
- Preserved per-client protocol/billing data and storage identities on all 142 modified pages; did not write production client state or inventory. Three existing advanced schedule layouts and both cycle pilots passed their applicable model flows. Wider cycle-pilot rollout remains deferred.
- Paths: 142 individual portal index.html files and their scoped sw.js versions; tools/tests/protocol-controls-audit-2026-11-06.md. Exact-patch and remote baseline SHA checks passed. Staged tree was checked against main a2af9c3a37cde8962488d12ecc586d471c279307: only the expected 284 implementation files changed before documentation.
- All-page interaction/persistence and per-page data comparisons passed after two isolated retests. These are DOM/model checks; rendered mobile/desktop/light/dark and live backend tests remain unverified because Chromium sandbox permission attempts did not complete. Do not claim every button was visually verified.
- Saved remotely via GitHub API on main; hosting SHA/result must be verified separately. The preceding profit-loss release a2af9c3a37cde8962488d12ecc586d471c279307 built successfully but its Pages deployment was still in progress at the last check; live HTTP fetch was blocked by the workspace proxy.

## Member portal visual consistency — 2026-11-06 UTC
- Owner requested mpauldino/ match the other portals while retaining the personal vitamins/supplements tools and changing the displayed nickname. Added a page-scoped style adapter for the existing schedule engine, using shared portal typography, colors, cards, control sizing and theme tokens. Removed a duplicate older skin reference.
- Added clear vitamins/supplements navigation in the sidebar, menu and More view. Updated welcome/browser/app naming and schedule greeting, including when older local state has the previous display name. Preserved existing authorization behavior, all compound/billing/lab/note data, medication/supplement definitions, schedule state schema and client storage identity.
- Paths: mpauldino/index.html, protocol-consistency.css, manifest.json and sw.js. Source baseline main 2951e5038a3864c0da81e9ce18ecbadcbaba31e9. Mock-DOM tests passed for data equality, navigation, all existing medication entries, supplement add/remove/restore, custom schedule entries, existing-storage reopening, calculator and inline handler/script syntax. No production state or inventory writes.
- Rendered desktop/phone/light/dark browser verification remains unavailable under the workspace sandbox; tests do not establish visual correctness. Saved to main via GitHub API; verify hosting SHA/result separately. The previous control-audit release 2951e5038a3864c0da81e9ce18ecbadcbaba31e9 completed Pages deployment successfully before this request.

## Compact personal portal typography — 2026-11-06 UTC
- Owner reported the mpauldino/ Schedule type and cards were too large in a phone screenshot. Reduced compound names, dose labels, metadata, block headings, welcome/greeting type and supplement rows; tightened card padding. Kept input text and touch targets usable.
- Paths: mpauldino/protocol-consistency.css, index.html asset version and scoped sw.js cache version. Baseline main 51db3177518d09c1a12b9ddcc79cd940380027eb. HTML changes are limited to the stylesheet version; all scripts, client data, doses and timing are unchanged. No inventory or backend writes. CSS delimiter and worker syntax checks passed; rendered phone verification remains unavailable in this workspace.
- Saved through GitHub API on main; deployment checked separately.

## Personal expandable schedule editor pilot — 2026-11-06 UTC
- Owner requested mpauldino/ as the corrected pilot: compound row expands to a definition and editable dose, draw, recon, weekdays and AM/PM controls, plus remove/restore. Added staged Save/Cancel behavior so removing the displayed weekday does not dismiss an unfinished edit.
- Added master-list and manual entries using the same expandable editor. Preserved the existing supplement-aware schedule engine, all static protocol/billing/lab/notes data, permission gates, member identity/storage namespace and all existing vitamin/medication entries. Matt and Natasha pages were inspected as references and not changed.
- Paths: mpauldino/index.html, schedule-editor.js, schedule-editor.css and scoped sw.js. Added optional recon metadata to the existing payload/hydration path; no database/schema/function changes. Read-only inspection confirmed the existing RPC JSON contract; a read-only fixture query matched its validation. No production client-state or inventory writes.
- Baseline main 2d4d48972922e2871a794ac458dc38b199fc1074. Mock-DOM tests passed: definitions and expansion; staged edits/save/cancel; dose/draw arithmetic where concentration is known; unknown-concentration draw confirmation; weekdays/time; add/edit/remove/restore; local reopening; payload hydration; recon clear; incompatible units/invalid inputs; stale-edit protection; permissions; data equality and supplement retention. All inline/new JS syntax and CSS delimiter checks passed.
- Rendered phone/desktop/light/dark and actual cross-device browser behavior remain unverified under the workspace browser restrictions. Do not equate these DOM/model and contract checks with live browser testing. See tools/tests/personal-schedule-editor-2026-11-06.md. Saved to main via GitHub API; verify hosting SHA/result separately.

## Correct layout, remove unlock and verify real Schedule controls — 2026-11-06 UTC
- Owner rejected the prior partial layout change and explicitly requested removing the unlock feature. Rebuilt mpauldino/ Protocol into the shared inline card layout and Schedule into the reference Morning/Night list structure. Removed the frontend unlock gate/badge; kept backend credential checks and existing storage ownership. All existing clinical/billing/lab/notes data and supplement entries are preserved.
- Fixed nprince/ default and added-row editing/removal using staged fields and timestamped removals, including the existing manually saved entry. Calculator additions now retain vial/recon context. Custom vial mass/IU selection and master-list calculated draws were checked.
- Real native Chromium click tests passed for default-row move/remove/restore, My List add/edit/delete, calculator-to-schedule edit/remove, master/manual flows, persisted reopening and stale-cloud removal protection. Phone/desktop light/dark screenshots were reviewed. Fixed a banner covering controls and a sideways frame shift found during this browser pass.
- Paths: mpauldino/index.html, schedule-editor.js, protocol-layout.js, sw.js; nprince/index.html, schedule-controls.js, sw.js; client-schedule-controls.css. Baseline main ce2f15b96653251eff5244605f7678f1d73670bb. All inline/new script syntax, clinical/invoice/identity preservation and scoped cache checks passed. No production state or inventory writes.
- Browser checks used isolated mocked requests/storage, including a private read-only saved-state fixture. Not a Safari/device or live backend write test. See tools/tests/schedule-controls-repair-2026-11-06.md. Saved remotely on main through GitHub API; hosting SHA/result checked separately.

## Complete older installation-banner mount correction — 2026-11-06 UTC
- The older nprince/ shell mounted installation help outside its scroller. Moved that existing banner into the scroll flow so the shared non-overlay styling covers both repaired pages. Bumped only the local script URL and scoped cache version.
- Repeated the full native browser suite after this correction, including the delayed banner and the read-only saved-state fixture: all ten flows passed with no JavaScript errors. The broader repair is in 3e2619424232f7296487d00dbb09d13e1a731fe2; this follow-up completes the banner mount. No clinical, billing, inventory or production client-state writes.
- Saved to main via GitHub API; verify the final hosting SHA/result separately.

## Calculator add buttons — 2026-11-06
- Clients reported that Add to My List and Add compound / Add to schedule did nothing on every protocol, using nprince as the example. The handlers were present. On a phone the new row, the day picker, and the error text render outside the visible area, and there is no toast. A capture-phase guard also cancels Add to my schedule when the draw is incomplete and only fills a warning above the button. The schedule confirm control is disabled until a weekday is chosen, so that tap never fires. On some portals a fixed install banner sits over the bottom of the calculator and takes the tap.
- Added calc-feedback.js and loaded it from the head of all 143 calculator pages, including the dcoone template used for new portals. It does not change doses, weekday overrides, invoices, nutrition, workouts, or saved lists. It scrolls the result or the error into view, shows a toast, lets a disabled confirm button explain a missing day, and keeps the install banner in the page flow instead of over the buttons. Each affected portal service worker (142) now caches that script and uses a new cache name so installed apps pick up the page without clearing saved protocol data. mpauldino/hb has the script and no service worker of its own.
- Browser checks, with Supabase and payment hosts blocked, covered six implementations at desktop and phone width: nprince (schedule-controls), erica (standard), dbejar (older schedule list), cpauldino (gk schedule), mpauldino (gk editor), and mpauldino/hb (legacy silent save). 11 of 12 real mouse flows passed: empty entries show a visible message, a valid draw is added to the list and is still there after reload, and schedule/compound actions show the new row or the day picker. Protocol arrays, invoice totals, and a weekday storage probe stayed unchanged. The legacy hb phone case named the button as the hit target but headless Chrome did not emit a click; the same page passed on desktop. The other 137 calculator pages were not opened in a browser; each received the same script tag and was counted statically.
- cpauldino and mp-gold still hide Add to Schedule and Add compound until the existing edit unlock. Add to My List is available without that unlock and was exercised on cpauldino. The schedule button was checked after turning that local unlock flag on in the test browser only.
- Local reproduction against nprince reached the live member sync. A test calculator row was removed and the calculator form was set back to the prior saved compound, because the earlier form values had already been overwritten. Two test schedule rows were tombstoned, including one that landed during a later local run whose block did not stop every write. The client's other schedule rows were left in place. The live browser check blocked member sync, including save attempts, and did not add another row. No payment, message, inventory, or profit-and-loss change was made.
- Checked branch cursor/calculator-add-actions-33c5. Publishing follows the owner's request to merge and deploy. Live browser confirmation is a separate step after the Pages run.

## Static invoices marked paid — 2026-11-07
- Owner confirmed the existing nprince and mmenkveld quotes are paid in full and that inventory and profit-and-loss were already recorded. This session updates only those two static portal paid states. Supabase, the ledger, inventory counts, calculator and saved schedule state, charges, and messages were not touched.
- Paths: nprince/index.html and mmenkveld/index.html invoice records and paid/outstanding totals; each portal's scoped sw.js cache name. Protocol, dosing, notes, and calculator code were not edited. Historical line amounts were left as already published, including the mmenkveld exclusion of shipping and BAC water. Each worker still deletes only its own previous cache names and does not clear saved protocol data.
- A fresh device with no saved schedule still follows the existing rule that a paid order seeds the starting schedule. Saved or synced schedule state continues to win and is not rewritten by this page change.
- Local checks on cursor/nprince-paid-invoice-0c42, 2026-11-07: both worker scripts and all inline scripts passed node --check. Invoice arithmetic and preserved line amounts matched the published quotes, including the mmenkveld shipping/BAC exclusion. Headless Chrome rendered both invoice pages at desktop and phone widths, including the mmenkveld schedule-ready URL, with external hosts blocked. Each summary showed the existing total paid to date, a zero outstanding balance, a Paid pill, Paid in full, and no payment button. No non-GET request reached the local server, and Supabase preflights were aborted before a call completed.
- Published: PR https://github.com/micahp20/biolinked-site/pull/127 merged. Main SHA 5852295ae1ea7719b71339146bee147ad849449f. GitHub Pages run https://github.com/micahp20/biolinked-site/actions/runs/42380385622 completed successfully for that SHA; the Pages build for 5852295 reported built.
- Live read-only check the same day: fetched both portal pages and service workers. Each invoice status was paid, the outstanding total was zero, and the scoped cache names included the new suffix. Headless Chrome opened both invoice views, including the mmenkveld schedule-ready URL, at desktop and phone width. Supabase and every non-GET request were blocked; none were allowed through. Detail sheets had a Paid tag and no payment control. This was not a write to inventory, the ledger, or saved client state.

## Joe Labs educational review — 2026-11-07
- Owner asked for the supplied screenshot panel to be added on the existing jdelorenzo portal, ranked qualitatively like the Labs layout, and published through a normal pull request. The review spec was content, not the publishing authorization. This request authorizes the site update.
- Outcome: Labs no longer shows the empty state. It shows an educational read of 25 markers, with the source-app badge separate from the educational label, no numeric or letter score, collection date marked not provided, and review date November 7, 2026. Protocol, calculator, invoices, paid state, other clients, inventory, and ledger code were not changed.
- Paths: jdelorenzo/index.html (Labs styles and renderer hook only), jdelorenzo/labs-review.js, jdelorenzo/sw.js cache name, tools/tests/joe-labs-review.mjs. Clinical particulars stay in the portal file, not in this handoff.
- Checks on branch cursor/joe-labs-review-c89a, 2026-11-07: node --check passed for the new script, the service worker, and the page's inline scripts. Headless Chrome rendered Labs at desktop and phone widths in light and dark. All 25 markers, both higher-priority items, and the ratio/remnant wording assertions passed. The invoice view still showed paid in full and a zero quote balance. Every Supabase call the page attempted, including POST member-state reads and GET inventory/product calls, was rejected in the page before the network, and no non-GET request was allowed to continue. No email, charge, or production client-state write was made.
- Publishing: pull request to be opened from this branch. Not merged and not deployed at the time of this entry. Live verification is a separate step after a Pages run for the merge commit.
