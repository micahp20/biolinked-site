# Bio Linked Solutions — permanent project instructions

## Start every session here
1. Read this entire file and PROJECT_STATUS.md before planning or editing. Read CHANGELOG.md for recent decisions.
2. Confirm the repository is micahp20/biolinked-site, the current branch, remote, latest commits, and working-tree changes. Fetch current history when possible; never replace someone else's uncommitted work.
3. This memory was introduced on branch docs/project-memory-2026-11-05. Until merged, use that branch or explicitly fetch these three files from it before working on main. A session using only main will not automatically receive these instructions.
4. Read relevant source files and task/PR history. Distinguish confirmed source behavior, previous authors' test reports, and behavior verified in this session.
5. Explain the intended business outcome simply. Ask only for genuinely missing business decisions; handle routine technical choices.

## Permanent memory and honest reporting
- Treat these repository files as the durable handoff, not chat memory. Do not promise automatic recall across unrelated sessions or tools.
- Never invent previous conversations, design approvals, business rules, completed work, tests, or deployments. State what could not be recovered.
- After every website change, update PROJECT_STATUS.md and CHANGELOG.md before finishing. Also record partial work, blockers, and the exact next step when interrupted.
- Status entries need: request/outcome, relevant paths, evidence/commit or PR, checks and their results, remaining work, and separate commit/push/deployment states. Record the checked branch/SHA and date. Do not call a proposal completed.
- Changelog entries use America/Denver calendar dates, summarize significant changes, and reference evidence. Mark recovered history as recovered; never imply this session performed old work.
- Keep client details, financial records, keys, private reports, and promo-code values out of these general-purpose memory files. Refer to existing paths when needed.

## Repository map
- Static HTML, CSS and vanilla JavaScript; no root package.json or checked-in general test runner was found in the baseline inspection.
- index.html is the homepage. index/index.html is the compound index; do not confuse the two.
- intake.html and intake/index.html are the two intake entry points. Keep shared behavior synchronized; preserve any intentional path differences.
- Public chrome: public-nav.js, public-gold.css, public-consistency.css/js, home-protocol.css and public-protocol.css. Inspect actual load order before editing: later styles override earlier ones.
- Shared portal styling includes erica/protocol-theme.css, bl-client-skin.css and bl-connected-path.css. Client folders contain their own index.html, manifest.json and sw.js; they hold distinct data and customizations.
- Business tools include profit-loss.html, suppliers.html, admin.html, bl-tools.js, bl-portal-shop.js, product-prices.js, dosing/calculator scripts and shared data files.
- tools/convert/ contains conversion and billing preservation helpers. assemble.py currently names dcoone/index.html as its template; older task history calls the layout Erica. Verify the current template rather than assuming these names are interchangeable.
- worker/ask-worker.js with wrangler.toml is the bls-ask Cloudflare Worker. supabase/functions/ and SQL files support backend integrations; changing website files does not prove backend changes are deployed.
- CNAME identifies biolinkedsolutions.com. GitHub Pages runs show main automatically builds and deploys. Do not substitute a different hosting system.

## Protect existing functionality
- Before overwriting, deleting, moving or regenerating a file, inspect its callers, imports, DOM IDs, inline handlers, data keys, storage keys, network calls, URL aliases, cache behavior and related pages. Search all consumers of shared assets.
- Prefer focused changes. Preserve unrelated content and business behavior. Never bulk-replace client pages from a template without a per-page comparison and preservation checks.
- Preserve invoices, paid/due/quote/free states, totals, discounts, line items, notes, historical cycles, labs, custom protocols, links and client identity. Quotes must not become sales, inventory pulls or P&L entries just because a page is generated.
- Preserve client-specific localStorage keys and backend slug/state ownership. Never reuse another client's identity or storage namespace.
- Preserve existing schedules, current/past cycle handling, calculator mappings, edit behavior, free/paid eligibility and client-supplied item behavior unless explicitly requested.
- Keep the research-use/medical disclaimers and existing legal acknowledgements. Do not invent clinical claims or alter client dosing as a side effect of a layout change.
- Respect service worker scopes: root cleanup only biolinked-root-*; each client cleanup only its own cache prefix. Preserve manifest paths and shared theme references. Update relevant cache versions only when the actual change requires it.

