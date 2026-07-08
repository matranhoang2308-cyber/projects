import { cn } from "@/components/ui/utils";

// ─── Shared style tokens for the addendum module ─────────────────────────────
// Kept identical to the pre-redesign AddendumPage.tsx so every new component
// stays visually consistent with the rest of the module and the design system.
export const addendumInputClass =
  "h-10 rounded-[8px] border-[#E5EAF3] bg-white text-sm font-medium text-slate-800 shadow-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-100";
export const addendumSelectTriggerClass =
  "h-10 rounded-[8px] border-[#E5EAF3] bg-white text-sm font-medium text-slate-700 shadow-none transition hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 data-[state=open]:border-slate-400 data-[state=open]:bg-white";
export const addendumTextareaClass =
  "resize-none rounded-[8px] border-[#E5EAF3] bg-white text-sm font-medium text-slate-800 shadow-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-100";
export const addendumSearchInputClass =
  "w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";
export const addendumPanelClass =
  "gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
export const addendumPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
export const addendumPanelBodyClass = "p-4";
export const addendumPanelMetaClass =
  "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";

// ─── Tokens copied verbatim from the reference "system standard" modules
// (ContractListPage.tsx / DebtDashboard.tsx) — see design/addendum-consistency-checklist.md.
// Any new table/toolbar/pagination UI in this module should use these, not
// the form-oriented tokens above (which stay for dialog form fields).
export const addendumPageShellClass = "min-h-full space-y-4 p-4 md:p-6";
export const addendumPageHeaderClass = "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between";
export const addendumPrimaryButtonClass =
  "h-10 flex-1 gap-2 whitespace-nowrap bg-slate-950 px-3 hover:bg-slate-800 sm:flex-none sm:px-4";

export const addendumToolbarWrapClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
export const addendumToolbarRowClass =
  "flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap";
export const addendumToolbarSearchInputClass =
  "h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";
export const addendumCompactFilterTriggerClass =
  "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";

export const addendumTableHeaderClass =
  "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
export const addendumTableCellClass =
  "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC]";
export const addendumStickyCellClass = "bg-white transition-colors group-hover:bg-[#F8FAFC]";

export const addendumPanelFooterClass =
  "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
export const addendumPaginationButtonClass = "h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40";

export const addendumBadgeBaseClass =
  "inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1";

// Solid, saturated avatar colors (rounded-lg + white text) — matches the
// CustomerContracts/DebtDashboard avatar convention, not a pastel initials circle.
export const addendumAvatarPalette = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500",
  "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-orange-500",
];

export { cn };
