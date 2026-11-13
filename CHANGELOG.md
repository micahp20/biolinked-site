# Changelog

Dates use America/Denver. Recovered entries describe repository evidence, not work performed by the memory-setup session. This is a selected history, not an exhaustive reconstruction.

## 2026-11-13 — Every compound explanation brought to full standard
- Owner: bring the remaining /protocol-copy.js entries up to the PR #196 standard. The other 36 definitions (Cortagen, Cartalax, KLOW, GLOW, Wolverine, CJC/Ipamorelin, Tesamorelin, Semax, Selank, SS-31, PT-141, etc.) are now 2–3 plain-English sentences: what it is, what it is used/studied for, and how strong the evidence is. No doses. Same keys, regexes, labels, roles and groups. All 58 entries now meet the standard.
- Scan: every compound name in every client page's schedule seed and calculator lists (144 pages), BL_DOSING, and the saved schedules (read-only SELECTs on public and app_private member_state) resolves to an entry. Only unmatched names are deleted test rows (ZZTestPeptide, Test Draw, demo). No page, seed, storage key or client data touched; pages pick up the shared file through its 10-minute cache.

## 2026-11-12 — Full "What this compound is" explanations (mpauldino and all schedule pages)
- Owner: mpauldino's schedule showed one-word explanations (Vilon said only "Bioregulator"). Shared /protocol-copy.js now has a Vilon entry and 2–3 sentence plain-English definitions (what it is + what it is used/studied for, no doses) for every compound on mpauldino's seed and saved schedule: Testosterone/TRT, Tirzepatide, HGH, BPC-157, Dihexa, HCG, DSIP, KPV, Ipamorelin, MOTS-c, 5-Amino-1MQ, Melanotan, Retatrutide, Vesugen, Epitalon, Pinealon, Vilon, AHK-Cu, NAD+, Glutathione, SLU-PP-332, Mazdutide. Same keys, roles and groups. mpauldino loads protocol-copy.js?v=2 and its cache is -explain1. No dose, schedule, seed, storage-key or client-data change. Saved schedule read read-only only.

## 2026-11-12 — Tesamorelin Mon–Fri on creidle, dholm, dianamaes
- Owner: "Tesa should always be M-F." Tesamorelin moved from daily to Mon–Fri on creidle, dholm (both vials) and dianamaes: protocol cards, schedule defaults and notes. Same dose, draw and time of day. Saved-schedule keys unchanged; page caches bumped (-tesamf1). Standing rule recorded in PROJECT_STATUS.md.

## 2026-11-12 — Elvira Larrea Castro: Tesamorelin Mon–Fri
- Owner (per prescriber): Tesamorelin is Monday–Friday, not daily. elarrea-castro card, calculator list, schedule default and cycle explainer now say Mon–Fri AM, 1 mg (10u). Master Dosing and Master Cycles sheets updated the same way. Quote unchanged (sheet still says 2 vials, $279.98). Schedule storage key and protocol revision deliberately NOT bumped, so the owner's own saved edit on her schedule is kept. Cache elarrea-castro-tesamf-v3-20261112. No other client page touched.

## 2026-11-12 — Elvira Larrea Castro: NAD+ removed
- Owner request ("Remove NAD"): NAD+ 1000 mg is off elarrea-castro entirely (protocol card, schedule seed, calculator list, notes, cycle explainer, quote). Quote · Order 1 is now $279.98: Retatrutide $50, Tesamorelin 2 × $60, MOTS-c $50, Cagrilintide $40, BAC Water 30 mL $9.99 (12 mL recon), shipping $9.99. Schedule store bumped to gk-v2 / rev 2 so any saved copy reseeds; cache elarrea-castro-nonad-v2-20261112. No ledger or inventory write.

## 2026-11-12 — New client portal: Elvira Larrea Castro (/elarrea-castro/)
- Owner request: build Elvira's protocol in the mpauldino layout, Cycle 1 Fat Loss only, plus Cagrilintide. New folder elarrea-castro/ (index.html, manifest.json, sw.js) built from the current shared-schedule portal shell (tlefree/index.html, same shell as the other 140 portals), with the bio-age include from the lab pages. Only the page data lines differ.
- Cycle 1 is the saved Fat Loss goal cycle (The Shred Protocol) from the master sheet: Retatrutide 30 mg ×1, Tesamorelin 20 mg ×2, MOTS-c 40 mg ×1, NAD+ 1000 mg ×2, plus Cagrilintide 10 mg ×1. Vial, recon, dose, draw and timing come from Master Dosing / Master Cycles; Cagrilintide has no timing on the sheet, so its Monday AM slot is copied from mdowland.
- One open Quote (not an invoice) at master sell prices plus BAC Water 30 mL $9.99 and 2-Day UPS $9.99; total $379.98. PAID 0. No ledger or inventory write. Schedule default turns on all Cycle 1 compounds (quotes do not gate it). No bloodwork, so Labs shows the standard empty state.
- Registered on /share/ and /protocols/. Root sw.js cache name ends in -elarrea1. See PROJECT_STATUS.md.

