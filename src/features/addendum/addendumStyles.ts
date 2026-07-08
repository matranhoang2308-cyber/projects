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
export const addendumTableHeaderClass =
  "border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
export const addendumTableCellClass =
  "border-b border-r border-[#E5EAF3] bg-white px-3 py-2 align-middle transition-colors group-hover:bg-[#F8FAFC]";

export { cn };
