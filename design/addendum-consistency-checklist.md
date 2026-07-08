# Addendum module — system consistency checklist

Extracted from the two reference modules considered the system standard:
`src/features/contracts/ContractListPage.tsx` (Quản lý hợp đồng) and
`src/features/debt/DebtDashboard.tsx` (Quản lý công nợ). The addendum module
must follow these literal patterns; where the Figma redesign conflicts with
them, this checklist wins (conflicts are called out below and in the final
report).

## 1. Page shell
```
<div className="min-h-full space-y-4 p-4 md:p-6">
```
No `max-w-*` cap — full-bleed workspace. Sections stacked with `space-y-4`.

## 2. Page header
```
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
  <div>
    <h1 className="text-slate-950" style={{ fontWeight: 750 }}>Quản lý ...</h1>
    <p className="text-sm text-slate-500 mt-1">subtitle</p>
  </div>
  <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">...</div>
</div>
```
`h1` has no explicit text-size class — the base layer already sets `h1 { font-size: var(--text-2xl) }` (see `src/styles/theme.css:151`), so adding `text-xl` (as the old addendum page did) makes the title smaller than every other module.
Primary button: `size="sm"` + `h-10 flex-1 gap-2 whitespace-nowrap bg-slate-950 px-3 hover:bg-slate-800 sm:flex-none sm:px-4`.

## 3. Table toolbar
Single horizontal-scroll row — search, filters and the display/column control all live together, not split left/right:
```
<div className="border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5">
  <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
```
Search: raw `<input>`, `h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs ...`, wrapped `relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs`.
Filters: shadcn `Select`, trigger `h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none` + `w-{n} flex-shrink-0`.

## 4. Table
Built on shadcn `Table/TableHeader/TableBody/TableRow/TableHead/TableCell` (`src/components/ui/table.tsx`), not a raw `<table>`.
- Header cell: `h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600`, label `style={{fontWeight:650}}`.
- Body cell: `h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC]`.
- Row: `group h-11 cursor-pointer`, whole row opens detail via `role="button" tabIndex={0}` + Enter/Space, guarded so clicks on action/checkbox cells don't bubble.
- Sticky columns: literal Tailwind `sticky left-0 z-40` / `sticky right-0 z-40` (header), `z-10` (body) + edge affordance `shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]` (left) / `shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]` (right). No inline `position:sticky` style objects.
- Status badges: shadcn `Badge`, base `inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1`, color pattern `bg-{c}-50 text-{c}-700 ring-{c}-100|200` (pale bg + ring, **not** `bg-{c}-100` + `border`).
- Avatar (table rows): solid saturated color, white text, **rounded-lg** (not rounded-full): `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs text-white {colorClass}`.

## 5. Pagination
```
flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between
```
Prev/next only — **no numbered page buttons**. Literal `‹`/`›` glyphs in `Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40"`. Range shown as `{start}-{end} / {total}` (slash, not "of").

## 6. Modal / Drawer
Dialog: `DialogContent className="max-w-2xl p-0 gap-0"`, header `px-6 pt-5 pb-4 border-b border-border/60`, footer `px-6 py-4 border-t border-border/60` with `flex items-center gap-2 w-full` — Cancel `flex-1` left, primary `flex-1` right (both equal width) for simple confirm dialogs. The addendum create modal's footer (draft-select left, Đóng/Tiếp tục right) is Figma-specific and kept as designed, but border/spacing tokens still follow `border-border/60`.
Detail drawer: real shadcn `Sheet`/`SheetContent` (as used by `ContractDetailSheet.tsx`), `w-full sm:max-w-xl p-0 flex flex-col h-full overflow-hidden`.
Stepper (`ContractTransferDialog.tsx`): circle `w-6 h-6 rounded-full ... border-2`, done = `bg-emerald-500 border-emerald-500 text-white`, **current = `bg-slate-900 border-slate-900 text-white`** (not blue), future = `bg-white border-slate-200 text-slate-400`; connector `flex-1 h-px mx-2` + `bg-emerald-300` done / `bg-slate-200` otherwise.

## 7. Status colors (ring pattern)
`"Đã ký"` → `bg-emerald-50 text-emerald-700 ring-emerald-100`
`"Nháp"` → `bg-slate-50 text-slate-600 ring-slate-200`
`"Công chứng"` → `bg-violet-50 text-violet-700 ring-violet-100`
`"Đã đặt cọc"` → `bg-orange-50 text-orange-700 ring-orange-200`

## 8. Spacing/typography
`space-y-4` page sections · `gap-2`/`gap-3`/`gap-4` header/toolbar/grid · `text-[11px] leading-4` table header/meta · `text-xs leading-5` table cell body · `text-sm font-semibold text-slate-900` section titles · `text-slate-500` helper text · inline `style={{fontWeight: 600|650|700|750}}` instead of Tailwind `font-*` for weights above 500 · `tabular-nums` on money/counts · panel radius `rounded-lg` · borders `border-[#E2E8F0]` (outer card) / `border-[#E5EAF3]` (toolbar/footer) / `border-[#DDE5F0]` (table grid).

## Conflicts resolved in favor of system convention (see final report)
1. **Pagination**: Figma shows numbered page buttons (1–5) — replaced with the system's prev/next + count pattern.
2. **Stepper current-step color**: Figma calls for blue highlight — changed to the system's `slate-900` (matches `ContractTransferDialog`).
3. **Status badge style**: switched from `bg-100 + border` to the system's `bg-50 + ring-1` pattern.
4. **Avatar shape**: switched from `rounded-full` pastel initials to the system's `rounded-lg` solid-color + white text.
5. **Column visibility control**: system reference modules use a plain single-select "Hiển thị" dropdown, but the addendum table genuinely needs independent per-column toggles (13 columns, matches Figma's checklist). Kept `DropdownMenuCheckboxItem` for correct functionality, restyled the trigger to the system's compact toolbar-button look so it still reads as one family with the other toolbar controls.