## 2026-11-12 — Add to Home Screen nudge and Easy reading card on every client portal
- Owner-approved rollout of the two mpauldino-only extras. New shared /portal-extras.css and /portal-extras.js. 140 client pages gain two tags at the end (CSS + JS); mpauldino and cpauldino, which already had both features, gain only the CSS line. No other byte of any index.html changed (byte-verified for all 142). Every touched sw.js cache name ends in -extras1.
- Nudge: the page's existing #a2hs element moves to the top of the scroller and uses mpauldino's wording and styling; it shows outside an installed app until dismissed. The dismissal uses each page's existing KP+'a2hs' key.
- Easy reading: Nutrition gets mpauldino's "Easy reading · same setting as Workout" card above the research-use note. Bigger text / High contrast apply to Nutrition and Workout. Stored only on this device under the client's own prefix (KP+'easyread'), so pages never share it and nothing syncs to the backend.
- Layout fixes in the shared CSS: on desktop the nudge clears the fixed header (was tucked 2px under it, mpauldino included); the Nutrition "numbers" row no longer pushes the page sideways at 320px (pre-existing on every page). See PROJECT_STATUS.md.

## 2026-11-12 — ejirikils and cpauldino protocol view now matches mpauldino
- Owner report: ejirikils' Protocol page did not look like mpauldino. Root cause: mpauldino draws its Protocol view with mpauldino/protocol-layout.js (inline compound cards grouped under section headings, notes in a closed "About this protocol" panel). 139 client pages draw the same card layout inline. ejirikils and cpauldino still drew the older collapsed "About This Protocol" group tiles (cgrp) because their pages carry ABOUT_GROUPS and nothing replaced the old renderer. Earlier audits only checked asset tags, overlap and errors, never the rendered structure.
- Added a shared /protocol-layout.js (mpauldino's renderer, generalized to honor each page's own group rules: name lists, "rest" and tag). ejirikils/index.html and cpauldino/index.html each gain one script tag at the end; no other byte changed. sw.js cache names end in -layout1. mpauldino was not edited.
- Checks: a rendered 142-page structural audit against mpauldino found only these two pages on the old renderer. Before/after headless Chrome comparison of both pages: Schedule, Invoice, Labs, Nutrition, Workout and More text identical; Protocol group membership identical; every card's recon, schedule, dose/draw and site equal the page's own ALL data; notes text identical. See PROJECT_STATUS.md.

## 2026-11-10 — Public pages can scroll back up on iPhone
- Removed the phone-width `overflow-x: clip` / `hidden` lock on the public document and the compositing layer on the fixed header. The header stays `position: fixed` with the existing notch offset. Shared CSS is now `bl-theme.css?v=45` and `public-gold.css?v=7`. Client protocol shells were not rewritten. Headless Chrome confirmed the document scrolls and the first heading clears the bar; it cannot reproduce the iOS gesture itself. Commit c5e81316 on origin branch cursor/ios-public-scroll-5684. Pull request creation was rejected because the GitHub identity is not a collaborator. Not merged. Not deployed. See PROJECT_STATUS.md.

## 2026-11-10 — Tayla Henry Order 2 is paid
- thenry only: Order 2 is paid at $119.98 (Retatrutide 60 mg, BAC Water 30 mL at $9.99, shipping $9.99). Paid to date is $219.98 and due is $0. Paid Order 1 and the Monday 1.4 mg / 7u / 3 mL protocol are unchanged. No ledger or inventory write. Cache thenry-order2-paid-v1-20261110. Commit bdf2e894 on branch cursor/thenry-order2-paid-9ebe. Not merged. Not deployed. See PROJECT_STATUS.md.

