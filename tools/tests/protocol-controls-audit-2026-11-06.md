# Protocol control audit — 2026-11-06 UTC

Baseline: main a2af9c3a37cde8962488d12ecc586d471c279307. Coverage: 142 current portal pages and six older layouts/builders.

Confirmed fixes:
- Saved calculator entries use the vial unit and calculate doses per vial after mass-unit conversion.
- Editing retains the saved entry until Save changes; edit drafts survive reopening.
- Restored calculator inputs also restore internal dose/vial units and syringe capacity.
- Invalid inputs and draws exceeding capacity cannot be saved as clipped doses.
- Syringe keyboard/pointer changes persist. Corrected the warning that previously suggested increasing diluent to reduce a draw.
- Empty saved schedules stay empty, including a legacy sync guard.
- Calculator-to-schedule entries and added-compound rows retain reconstitution context.

Verification performed:
- Mock-DOM interactions on all 142 portals: calculator conversion, save/search/edit/delete, reopening; calculator-to-schedule where present; manual/master schedule add/cancel/remove where present.
- Deeper checks on all 142: client-data equality before/after, retained edit drafts, edit after reopening, invalid-input/capacity validation, IU roundtrip where available, and mock sync payload application where supported. One genuine empty-sync defect was fixed and retested; one test execution timeout passed on isolated rerun.
- Three existing advanced schedule layouts: manual and calculator adds, weekdays/PM/ongoing settings, remove/restore and local reopening. Existing view-only/authorization behavior preserved.
- Two cycle pilots: preview/cancel/advance/undo, pause/restore, added-compound carryover, foundation/completion/history, empty schedule and unchanged protocol data.
- Six older layouts: applicable tab, tracker and builder draft interactions. These layouts do not expose the modern dosage calculator.
- Generated inline event-handler syntax checked across the 148 targets.
- Exact per-page patch validation and remote baseline SHA checks; staged tree contains only the 142 portal HTML files and their 142 scoped cache-version updates.

Limits:
These are DOM/model tests with mock storage and requests, not rendered browser or production backend tests. Chromium launch was blocked by the execution sandbox; permission attempts did not complete. Desktop/phone visual behavior, pointer hit targets, light/dark rendering and real cross-device backend behavior remain unverified. No production client-state, billing or inventory writes were used as tests.

Local evidence: audit/reports/dom-protocols.json, deep.json, deep-retest.json, controls-retest.json, advanced.json, legacy.json and handlers.json in the execution workspace. Reports contain test fixtures, not production test writes.
