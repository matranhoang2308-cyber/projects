import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AddendumDetail, AddendumDetailField } from "./addendumDetailSchema";
import { cn } from "./addendumStyles";

const headCls = "border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left text-[11px] leading-4 text-slate-600";
const cellCls = "border-b border-r border-[#E5EAF3] bg-white px-3 py-2 text-xs leading-5 text-slate-700 transition-colors";

interface Section {
  id: string;
  title: string;
  fields: AddendumDetailField[];
  indent?: boolean;
  badge?: string;
}

function SectionTable({ section, isLast }: { section: Section; isLast: boolean }) {
  const [collapsed, setCollapsed] = useState(false);

  if (section.fields.length === 0) return null;

  const isNewOwner = section.id === "new";
  const bgClass = isNewOwner ? "bg-emerald-50" : "bg-indigo-50";
  const borderClass = isNewOwner ? "border-emerald-100" : "border-indigo-100";
  const textClass = isNewOwner ? "text-emerald-700" : "text-indigo-700";
  const btnClass = isNewOwner ? "text-emerald-800 hover:bg-emerald-100/50" : "text-indigo-800 hover:bg-indigo-100/50";

  return (
    <tbody>
      <tr className={bgClass}>
        <td className={cn(
          "border-r px-3 py-2 text-center text-xs font-semibold",
          borderClass,
          textClass,
          isLast && collapsed ? "" : "border-b"
        )}>
          {section.badge ? (
            <span className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold text-white",
              isNewOwner ? "bg-emerald-700" : "bg-indigo-700"
            )}>
              {section.badge}
            </span>
          ) : "•"}
        </td>
        <td colSpan={2} className={cn("border-b p-0", borderClass)}>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-left transition-colors",
              btnClass
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wide">{section.title}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", !collapsed ? "rotate-180" : "")} />
          </button>
        </td>
      </tr>
      {!collapsed && section.fields.map((f, idx) => {
        const isLastRow = isLast && idx === section.fields.length - 1;
        return (
          <tr key={f.id} className="group hover:bg-[#F8FAFC]">
            <td className={cn("border-r border-[#E5EAF3] bg-white px-3 py-2 text-center text-xs text-slate-400 transition-colors group-hover:bg-[#F8FAFC]", isLastRow ? "" : "border-b")} style={{ fontWeight: 600 }}>
              {idx + 1}
            </td>
            <td className={cn(cellCls, "w-[45%] text-slate-600", isLastRow && "border-b-0", "group-hover:bg-[#F8FAFC]")}>{f.label}</td>
            <td className={cn("bg-white px-3 py-2 text-left text-xs leading-5 text-slate-900 transition-colors group-hover:bg-[#F8FAFC]", isLastRow ? "" : "border-b border-[#E5EAF3]")} style={{ fontWeight: 600 }}>
              {f.value || "—"}
            </td>
          </tr>
        );
      })}
    </tbody>
  );
}

export function AddendumTableView({ detail }: { detail: AddendumDetail }) {
  const contractFields: AddendumDetailField[] = [
    { id: "c_code", label: "Mã hợp đồng", value: detail.contract.code },
    { id: "c_owner", label: "Tên chủ sở hữu", value: detail.contract.ownerName },
    { id: "c_property", label: "Bất động sản", value: detail.contract.property },
    { id: "c_value", label: "Giá trị hợp đồng", value: detail.contract.value },
    { id: "c_status", label: "Trạng thái hợp đồng", value: detail.contract.status },
  ];

  const sections: Section[] = [
    { id: "contract", title: "Thông tin hợp đồng gốc", fields: contractFields },
    { id: "notary", title: "Thông tin công chứng", fields: detail.notary, indent: true },
    { id: "old", title: "Thông tin chủ sở hữu cũ", fields: detail.oldOwner },
    { id: "new", title: "Thông tin chủ sở hữu mới", fields: detail.newOwner, badge: "A+" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50">
      <table className="w-full min-w-[520px] border-separate border-spacing-0 text-xs">
        <colgroup>
          <col style={{ width: "50px" }} />
          <col style={{ width: "45%" }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th className={cn(headCls, "text-center")} style={{ fontWeight: 650 }}>STT</th>
            <th className={headCls} style={{ fontWeight: 650 }}>Trường thông tin</th>
            <th className="border-b border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left text-[11px] leading-4 text-slate-600" style={{ fontWeight: 650 }}>Giá trị</th>
          </tr>
        </thead>
        {sections.map((s, i) => (
          <SectionTable key={s.id} section={s} isLast={i === sections.length - 1} />
        ))}
      </table>
    </div>
  );
}