## 2026-11-10 — Tayla Henry open quote for Retatrutide 60 mg
- thenry only: Order 2 quote $119.98 (Retatrutide 60 mg, BAC Water 30 mL at $9.99, shipping $9.99). Paid Order 1 unchanged. Active draw is 60 mg / 3 mL / 7u / 1.4 mg Monday AM, and the unit ladder is converted so the milligram steps stay the same. Cache thenry-reta60-v1-20261110. Commit 1e7253a3 on branch cursor/thenry-reta60-quote-c79a. Not merged. Not deployed.

## 2026-11-10 — Annaleah quote is Retatrutide and KLOW only
- Replaced the open Cycle 1 quote on annaleah with Retatrutide 30 mg × 1 at $50, KLOW 80 mg × 2 at $60, BAC water 10 mL × 1 at $4.99, and 2-Day UPS at $9.99. Total $184.98. Status stays quote. Paid is 0 and due is 184.98.
- Retatrutide dosing is unchanged. KLOW is the catalog Monday / Wednesday / Friday evening dose, 4 mg, 15 units, 3 mL. Tesamorelin, MOTS-c, NAD+, KPV, and Cagrilintide are off her protocol and her page calculator list. No ledger, inventory, or other client page. Cache name is annaleah-reta-klow-v1-20261110.
- Checks: line cents, node --check, and headless Chrome at desktop and phone width in light and dark, with non-GET requests blocked. Commit a54d3883 is on origin branch cursor/annaleah-reta-klow-quote-e201. Pull request creation was rejected because the GitHub identity is not a collaborator. Not merged. Not deployed. See PROJECT_STATUS.md.

## 2026-11-09 — jsanders and kwells moved into current-layout client portals
- With the owner's approval, the two standalone legacy protocol pages became folder portals at /jsanders/ and /kwells/. Each was built from dcoone/index.html and has its own manifest.json and a scoped sw.js.
- Compounds, vial strengths, doses, draw units, BAC volumes, schedules, timing and invoice lines were copied by hand from the old pages. A script then checked each one against the old page text. Original explanations, reconstitution steps, weekly schedules, storage and monitoring notes are kept in each compound's notes and on the Notes cards.
- Neither old page stated a payment, so PAID and DUE are 0 and each invoice is a Quote.
- jsanders.html and kwells.html now redirect to the new folders. Both Share entries now point to the folder URLs. See PROJECT_STATUS.md for values that need owner review.

