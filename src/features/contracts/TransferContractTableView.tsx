import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DetailSection, DetailField } from "./transferContractDetailSchema";

interface TransferContractTableViewProps {
  sections: DetailSection[];
  contract?: any;
}

const detailTableHeadClass = "border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-[11px] leading-4 text-slate-600";
const detailTableCellClass = "border-b border-r border-[#E5EAF3] bg-white px-3 py-2 text-xs leading-5 text-slate-700 transition-colors";

interface FlatField {
  field: DetailField;
  level: number;
}

function flattenFields(fields: DetailField[], level = 0): FlatField[] {
  const result: FlatField[] = [];
  for (const f of fields) {
    result.push({ field: f, level });
    if (f.children && f.children.length > 0) {
      result.push(...flattenFields(f.children, level + 1));
    }
  }
  return result;
}

export function TransferContractTableView({ sections }: TransferContractTableViewProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Scrollable table area */}
      <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 260px)" }}>
        
        {/* Render 8 Schema Sections */}
        <div className="mb-6 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50">
          <table className="w-full min-w-[520px] border-separate border-spacing-0 text-xs">
            <colgroup>
              <col style={{ width: "50px" }} />
              <col style={{ width: "45%" }} />
              <col />
            </colgroup>

            <thead>
              <tr>
                <th className={`${detailTableHeadClass} text-center`} style={{ fontWeight: 650 }}>STT</th>
                <th className={`${detailTableHeadClass} text-left`} style={{ fontWeight: 650 }}>Trường thông tin</th>
                <th className="border-b border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left text-[11px] leading-4 text-slate-600" style={{ fontWeight: 650 }}>Giá trị</th>
              </tr>
            </thead>

            {sections.map((section, sectionIdx) => {
              const flatFields = flattenFields(section.fields);
              if (flatFields.length === 0) return null;
              const isCollapsed = collapsedSections[section.id];

              return (
                <tbody key={section.id}>
                  {/* Section Header Row */}
                  <tr className="bg-emerald-50">
                    <td className="border-b border-r border-emerald-100 px-3 py-2 text-center text-xs text-emerald-700" style={{ fontWeight: 650 }}>
                      {sectionIdx + 1}
                    </td>
                    <td
                      colSpan={2}
                      className="border-b border-emerald-100 p-0 text-xs text-emerald-700"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-emerald-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300"
                      >
                        <span className="text-xs text-emerald-800" style={{ fontWeight: 650 }}>
                          {section.title}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-emerald-700 transition-transform duration-200 ${
                            !isCollapsed ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Section Rows */}
                  {!isCollapsed && flatFields.map(({ field, level }, idx) => {
                    const isParent = field.children && field.children.length > 0;
                    const isLastRow = sectionIdx === sections.length - 1 && idx === flatFields.length - 1;

                    return (
                      <tr key={field.id} className="group hover:bg-[#F8FAFC]">
                        <td className={`border-r border-[#E5EAF3] px-3 py-2 text-center text-xs text-slate-400 group-hover:bg-[#F8FAFC] ${isLastRow ? "" : "border-b"}`} style={{ fontWeight: 600 }}>
                          {idx + 1}
                        </td>
                        <td
                          className={`${detailTableCellClass} ${isParent ? "text-slate-900" : "text-slate-600"} ${isLastRow ? "border-b-0" : ""} group-hover:bg-[#F8FAFC]`}
                          style={{ paddingLeft: `${12 + level * 16}px`, fontWeight: isParent ? 650 : 400 }}
                        >
                          {field.label}
                        </td>
                        <td className={`px-3 py-2 text-right text-xs leading-5 text-slate-900 group-hover:bg-[#F8FAFC] ${isLastRow ? "" : "border-b border-[#E5EAF3]"}`} style={{ fontWeight: 600 }}>
                          {isParent ? "" : (field.value || "—")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}
