# Changelog

Dates use America/Denver. Recovered entries describe repository evidence, not work performed by the memory-setup session. This is a selected history, not an exhaustive reconstruction.

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


## 2026-11-07 — Additional quote on an existing protocol
- Added the requested separate quote to bdelorenzo/ while retaining the paid order, protocol and schedule. Updated the displayed quote balance and only that portal's cache version. No inventory or ledger action.
- Source/data-preservation, arithmetic, syntax and isolated invoice-renderer checks passed; rendered browser check was blocked by the Chromium sandbox. Saved on main in a8f72ce and 1152834. See PROJECT_STATUS.md for release status and verification limits.


## 2026-11-07 — Remember standard quote charges
- Saved the owner's recurring shipping and one-BAC-water pricing rule in AGENTS.md and applied it once to the existing additional quote on bdelorenzo/. Preserved the earlier paid order and all protocol/schedule data; no inventory or ledger changes.
- Arithmetic, isolated renderer and source-preservation checks passed. Saved to main; see PROJECT_STATUS.md for commit references and publishing limits.
