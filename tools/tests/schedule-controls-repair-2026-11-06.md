# Protocol and Schedule correction — 2026-11-06 UTC

Baseline main: ce2f15b96653251eff5244605f7678f1d73670bb.
Scope: mpauldino/ and nprince/. Matt's page was used as a layout reference and was not changed.

Delivered:
- Removed the personal page's frontend unlock UI and edit gate. Fresh keyless visits can edit locally; existing credentialed backend synchronization remains intact. Server-side authorization was not weakened.
- Replaced the old personal Protocol grouped-link view with the shared inline expandable compound cards and facts. Personal groups/history and all static clinical, lab, billing and note data remain intact.
- Rebuilt the personal Schedule as grouped Morning/Night lists with dose/draw at the left, matching the reference structure while retaining compact type and all 18 vitamins/medications.
- Both default and added rows can expand, edit days/timing/dose, save/cancel and remove. Default rows can move without removing/re-adding. Existing supplements and remove/restore tools remain.
- Natasha's saved manual entry uses staged editing and a reliable remove path. Removed entries remain tombstoned through stale cloud merges and reopening. Default rows can also move and remove.
- Calculator-to-schedule saves retain vial strength and reconstitution. Added explicit custom vial mg/IU selection. Master-list additions compute the draw from vial/recon/dose instead of blindly copying a stale units field.
- Changed the installation banner to normal flow so it cannot cover lower action buttons. Closed sheets blur their inputs; the fixed frame clips offscreen sheets without horizontal scrolling.

Real browser verification:
Native Chromium/Playwright clicks, inputs and checkboxes with mocked storage and requests passed:
1. Fresh personal page: no unlock, 17 shared-layout protocol cards and functioning native accordion.
2. Personal default compound: expand/definition, staged dose and draw edit, move weekdays/night, save, remove, restore.
3. Calculator: mass conversion, My List add/edit/delete without losing the edited saved record, Add to Schedule retaining vial/recon, edit/remove the resulting row.
4. Master-list add and edit through the same row.
5. Custom IU/mass switch and known calculation.
6. Reload retains edits/removals and all 18 supplement entries.
7. Natasha's actual saved-entry fixture: edit dose/days/night, remove and reject stale resurrection. The fixture came from a read-only query and was used only in isolated mock storage.
8. Natasha master add and outer Remove button.
9. Natasha default row move/remove without restoring defaults.
10. Natasha calculator → schedule → edit → remove.
Phone widths 320/390 and desktop 1280, light/dark, horizontal frame bounds and screenshots were checked. No page JavaScript errors. Screenshot review identified the sideways focus-scroll issue and it was fixed before the final passing run.

Checks: all inline/new JavaScript syntax; preserved clinical/invoice/identity variable declarations; unchanged personal seed data; exact HTML patches; scoped worker cache cleanup retained.
No inventory, billing or production client-state writes were performed. Production state was not modified as a test. Repository files were published through the GitHub API.

Limits: this is native Chromium using local copies of the source, isolated network/storage and fallback fonts. It is not an actual iPhone/Safari or live backend write test. Deployment status must be checked separately.