## Design baseline to preserve
These requirements are recovered from source and merged task records, not a complete recovered design conversation.
- Preserve the existing Bio Linked identity and BL hexagon mark, gold accents, Cormorant Garamond display headings and Montserrat body/navigation text.
- Follow the current page's full stylesheet cascade and theme variables. Public gold base styles are supplemented by protocol/consistency styles; do not flatten them into a new visual theme.
- Preserve working light/dark treatments where supported, readable text and button contrast, rounded cards, consistent portal tiles, and existing public/client/admin styling boundaries.
- Preserve mobile layouts, touch targets, keyboard access, visible focus, labels, reduced-motion behavior and iOS fixed-header/safe-area fixes. Keep content clear of fixed navigation.
- Intake remains reachable by direct URL but absent from public navigation/footer unless the owner requests otherwise.
- Preserve the current $19.99 paid intake and $20 stack-credit copy, seven value hooks, four portal preview cards, and legal acknowledgement before questions.
- Preserve the distinction between paid intake and a full promo waiver: waived submissions record zero paid and must not claim Stripe payment, checkout session or $20 paid credit. Blank/invalid codes must not unlock intake. Do not expose or document the actual waiver code.

## Development and verification
- Review the relevant dependency paths first, then edit the smallest necessary scope. Do not introduce a framework/build system for routine static-site changes.
- Choose checks that cover the changed behavior. For JavaScript, run node --check on changed scripts and extracted inline scripts when available. Check HTML structure, local asset references, URL aliases and relevant data invariants.
- For UI changes, test the affected flow at desktop and phone widths, light/dark where supported, fresh and existing browser storage, and check console/network errors.
- For intake changes, check both URLs; unpaid cover, blank/invalid/full waiver, Enter/Apply behavior, paid-return flow, legal gate, submission metadata and failure recovery. Mock payments/submissions or use a test environment; do not charge, submit real client data, or alter production records as a test.
- For portal changes, reconcile invoice data and totals before/after, check active cycles, Today/schedule, calculator, edit mode, historical links, client identity and storage isolation. Use tools/convert/gate.py and billing reconciliation when appropriate, but inspect before running: run_wave.py writes pages and references a previous machine's scratch path.
- For shared files, check representative consumers and every changed client page's preserved data. Never claim a full-site regression test from one successful page.
- For documentation-only work, verify links/content, inspect the complete diff, and confirm all non-document blobs are unchanged. App runtime tests are unnecessary when no executable files change.
- Record checks that failed or could not run. A syntax check does not establish correct behavior.

## Commit, push and deployment
- Confirm authorization and hosting triggers before writing the publishing branch. A documentation commit to main can still trigger Pages.
- For this memory setup the owner explicitly prohibited live-site changes: documentation branch only, no merge into main, no deployment commands, no workflow reruns, no hosting/configuration changes.
- Use a documentation-only draft PR to make this handoff visible without merging it. Do not enable auto-merge.
- Future website requests do not erase an explicit no-deployment constraint. Follow the authorization for that session; if publishing is not authorized, leave a reviewable branch/PR.
- Before committing, inspect the diff for unintended functionality, data, secret or generated-file changes. Preserve concurrent work and avoid force-pushing.
- Confirm commit SHA and remote branch contents after pushing or creating a commit through GitHub. GitHub API commits stored on a remote branch count as committed and saved remotely; do not claim a local git push ran.
- Report separately: committed (SHA), saved remotely (branch), merged (yes/no), deployed (verified/not deployed/unknown).
- Deployment verification requires the hosting run's branch/SHA and result plus a read-only check of the relevant live behavior/content when possible. Past Pages runs reported success while older intake content was still served (PRs #121–122). If live verification is unavailable, say so.
- Finish with a short business-language summary of the outcome, checks, remaining issues and publishing status.

## Owner workflow preferences — confirmed 2026-11-06
- Whenever a new client protocol is created, add its correct name and URL to https://biolinkedsolutions.com/share/ as part of the same task. Inspect the current Share page implementation first, avoid duplicate entries, preserve its existing access behavior, and verify the new protocol link.
- Before deducting inventory, show the owner the proposed items and quantities and obtain confirmation. Read-only inventory checks are allowed; do not infer permission to deduct from creating a protocol or marking an invoice paid.

- As of 2026-11-18, the owner prefers routine, requested edits to existing Bio Linked Solutions pages to go live via the established GitHub Pages workflow without an extra conversational confirmation. Honor any task-specific publishing limits and applicable approval requirements.
- For quotes with an owner-confirmed supply duration, show that duration above the cycle name in both the invoice list and detail. Keep duration specific to the quote and preserve the line items and billing state.