## 2026-11-09 — rhurst and dbejar moved to the current portal layout
- Root cause: the Nov 4 fleet migration to the master layout (pilot 98c5474 plus batches 19e9c89–8c807c8) never included rhurst or dbejar. Later sitewide passes (#136, #140, #141) only added shared scripts and styles to every page, so asset-tag checks passed while these two pages kept the older shell.
- Rebuilt both from dcoone/index.html, the current template, the same way the fleet pages were. The client data lines were carried over exactly: compounds, notes, invoices, PAID/DUE, labs, storage keys and slug. The dbejar cycle explainer keeps its own groupings, which are copied from that page's existing CYCABOUT member lists. Its schedule behavior did not change.
- sw.js for each page now uses the scoped fleet worker with a new cache name, so installed phones pick up the new layout.
- Not converted: jsanders.html and kwells.html are standalone legacy documents that the converter gate rejects (no extractable compounds or invoices). mp-gold, sample, workout-demo and the hub pages are not client protocols. See PROJECT_STATUS.md.

## 2026-11-09 — Mike McCarthy add-on is paid and on the protocol
- Marked the $219.98 Wolverine + KLOW + Cartalax quote paid on mmccarthy. Paid to date is $1,769.91 and the quoted balance is $0.00. Earlier paid orders were not rewritten. The unsold optional add-on block is off the invoice and the protocol.
- The Wolverine card is the standard 10 mg BPC-157/TB-500 vial, with the original saved 1 mg / 20 unit / 2 mL directions. KLOW 80 mg is an active Prime Stack card using the directions already on that page. Cartalax 20 mg stays 1 mg daily for a 20-day course. No ledger or stock write.
- Commit ddfd6050 is on branch cursor/mmccarthy-paid-addon-472b. Pull request creation was rejected because the GitHub identity is not a collaborator. Not merged. Not deployed. See PROJECT_STATUS.md.

## 2026-11-09 — mpauldino labs scoring expanded to earlier draws
- Scored 13 markers that had been displayed but excluded: the differential percentages and calculated average glucose from the November 2026 panel, and seven hormone, vitamin and lipid-ratio results carried over from earlier draws. Added a small Vitamins domain. Removed the now-empty earlier-results section; the not-scored section keeps only an unreported ratio and a duplicate analyte.
- Each carried-over marker names its draw date in its own note, so the mixed timepoints are transparent. One out-of-range marker is explained as the expected effect of ongoing therapy and a monitoring point while still scoring 1 under the existing rule.
- Score recomputed by the file's own tally from 95 to 94 of 100 as the scored count grew from 50 to 63. Paths: mpauldino/labs-nov2026.js, mpauldino/sw.js and tools/tests/mpauldino-labs-nov2026.mjs. No protocol, invoice, paid/due, ledger or stock change.
- Commits 8f799a46 and 489f49a3 on main. The first Pages run built the artifact but its deploy job timed out and published nothing; the second commit forced a fresh run that succeeded.
- Checks: node --check on both scripts, the labs file executed with its in-file guard passing, and the harness's pure-JavaScript assertions. The harness's headless-Chrome half could not run in this environment. Deployed and verified live byte-identical to origin. Two scoring decisions are left open for the owner; see PROJECT_STATUS.md.
- Also recorded in PROJECT_STATUS.md: two of four Pages deploys on this date failed in the hosting platform's publish step while the builds themselves succeeded.

## 2026-11-09 — mpauldino labs re-graded on functional ranges
- Re-graded the November 2026 panel scoring on one portal: 33 in-range markers promoted from the in-range helper to the optimal helper, five markers held and the two laboratory flags left as they were, per owner instruction. Score recomputed by the file's own tally from 78 to 95 of 100.
- Paths: mpauldino/labs-nov2026.js, mpauldino/sw.js and tools/tests/mpauldino-labs-nov2026.mjs. No protocol, invoice, paid/due, ledger or stock change.
- Commits 008ce1f8 and 528e4faf on main. The first Pages run built the artifact but its deploy job timed out in syncing_files and published nothing; the second commit forced a fresh run that succeeded.
- Checks: node --check on both scripts, the labs file executed with its in-file guard passing, and the harness's pure-JavaScript assertions. The harness's headless-Chrome half could not run in this environment. Deployed and verified live byte-identical to origin. See PROJECT_STATUS.md for the wording changes flagged for owner review.

## 2026-11-05 — Permanent project memory setup
- Added root AGENTS.md with mandatory session startup, dependency protection, existing design/functionality requirements, verification rules and honest publishing reports.
- Added PROJECT_STATUS.md with source-backed recovery, project structure, outstanding questions and next-session instructions.
- Added this changelog; future significant website changes must update both status and history.
- Documentation-only branch docs/project-memory-2026-11-05; no website code changes, merge into main or deployment requested. See the branch commit and draft PR for actual delivery evidence.

## 2026-11-05 — Recovered: intake and public tools
- Added full-waiver promo-code flow to both intake entry points with separate zero-paid metadata; preserved paid Stripe path and legal gate. PR #123; 0bd7f71.
- Changed paid intake to $19.99, described the $20 stack credit and added four portal preview cards. PR #120; 78b9080. This supersedes the earlier $49.99 cover.
- Recorded republish attempts for stale intake output despite Pages build success. PRs #121–122; 6a6dd65 and e50f654. Live resolution not independently verified in this setup.
- Added pay-first cover and package benefits; removed Intake from public navigation/footer; added Stack Analyzer timeout and button recovery. PRs #117–119; 34abdf3, 5929646 and 9dfe329.
- Recorded client quote/profile/billing-display and client-supplied schedule corrections in main; individual details remain in the source/commit history.
- Fixed a client free-invoice schedule initialization and isolated client service-worker cache cleanup. PR #116; 2b958d4.

## 2026-11-04 — Recovered: portal layout and shared controls
- Migrated client portals to the shared layout while retaining individual content, billing, special states and storage identity. Examples: 19157b1, 03d47e3, 13d877a and following migration commits.
- Added quote payment buttons, calculator compound-name recovery and read-only schedule expansion, followed by preservation-gated client batches. 73b90fc, 89b714c, f76e27f and batch commits.
- Added/corrected a client portal with shared Erica stylesheet reference and client-only cache cleanup. PRs #114–115; 981d821 and a9dd6f0.
- Additional client quotes, invoice status changes and protocol corrections were committed; consult history for exact data and authority. No financial or clinical action is inferred from a commit alone.

## Future entry template
### YYYY-MM-DD — Short business outcome
- Request and resulting behavior.
- Main paths and commit/PR evidence.
- Checks actually performed and any limits.
- Commit/remote branch/merge/deployment status; link PROJECT_STATUS.md for remaining work.

## 2026-11-05 — Owner workflow preferences (2026-11-06 UTC)
- Saved in AGENTS.md: include each new protocol in /share/ and confirm proposed inventory deductions with the owner first.
- Documentation-only changes saved on main; no application behavior or inventory changes. See PROJECT_STATUS.md for scope and verification limits.

## 2026-11-05 — Single-portal schedule pilot (2026-11-06 UTC)
- Added current-cycle controls, transition preview, Undo/history, foundation-only phase, unique compound count and client editing/pause/restore on the existing mmoritz/ portal.
- Personal additions and ongoing compounds persist between cycles; cycle state uses existing versioned schedule sync. Preserved billing and scoped offline caching.
- Syntax, browser smoke and model checks passed; full device regression coverage remains limited. Deployment explicitly authorized for this portal only; see PROJECT_STATUS.md for release verification and rollout limits.

## 2026-11-05 — Existing portal quote revision (2026-11-06 UTC)
- Reduced the nprince/ quote to the selected compound, one BAC water vial and shipping; retained quote status and updated the scoped cache.
- Verified line-item arithmetic. No inventory or clinical/schedule changes; release verification is separate from saved source.

## 2026-11-05 — Quote add-on (2026-11-06 UTC)
- Added requested Cagrilintide add-on to nprince/ quote. Existing protocol entry and quote-only state retained; no inventory or scheduling changes. Verified arithmetic and updated scoped cache.

## 2026-11-05 — Correct protocol to match selected quote (2026-11-06 UTC)
- Removed obsolete compounds from the nprince/ protocol and notes, corrected the selected vial strength and corresponding syringe conversion without changing the existing dose/timing, and preserved the quote.
- Verified rendered cards, data invariants, dose arithmetic and inline script syntax. No inventory movement; scoped cache refreshed.

## 2026-11-06 — Client explanations and second cycle pilot
- Extended the accepted cycle manager only to arasche/, preserving its identity and existing clinical/billing data.
- Added plain compound definitions and role-based cycle explanations across 146 current and legacy protocol pages; retained operational notes under an expandable heading. Qualified unproven research combinations and kept dosing facts separate.
- Verified per-page data preservation, all changed inline/worker syntax, standard rendering and the second pilot's model. Scoped cache updates included; no inventory or live schedule-state mutations. See PROJECT_STATUS.md for verification limits and release baseline.

## 2026-11-06 — New client quote portal
- Added mmenkveld/ with its own identity, scoped PWA/cache and storage keys, and registered it on share/.
- Used the requested two-line quote without excluded charges; unconfirmed dosing remains visibly pending. Kept quote/inventory/payment states separate and cleared inherited client data.
- Syntax, data-isolation and quote checks passed. See PROJECT_STATUS.md for missing instructions and publishing state.

## 2026-11-06 — Confirm weekday-evening schedule
- Updated CJC/IPA days/time on mmenkveld/ from pending to the owner's confirmed weekdays/evenings. Other unconfirmed dosing remains pending; billing and inventory unchanged.

## 2026-11-06 — Quote quantity reduction
- Updated mmenkveld/ to the owner's revised two-vials-per-blend quantities, preserving unit pricing, schedules and pending instructions. Quote arithmetic verified; no inventory changes. Scoped cache refreshed.

## 2026-11-06 — Complete client dosing and schedule
- Completed mmenkveld/ dosing from the owner's instructions, checked the existing CJC/IPA master guide, expanded plain-language explanations and enabled the requested schedule defaults/calculator entries.
- Verified syntax, dose arithmetic and daily schedule membership. Quote retained; inventory unchanged. Synced-state confirmation follows deployment.


## 2026-11-06 — Mobile operations presentation
- Added scoped phone cards, bottom tabs, sortable lists and touch-friendly forms to profit-loss.html using the established public typography/palette. Accounting scripts preserved exactly; no production record changes.
- Syntax and DOM interaction checks passed; visual Chromium verification remains blocked by sandbox permissions. See PROJECT_STATUS.md for limits and the ongoing protocol control audit.

## 2026-11-06 — Preserve calculator edits and schedule choices
- Audited current portal controls and applicable older layouts. Fixed calculator saved units/counts, edit/reopen persistence, invalid-capacity saves, empty schedules and recon context; preserved all per-client protocol/billing data and namespaces.
- Updated only each affected portal and its scoped cache version. Mock DOM/model checks passed across all modified pages, advanced schedule variants and both pilots. No production record writes; rendered/live verification remains incomplete. See tools/tests/protocol-controls-audit-2026-11-06.md and PROJECT_STATUS.md.

## 2026-11-06 — Align personal portal with shared client design
- Applied shared visual tokens to the existing mpauldino/ schedule without replacing its supplement-aware engine; added vitamins/supplements navigation and consistent display/app naming.
- Preserved all existing protocol, supplement, lab, billing, notes and storage data. Mock-DOM flows and syntax/data-preservation checks passed; rendered browser verification remains unavailable. See PROJECT_STATUS.md for deployment evidence and limits.

## 2026-11-06 — Reduce personal protocol text size
- Responded to phone screenshot feedback by shrinking mpauldino/ Schedule and welcome typography, supplement rows and card spacing. Clinical data and scripts unchanged; bumped only the local stylesheet/cache versions. See PROJECT_STATUS.md for verification limits.

## 2026-11-06 — Personal schedule editing pilot
- Made mpauldino/ compound rows expand to a definition and staged dose/day/timing editor with remove/restore. Master-list and manual additions use the same editor. Kept the compact styling and supplement tools.
- Preserved static client data and existing permissions/save path; added optional recon metadata without database changes. DOM/model tests, read-only save-contract validation and syntax checks passed. Rendered/live browser checks remain unverified. See PROJECT_STATUS.md and tools/tests/personal-schedule-editor-2026-11-06.md.

## 2026-11-06 — Correct personal layout and remove unlock; repair saved schedule controls
- Replaced the personal Protocol/Schedule layouts with shared card/list structures and removed its frontend unlock requirement while preserving supplement tools and backend authorization.
- Fixed default/added editing/removal on nprince/ and calculator-to-schedule context on both pages. Native Chromium flows passed, including a saved manual-entry fixture, phone/desktop light/dark layouts, and reload/removal persistence. Fixed banner interception and hidden-sheet horizontal scrolling found during browser review.
- Static clinical/billing/identity data preserved; no inventory or production state writes. See PROJECT_STATUS.md and tools/tests/schedule-controls-repair-2026-11-06.md.

## 2026-11-06 — Calculator add buttons show a result or a reason
- Add to My List, Add to my schedule, and Add compound now bring the new row or a plain-language error into view, with a toast, on every calculator protocol page. Incomplete draws and a missing weekday no longer fail silently. The install banner no longer covers the buttons. Doses, weekday overrides, invoices, and saved lists are unchanged.
- Shared script calc-feedback.js on 143 pages; 142 portal cache names updated. Browser evidence is in PROJECT_STATUS.md. One legacy phone case did not receive a headless click. Test rows written to the nprince member sync during local checks were removed or tombstoned.

## 2026-11-06 — Complete older banner mount correction
- Moved nprince/ installation help into the scroll flow and bumped its script/cache versions. The complete real-browser Schedule/Calculator regression passed again. See PROJECT_STATUS.md for evidence and limits.

## 2026-11-07 — Existing portal invoices marked paid
- Marked the current nprince and mmenkveld invoices paid in full on the static pages after the owner confirmed payment and that inventory and profit-and-loss were already recorded.
- Preserved the published line amounts, including the mmenkveld exclusion of shipping and BAC water. Left protocol, dosing, and calculator code unchanged. Refreshed only each portal's scoped cache name. No database, ledger, inventory, charge, or message action in this change.
- See PROJECT_STATUS.md for checks and publishing status. Merged in PR #127 at 5852295ae1ea7719b71339146bee147ad849449f. Pages run 42380385622 succeeded for that SHA, and a blocked-network live read of both invoice pages matched the paid state.

## 2026-11-07 — Educational Labs review on one existing portal
- Added a qualitative Labs walkthrough for the existing jdelorenzo portal from the supplied screenshot panel. Twenty-five markers are grouped, each with the source-app badge separate from an educational label. There is no overall numeric or letter score. Collection date is shown as not provided. The review date is November 7, 2026.
- Protocol, dosing, calculator, invoices, and paid state on that portal were left as already published. Other clients, inventory, and the ledger were not edited. The portal cache name was refreshed so an installed copy can pick up the page.
- Local blocked-network browser checks passed at desktop and phone size. Opened as PR #129 on cursor/joe-labs-review-c89a. Not merged in this session. See PROJECT_STATUS.md.

## 2026-11-07 — Joe Labs uses the shared score card
- Replaced the separate source-app and educational-read cards on jdelorenzo with the existing portal Labs score card, domain chips, and lean rows. The displayed tally is a provisional source-app rating, 73/100 from 24 of 25 markers. Albumin stays unscored because its badge was cropped. Protocol and the paid invoice were not changed.
- See PROJECT_STATUS.md for the score basis, checks, and pull-request state.


## 2026-11-07 — Additional quote on an existing protocol
- Added the requested separate quote to bdelorenzo/ while retaining the paid order, protocol and schedule. Updated the displayed quote balance and only that portal's cache version. No inventory or ledger action.
- Source/data-preservation, arithmetic, syntax and isolated invoice-renderer checks passed; rendered browser check was blocked by the Chromium sandbox. Saved on main in a8f72ce and 1152834. See PROJECT_STATUS.md for release status and verification limits.


## 2026-11-07 — Remember standard quote charges
- Saved the owner's recurring shipping and one-BAC-water pricing rule in AGENTS.md and applied it once to the existing additional quote on bdelorenzo/. Preserved the earlier paid order and all protocol/schedule data; no inventory or ledger changes.
- Arithmetic, isolated renderer and source-preservation checks passed. Saved to main; see PROJECT_STATUS.md for commit references and publishing limits.


## 2026-11-07 — Annaleah portal from the supplied master sheets
- Removed the earlier pending section from the jcress portal so Jamie’s page matches the published baseline. Added a separate /annaleah/ portal for Annaleah, with no surname and no copied Jamie billing, protocol history, labs, or storage identity.
- The new page transcribes the supplied Cycle 1 reference and two add-on rows, including source dose, draw, timing, and prescriber notes. The schedule is not activated. The invoice is quote pending, without prices or a paid flag. Branch cursor/jcress-cycle1-request-8977 at 9af4d3b395746e8a9764236b8d9dbb18f8491b77. The owner merged that branch as PR #131. The custom reference layout on that release was later rejected. See the layout correction.

## 2026-11-07 — Annaleah uses the same cycle cards as Jamie
- Rebuilt /annaleah/ from current main so the protocol, invoice, and navigation use the existing Jamie components. Removed the separate reference page and its extra headings. Source dose and timing stay in the cycle cards. Blank timing is not given a weekday. The quote stays unpaid and unpriced. Jamie and Paul were not edited. Branch cursor/annaleah-layout-match-8977 at 2f0407f8cb0a26de765b82fa6c01c2f3a14251de. The owner merged that branch as PR #132.

## 2026-11-07 — Annaleah invoice drops the repeated item list
- Removed the compound-and-shipping paragraph under the cycle heading on Annaleah’s invoice card and in the payment sheet. The heading, quote badge, priced rows, $434.96 total, and Pay now stay. Future new-client invoices should not repeat that list. Existing client pages were not edited.

## 2026-11-07 — Annaleah invoice drops the extra quote summary
- Removed only the standalone Quoted summary card above Annaleah’s detailed invoice. Line prices, the $434.96 total, Pay now, and the payment sheet stay. A note for future new-client invoices is in AGENTS.md. Existing client pages were not edited.

## 2026-11-07 — Annaleah quote has sell prices and expanded cards
- Filled the six Cycle 1 cards with the shared educational descriptions and the supplied dose and timing. Replaced the unpriced quote with sell prices, three charged BAC vials, and 2-Day UPS shipping. Total $434.96, still unpaid. Pay now uses the existing payment handoff. Jamie’s free BAC and paid history were not copied. See PROJECT_STATUS.md.

## 2026-11-07 — Complete quoted compound Protocol descriptions
- Corrected the invoice-only bdelorenzo/ addition by adding both quoted copper-peptide Protocol cards, descriptions and the owner's supplied recon/draw. Preserved the earlier active protocol and quote total. No active schedule or inventory change.
- Saved a permanent completeness rule in AGENTS.md. Instruction applicability/timing clarification is pending; no vial strength or converted dose was invented. Renderer, syntax and source-preservation checks passed. See PROJECT_STATUS.md for limits and publishing state.

## 2026-11-08 — Mike McCarthy optional KLOW price
- Changed the still-offered Prime Stack KLOW add-on from 2 vials at $40 ($80) to 2 vials at $60 ($120). The optional subtotal is $369.97 and the with-all-add-ons figure is $1,754.91. The paid $1,384.94 order, the $219.98 quote, and the dose were not changed.

## 2026-11-08 — Mike McCarthy add-on quote
- Added one unpaid quote on mmccarthy for standard Wolverine (BPC-157 / TB-500 10 mg) × 2 at $30, KLOW 80 mg × 2 at $60, Cartalax 20 mg × 1 at $25, one 10 mL BAC bottle at $4.99, and 2-Day UPS at $9.99. Total $219.98. Paid orders stay as written. The current protocol title dropped the “2.0” and still shows 20 mg, 1 mg, 10 units, and 2 mL. The description text was not edited. See PROJECT_STATUS.md.

## 2026-11-08 — Vial labels filled where the catalog had one size
- Added a vial size to protocol and invoice labels that had none, only when the catalog lists one size for that exact product and the same client’s page does not already record a different size. Doses, recon, timing, prices, and paid history were not changed.
- Matt Hartman’s 10 mg Wolverine, known 30 mL BAC lines, known 60 mg tirzepatide, and historical 10 mg Tesamorelin were left as recorded. Jamie Cress’s unsized Wolverine line now matches the Wolverine 2.0 · 20 mg already on his page.
- Compounds with more than one catalog size, oral capsules, standalone BPC-157 or TB-500, plain Ipamorelin, and unspecified Melanotan stay unlabeled. The remaining list is in PROJECT_STATUS.md.

## 2026-11-08 — Plan dates removed from every portal
- Removed start, end, save, cancel, clear, and Plan dates from the shared portal controls and from the remaining client protocol pages, including the older tracker and calendar pages. Remove and restore remain on the device. A previously saved start or end date no longer hides a compound. A calendar file is created only when that device already has a saved start date. No start date was invented.
- Schedule rows expand again because the control is inside the detail panel. If removal unmounts the row, the schedule keeps a restore button. Add to My List stays in the calculator store.
- Same-client records were copied onto invoice labels that were missing a vial strength, including Becky’s Order 2 BAC water at 10 mL. The $4.99 amount, paid totals, doses, and earlier orders were not changed. Compounds with no same-client strength stay unlabeled. The short list is in PROJECT_STATUS.md.
- Augustus Rasche’s Monday schedule and protocol card were checked on a computer and a phone. All 149 portal pages were rechecked at desktop and phone width with the network guard. The shared script is version 2. Not merged and not deployed.

## 2026-11-08 — Three latest add-on invoices marked paid
- Matt Hartman’s KLOW + Wolverine add-on, Ameris Hartman’s Retatrutide add-on, and Becky Delorenzo’s Order 2 are marked paid on the static pages. Earlier orders, line amounts, and clinical directions were not changed. Inventory and the ledger were not written from this change. Becky’s Order 2 labels now use the confirmed GHK-Cu 50 mg and AHK-Cu 100 mg strengths.

## 2026-11-08 — Current labs replaced on one portal
- Replaced the current bloodwork summary on mpauldino with the supplied Nov 2026 panel. The page uses the existing score card, domain chips, and tap-to-read rows. The score is the documented 4 / 3 / 1 custom wellness tally, labeled as not a diagnosis. Earlier results already stored on the page stay in a separate history section. No other client, protocol, invoice, payment, or stock data was edited.

## 2026-11-08 — Main merged into the portal plan branch
- Merged origin/main fe4939ef (PR #135, Annaleah’s source-level invoice summary removal and cache v5) into cursor/portal-plan-controls-8977 with a merge commit. Kept that Annaleah cleanup and the sitewide plan-date and invoice-summary script. No invoice amounts, paid states, or clinical text were changed in the conflict resolution.

## 2026-11-08 — Plan dates on every portal, duplicate invoice summaries removed
- Every client portal, including paid and historical invoices, now hides the repeated compound-and-price paragraph under the order heading and in the payment sheet. Order names, Paid/Quote badges, priced rows, totals, and the one-line paid/quoted balance stay. Invoice JSON is unchanged.
- Expanded protocol and schedule compounds can take a start date, an end date, and remove/restore. That choice is stored on the device for that client and cycle. It does not change the catalog, the invoice, the ledger, or inventory.
- Phone headings, program cards, and Back/Home are tightened. Gold, black, and gray stay as they are.
- See PROJECT_STATUS.md for the page count, the pages left out, the checks, and the unpublished branch.
