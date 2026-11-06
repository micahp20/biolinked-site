# Personal schedule editor pilot — 2026-11-06

Scope: mpauldino/ only. Baseline: 2d4d48972922e2871a794ac458dc38b199fc1074.

Behavior:
- Native button row expands to the existing editorial compound definition.
- Editable fields stage changes until Save; Cancel leaves the live schedule unchanged.
- Days and AM/PM can be changed without removing/re-adding. Saving moves the selected view to a retained day when needed.
- Remove and Add back use the existing compound identity and lifecycle.
- Master-list and manual additions receive the same row/editor. Explicit guide strength is shown; ambiguous guide doses remain blank for user entry.
- Existing supplement and medication tools, authorization, storage ownership and billing/clinical source data remain intact.
- Reconstitution is optional saved metadata. Known concentrations support dose/draw arithmetic; unknown concentrations require an updated draw when the dose changes. IU/mass incompatibility and invalid numeric values are rejected.
- Planned duration remains a reference; it does not claim automatic removal.

Verification:
- schedule-editor/check.cjs: mock DOM/storage/network checks for expansion/definitions, staged save/cancel, weekdays/timing, remove/restore, master/manual adds, local reopening, payload hydration, escaped names, conflict protection, view-only permissions and equality of preserved static data.
- schedule-editor/edge-check.cjs: unknown-concentration draw edit, invalid duration, canceled add, IU/mass mismatch, recon arithmetic/zero validation, explicit recon clearing and empty weekdays.
- Existing 18 supplement/medication entries retained. No patient-state writes, inventory deductions or billing changes used for testing.
- Read-only Supabase function inspection confirmed arbitrary schedule JSON storage after identity/version/size/day validation. A read-only generic fixture query matched those checks. No schema or backend function modifications.
- All inline/editor/worker JavaScript syntax passed; CSS delimiters balanced.

Limits: DOM/model checks and a read-only API-contract query are not rendered browser or real cross-device tests. Phone/desktop/light/dark visual verification remains unavailable under the workspace browser restrictions. Production authentication/network behavior was preserved, not exercised with test writes.