## Standard quote and order charges — owner confirmed 2026-11-07
- Always include one Shipping line at $9.99 and one BAC water at $4.99 on each new quote/order, unless the owner explicitly overrides that charge for the specific request.
- Include both charges in the displayed invoice total. Apply each once per order, not once per compound, and avoid duplicate lines when updating an existing quote.
- On client invoices, do not add a second top Quoted summary card above the detailed invoice, and do not repeat the product list in a paragraph under the invoice heading, including paid history. The heading, status badge, itemized rows, and total are enough. Leave existing client pages as they are unless that page is the one being edited.
- Do not put start dates, end dates, or a Plan dates control on protocol or schedule cards. A client may remove and restore a compound on that device only. Saved dates must not hide a compound. Do not invent a dose or write a client-added compound into the catalog, invoice, or another client's record.
- Preserve historical paid invoices; do not retroactively change settled orders. Quoted charges do not authorize inventory deductions or a sale/ledger entry.

## Protocol additions must be complete — owner correction 2026-11-07
- When the owner adds compounds to a client's protocol or quote, update the client-facing Protocol entries and plain-language descriptions as well as the invoice. An invoice-only edit is incomplete unless explicitly requested.
- Verify the actual Protocol renderer contains each added compound, an accurate description and all owner-confirmed recon/draw instructions. Keep the calculator's client entries consistent where applicable.
- Record the owner's supplied instructions without inventing vial strength, dose conversion, route, weekday frequency or AM/PM timing. Clarify missing applicability/timing; do not turn proposed quote items into an active schedule or change existing treatment instructions implicitly.
- Every compound on a protocol card and every compound line on an invoice must show the vial size or strength with its unit, such as mg, mcg, IU, or mL, separate from the per-dose amount. Use only a strength already recorded for that client or explicitly confirmed for that order. If the source does not give a strength, leave it unmarked and report it for resolution. Do not infer a strength from the price or the product name, copy another client's strength, or invent a reconstitution or dose.
- Preserve earlier paid orders, clinical history, saved schedules and inventory. Permanent memory stores this workflow rule; client-specific instructions stay in the portal and its task record.


## Saved cycle name — owner supplied 2026-11-18
- “Holy Trinity” is the owner's name for a proposed grouping of TRT (testosterone), retatrutide and HGH (somatropin). This records a name and compound grouping only, not a validated safe cycle, prescription, standard dose or recommendation.
- Do not copy another client's doses, injection instructions, annual quantities or pricing into a new client's plan by this name. Confirm client-specific clinical instructions and commercial quantities. Retatrutide is investigational; a muscle-gain goal alone does not establish an indication for this grouping. Keep unconfirmed treatment as a clinician-review draft rather than activating a schedule.


## Saved master-sheet locations — verified 2026-11-18
- Master Cycles: https://docs.google.com/spreadsheets/d/1VuSp4WiGl3wvGTEb8fdU6UUlxwukF8A5rlLKyC30YdY/edit — native sheet tab Untitled, sheetId 841105339.
- Master Dosing: https://docs.google.com/spreadsheets/d/1g1csit5UKXTAKY8IQiGaAdTmfqH1oi9E4pA_v8aM-Rw/edit — native sheet tab Untitled, sheetId 284623520.
- Search these connected sources before asking the owner to resend them. Read current metadata/ranges; do not assume a generic master row is a client-specific prescription. Preserve missing timing as missing and surface contradictory entries rather than choosing one silently.

## Card payments carry a 3% fee — owner confirmed 2026-11-19
- Every Stripe card Payment Link on a client page must charge the base amount x 1.03, rounded to the cent. Name the link like the base link plus " incl. 3% card fee"; keep the same redirect back to the client's page; put base amount, fee and client in the link metadata.
- The page keeps the invoice total and the Venmo / Cash App / Zelle amounts at the base amount. Only the card button shows the higher amount, with a small note under it: `<div class="cardfee-note" style="width:100%;text-align:center;font-size:11px;opacity:.7;margin:-4px 0 2px">includes 3% card fee</div>`.
- No shared template currently emits card buttons: each page that has one hard-codes it in its own `payButtons()` (see rgreen and vbernal-quintana). Copy that pattern and the fee note when a new card button is added.
- Deactivate the superseded link only after the page is live. Links for amounts already paid are left alone. The $19.99 intake link is a flat intake fee and is not a quote payment.
