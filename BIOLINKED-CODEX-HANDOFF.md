# BioLinked — Codex website handoff

Public-safe adaptation of the owner's Claude handoff, received 2026-11-05 (America/Denver). The original contains private operating information and is intentionally not reproduced in this public repository.

## Authority and startup
- Read AGENTS.md, PROJECT_STATUS.md and CHANGELOG.md first. This handoff supplements them.
- These are recovered instructions from Claude, not a fresh audit of current code or business data. Verify current source before implementation.
- Newer owner instructions and current repository requirements override older handoff claims. In particular, show proposed inventory items/quantities and obtain owner confirmation before any deduction; creating a protocol or marking an invoice paid does not authorize a deduction.
- Historical client data, pricing, product IDs, clinical instructions and outstanding quantities must be checked through authorized current sources. Do not infer missing doses, quantities, payments or credentials from this summary.
- The owner prefers complete unattended work within the authorized scope. Handle routine reversible implementation decisions without repeated prompts; surface genuine blockers. This preference does not bypass tool permissions or expand deployment authorization.

## Site architecture
- Repository: micahp20/biolinked-site; production domain: biolinkedsolutions.com.
- Static HTML/CSS/JavaScript with client-specific folders and PWA manifests/service workers.
- Main is a publishing branch. GitHub Pages deployment is separate from the Cloudflare ask-chat Worker at worker/ask-worker.js.
- Calculator compound data has historically come from cheat-sheet-data.js; inspect the current implementation and actual imports.
- Directory and Share listings must use the correct client name and URL, without duplicates. New protocols must be added to /share/ in the same task.
- Never modify dbejar/, rhurst/ or newhome/ without an explicit later owner instruction changing that restriction.

## Preserve client information and state
- New orders/cycles are additive by default. Preserve previous protocols, dates, historical cycles, invoices and special pricing; archive instead of overwriting unless explicitly requested.
- Keep quote, due, paid, gifted and client-supplied states distinct. A quote is not a sale or inventory movement.
- Do not reprice already-paid orders using later catalog prices.
- Preserve the identity and storage namespace of each portal. Inspect localStorage, cloud-state keys, service-worker scope and calendar filenames when cloning.
- Never reactivate removed compounds or overwrite client edits through a seed/template migration.
- Confirm each page's actual editable/read-only behavior before changes; do not broadly re-enable cloud writes or editing.
- Request missing business or clinical decisions from the owner rather than filling gaps with assumptions.

## Layout and usability
- Follow the current approved template and full CSS cascade. Older Claude references to individual reference portals may predate current migrations.
- Retain the BL hexagon/monogram identity, gold/cream styling, supported light/dark modes and responsive phone/tablet/desktop layouts.
- Keep compound-card faces concise: name, existing dose, recon, units and schedule, with short readable information tooltips.
- Preserve current shared plain-language explanations and expandable context; do not remove newer accepted content solely because an older handoff preferred leaner pages.
- Preserve working schedule, nutrition, labs, payment, calculator and notes navigation. Maintain tooltip color tokens and readable contrast.
- Use imperial measurements for the nutrition interface and preserve per-client save ownership.
- Retain existing payment destinations and app/web fallback behavior; inspect source instead of copying private account details into this document.
- Invoice descriptions should show item quantity and price. Protocol/schedule mechanics belong in their appropriate views.
- Supplies and handling notes have distinct purposes. Match notes to the current compounds and keep the presentation concise.
- Preserve existing disclaimers and legal acknowledgements. Do not invent clinical claims or alter dosing as a side effect of interface work.
- Confirm current cycle-manager rules and pilot rollout authorization before schedule changes. The original handoff has conflicting current-cycle filtering and add-any-cycle instructions; do not apply either globally without checking the accepted implementation.
- Keep supported accessibility, keyboard and mobile behavior from AGENTS.md; historical zoom-blocking instructions are not a reason to degrade current accessibility.

## Implementation and release
- Inspect current source, consumers and client-specific differences before editing. Do not bulk-clone over populated portals.
- Keep invoice arithmetic, schedule membership, calculator mappings, archived data and storage identity intact, and check those invariants when affected.
- Bump only the affected service-worker cache versions when necessary; preserve scoped cache cleanup and update behavior.
- Batch related changes into coherent commits. A saved commit does not establish deployment.
- Verify the exact publishing SHA's Pages result and the relevant live URL/content when available. Do not assume stale content is browser cache without evidence.
- Backend migrations and external services require independent verification; static source changes do not prove backend deployment.
- Do not resume a historically paused intake/backend migration merely because it appears in this handoff.
- Update PROJECT_STATUS.md and CHANGELOG.md with actual checks, remaining work and separate commit/remote/merge/deployment states.

## Private source boundary
The original handoff also includes client/family information, health protocols, commercial costs/margins, vendor contacts, account details and an access code. Those sections are excluded from this public version. Do not upload the original into public git history, public issues/PRs or deployed static assets. Obtain current authorized private context when a task needs it.
