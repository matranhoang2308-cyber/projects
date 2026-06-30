import { useState } from "react";
import {
  User,
  Users,
  Building2,
  Home,
  BadgePercent,
  CreditCard,
  Bell,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import type { DetailSection, DetailField } from "./transferContractDetailSchema";

interface TransferContractBlockViewProps {
  sections: DetailSection[];
}

// Helper function to map section ID to corresponding Lucide Icon
function getSectionIcon(sectionId: string) {
  switch (sectionId) {
    case "owner_info":
      return User;
    case "coowners_info":
      return Users;
    case "representative_info":
      return Building2;
    case "product_info":
      return Home;
    case "policy_info":
      return BadgePercent;
    case "deposit_payment_info":
      return CreditCard;
    case "notification_info":
      return Bell;
    case "hdmb_docs_info":
      return FileCheck;
    default:
      return FileCheck;
  }
}

// Recursively flatten sections to retrieve only leaf fields with actual values
function getLeafFields(fields: DetailField[]): DetailField[] {
  const leafs: DetailField[] = [];
  function recurse(list: DetailField[]) {
    for (const f of list) {
      if (f.children && f.children.length > 0) {
        recurse(f.children);
      } else {
        leafs.push(f);
      }
    }
  }
  recurse(fields);
  return leafs;
}

function SectionCard({ section }: { section: DetailSection }) {
  const [isOpen, setIsOpen] = useState(true);
  const leafs = getLeafFields(section.fields);
  const filledCount = leafs.filter(f => f.value && f.value !== "—" && f.value !== "").length;
  const totalCount = leafs.length;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Card Header with click action to toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50/80 border-b border-slate-200 text-left transition-colors hover:bg-slate-100/60 focus:outline-none"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-slate-800 font-medium uppercase tracking-wide">
            {section.title}
          </span>
          <span className="text-[11px] text-slate-400">
            {filledCount}/{totalCount} trường có dữ liệu
          </span>
        </div>
        <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Card Content Grid */}
      {isOpen && (
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6">
            {leafs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 col-span-3 text-center">
                Không có thông tin
              </p>
            ) : (
              leafs.map((field) => (
                <div key={field.id} className="flex flex-col">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </span>
                  <span className="text-xs text-slate-900 font-medium">
                    {field.value || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function TransferContractBlockView({ sections }: TransferContractBlockViewProps) {
  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}
