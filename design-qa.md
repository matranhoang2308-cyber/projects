# Design QA

source visual truth path:
- `/Users/matranhoang/Documents/Design text codex/audit-crm-2026-06-18/02-contracts-list-desktop.png`
- `/Users/matranhoang/Documents/Design text codex/audit-crm-2026-06-18/04-debt-dashboard-desktop.png`

implementation screenshot path:
- `/Users/matranhoang/Documents/Design text codex/qa-crm-2026-06-18/after-contracts-desktop.png`
- `/Users/matranhoang/Documents/Design text codex/qa-crm-2026-06-18/after-customers-desktop.png`
- `/Users/matranhoang/Documents/Design text codex/qa-crm-2026-06-18/after-debt-desktop.png`
- `/Users/matranhoang/Documents/Design text codex/qa-crm-2026-06-18/after-addendum-desktop.png`

viewport: 1280 x 720  
state: default populated desktop state  
full-view comparison evidence: `/Users/matranhoang/Documents/Design text codex/qa-crm-2026-06-18/desktop-comparison.png`

focused region comparison evidence: Not required. The changed surfaces are application-shell hierarchy, filter wrapping, KPI consistency, page headers and accessible control semantics. These are legible in the full-view comparison and DOM checks.

## Findings

No actionable P0, P1 or P2 visual findings remain in the requested desktop scope.

- Typography: Existing font and hierarchy are preserved. Feature-level font override was removed from Công nợ.
- Spacing and layout rhythm: All edited pages use the shared shell and 16/24px page padding. Công nợ no longer introduces a second header.
- Colors and visual tokens: Primary actions use slate; blue, emerald, amber and red are limited to informational/domain states.
- Image quality: No new image assets were introduced or required for these data-heavy product screens.
- Copy and content: KPI contradiction was corrected from 28 failed contracts to 4. Existing business terminology and route labels were preserved.

## Patches made

- Added skip navigation, accessible names, visible focus states and correct active-route matching.
- Added `min-w-0` to the application content shell.
- Unified Công nợ and all three debt drill-down screens with the main ContractCRM application shell.
- Reworked contract filters to wrap within the desktop workspace instead of relying on a horizontal control rail.
- Corrected contract KPI math.
- Standardized page actions and summary-card surfaces across Khách hàng and Phụ lục.
- Fixed the Phụ lục synchronization alert layout.
- Added keyboard access for clickable customer and addendum rows.
- Added durable design-system guidance in `design/design-system.md`.

## Validation

- `npm run build`: passed.
- Visible inputs without labels across Hợp đồng, Khách hàng, Công nợ and Phụ lục: 0.
- Buttons without accessible names across those routes: 0.
- Debt detail route check: one `main` landmark, no nested `RealCRM` shell, canonical `/debt/customer/...` navigation.
- Dashboard content was not modified.
- Responsive/mobile work was excluded per user direction.

## Follow-up polish

- Route-level code splitting remains recommended because the main bundle is approximately 464 KB gzip.
- Replace the remaining mixed Material/Lucide export icons in a later icon-system cleanup.

final result: passed
