import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import type { DetailSection, DetailField } from "./transferContractDetailSchema";

interface TransferContractTableViewProps {
  sections: DetailSection[];
  contract?: any;
}

const fieldCellStyle: CSSProperties = {
  color: "#5a6175",
  width: "220px",
  minWidth: "180px",
  padding: "9px 14px",
  fontSize: "12px",
  borderBottom: "1px solid #e0e0e0",
  borderRight: "1px solid #e0e0e0",
};

const valueCellStyle: CSSProperties = {
  color: "#1a2035",
  fontWeight: 500,
  padding: "9px 14px",
  fontSize: "12px",
  borderBottom: "1px solid #e0e0e0",
};

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

  function rowBg(idx: number) {
    return idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Scrollable table area */}
      <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 260px)" }}>
        
        {/* Render 8 Schema Sections */}
        <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm mb-6">
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              minWidth: "520px",
              fontSize: "12px",
              display: "table",
              marginBottom: 0,
            }}
          >
            <colgroup>
              <col style={{ width: "50px" }} />
              <col style={{ width: "45%" }} />
              <col />
            </colgroup>

            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475467", textAlign: "center", borderRight: "1px solid #e0e0e0" }}>STT</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475467", textAlign: "left" }}>Trường thông tin</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475467", textAlign: "left" }}>Giá trị</th>
              </tr>
            </thead>

            {sections.map((section, sectionIdx) => {
              const flatFields = flattenFields(section.fields);
              if (flatFields.length === 0) return null;
              const isCollapsed = collapsedSections[section.id];

              return (
                <tbody key={section.id}>
                  {/* Section Header Row */}
                  <tr style={{ background: "#f0fdf4" }}>
                    <td
                      style={{
                        color: "#15803d",
                        fontWeight: 700,
                        textAlign: "center",
                        borderBottom: "1px solid #bbf7d0",
                        borderRight: "1px solid #bbf7d0",
                        padding: "10px 14px",
                        fontSize: "12px",
                      }}
                    >
                      {sectionIdx + 1}
                    </td>
                    <td
                      colSpan={2}
                      style={{
                        color: "#15803d",
                        fontWeight: 700,
                        borderBottom: "1px solid #bbf7d0",
                        padding: 0,
                        fontSize: "12px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between text-left focus:outline-none hover:bg-emerald-100/30 transition-colors px-3.5 py-2.5"
                      >
                        <span className="font-bold text-emerald-800 uppercase tracking-wide">
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
                      <tr key={field.id} style={{ background: rowBg(idx) }} className="hover:bg-slate-50 transition-colors">
                        <td
                          style={{
                            color: "#64748b",
                            fontWeight: 600,
                            textAlign: "center",
                            borderBottom: isLastRow ? "none" : "1px solid #e0e0e0",
                            borderRight: "1px solid #e0e0e0",
                            padding: "9px 14px",
                            fontSize: "12px",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            ...fieldCellStyle,
                            paddingLeft: `${14 + level * 16}px`,
                            fontWeight: isParent ? 600 : 400,
                            color: isParent ? "#1a2035" : "#475467",
                            borderRight: "none",
                            borderBottom: isLastRow ? "none" : "1px solid #e0e0e0",
                          }}
                        >
                          {field.label}
                        </td>
                        <td style={{ ...valueCellStyle, textAlign: "right", borderBottom: isLastRow ? "none" : "1px solid #e0e0e0" }}>
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
