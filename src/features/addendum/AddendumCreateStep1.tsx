import { useMemo, useState } from "react";
import { Search, Check, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { templates, contractOptions, contractStatusCfg, type AddendumContractOption } from "./addendumData";
import { addendumSearchInputClass, addendumSelectTriggerClass, addendumBadgeBaseClass, cn } from "./addendumStyles";

const ALL = "Tất cả";

interface AddendumCreateStep1Props {
  selectedContract: string;
  onSelectContract: (value: string) => void;
  selectedTemplate: string;
  onSelectTemplate: (value: string) => void;
}

export function AddendumCreateStep1({
  selectedContract, onSelectContract, selectedTemplate, onSelectTemplate,
}: AddendumCreateStep1Props) {
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState(ALL);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState(ALL);

  const templateCategories = [ALL, ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredContracts = useMemo(() => {
    const q = contractSearch.toLowerCase();
    return contractOptions.filter((c: AddendumContractOption) => {
      const matchStatus = contractStatusFilter === ALL || c.status === contractStatusFilter;
      const matchSearch = !q || c.label.toLowerCase().includes(q) || c.customer.toLowerCase().includes(q) || c.property.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [contractSearch, contractStatusFilter]);

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.toLowerCase();
    return templates.filter((t) => {
      const matchCat = templateCategory === ALL || t.category === templateCategory;
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templateSearch, templateCategory]);

  return (
    <div className="space-y-6">
      {/* ── Chọn hợp đồng gốc ── */}
      <div>
        <p className="mb-3 border-b border-slate-100 pb-2 text-xs font-semibold text-slate-500">CHỌN HỢP ĐỒNG GỐC</p>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã hợp đồng"
              value={contractSearch}
              onChange={(e) => setContractSearch(e.target.value)}
              className={addendumSearchInputClass}
            />
          </div>
          <Select value={contractStatusFilter} onValueChange={setContractStatusFilter}>
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[140px]")}>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Trạng thái</SelectItem>
              <SelectItem value="Đã ký">Đã ký</SelectItem>
              <SelectItem value="Công chứng">Công chứng</SelectItem>
              <SelectItem value="Đã đặt cọc">Đã đặt cọc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
          {filteredContracts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Không tìm thấy hợp đồng phù hợp</div>
          ) : filteredContracts.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onSelectContract(c.value)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all",
                selectedContract === c.value ? "border-slate-900 bg-slate-50" : "border-transparent hover:border-slate-100 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2",
                selectedContract === c.value ? "border-slate-900 bg-slate-900" : "border-slate-300"
              )}>
                {selectedContract === c.value && <Check className="h-2.5 w-2.5 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600">{c.label}</span>
                  <Badge variant="outline" className={cn(addendumBadgeBaseClass, "font-semibold", contractStatusCfg[c.status])}>{c.status}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{c.customer} · {c.property}</p>
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-slate-500">{c.value_str}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chọn phụ lục mẫu ── */}
      <div>
        <p className="mb-3 border-b border-slate-100 pb-2 text-xs font-semibold text-slate-500">CHỌN PHỤ LỤC MẪU</p>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên phụ lục"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              className={addendumSearchInputClass}
            />
          </div>
          <Select value={templateCategory} onValueChange={setTemplateCategory}>
            <SelectTrigger className={cn(addendumSelectTriggerClass, "w-[150px]")}>
              <SelectValue placeholder="Loại phụ lục" />
            </SelectTrigger>
            <SelectContent>
              {templateCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* NOTE: intentional design deviation from Figma — reuses the existing
            template-library card style (icon chip + semantic category tag +
            usage count) instead of the minimal name/desc/tag card shown in
            the Figma mock, per explicit instruction to reuse existing
            components. See design/figma-links.md. */}
        <div className="max-h-72 overflow-y-auto pr-0.5">
          {filteredTemplates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Không tìm thấy mẫu phù hợp</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filteredTemplates.map((t) => {
                const Icon = t.icon;
                const active = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTemplate(t.id)}
                    className={cn(
                      "group rounded-lg border p-3 text-left transition-colors",
                      active ? "border-slate-900 bg-slate-900" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active ? "bg-white/15" : t.bg)}>
                        <Icon className={cn("h-4 w-4", active ? "text-white" : t.color)} />
                      </div>
                      {active && <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white" />}
                    </div>
                    <p className={cn("text-xs font-semibold leading-snug", active ? "text-white" : "text-slate-800")}>{t.name}</p>
                    <p className={cn("mt-1 text-[11px] leading-snug", active ? "text-white/60" : "text-slate-400")}>{t.desc}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", active ? "border-white/20 bg-white/10 text-white" : cn(t.bg, t.color))}>
                        {t.category}
                      </span>
                      <div className={cn("flex items-center gap-1", active ? "text-white/50" : "text-slate-400")}>
                        <CornerDownRight className="h-3 w-3" />
                        <span className="text-[10px]">{t.usages} lần</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
