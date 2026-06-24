import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardFilterOptions, DashboardFilters, DatePreset } from "./dashboardApi";

export const defaultDashboardFilters: DashboardFilters = { datePreset: "30d" };

const dateOptions: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Hôm nay" }, { value: "7d", label: "7 ngày" }, { value: "30d", label: "30 ngày" },
  { value: "quarter", label: "Quý này" }, { value: "year", label: "Năm nay" }, { value: "custom", label: "Tùy chỉnh" },
];

const controlClass = "h-11 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";
const selectControlClass = `crm-native-select ${controlClass}`;
const dateControlClass = `px-4 ${controlClass}`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid min-w-0 gap-2"><span className="block min-h-4 text-xs font-medium leading-4 text-slate-600">{label}</span>{children}</label>;
}

interface SharedFiltersProps {
  filters: DashboardFilters;
  options: DashboardFilterOptions;
  disabled?: boolean;
  onChange: (filters: DashboardFilters) => void;
}

export function SharedFilters({ filters, options, disabled, onChange }: SharedFiltersProps) {
  const zones = useMemo(() => filters.project ? options.zones.filter((item) => item.project === filters.project) : options.zones, [filters.project, options.zones]);
  const buildings = useMemo(() => {
    if (filters.zone) return options.buildings.filter((item) => item.zone === filters.zone);
    if (filters.project) {
      const zoneIds = new Set(zones.map((item) => item.id));
      return options.buildings.filter((item) => zoneIds.has(item.zone));
    }
    return options.buildings;
  }, [filters.project, filters.zone, options.buildings, zones]);
  const update = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    const next = { ...filters, [key]: value || undefined };
    if (key === "project") { next.zone = undefined; next.building = undefined; }
    if (key === "zone") next.building = undefined;
    if (key === "datePreset" && value !== "custom") { next.from = undefined; next.to = undefined; }
    onChange(next);
  };
  const activeCount = Object.entries(filters).filter(([key, value]) => key !== "datePreset" && Boolean(value)).length;

  return (
    <section aria-labelledby="dashboard-filters" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035),0_10px_30px_rgba(15,23,42,0.025)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div><h2 id="dashboard-filters" className="text-sm font-semibold text-slate-950">Bộ lọc dùng chung</h2><p className="mt-1 text-xs text-slate-500">Áp dụng cho loại báo cáo đang chọn.</p></div>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={() => onChange(defaultDashboardFilters)} disabled={disabled || activeCount === 0}>
          <RotateCcw className="h-3.5 w-3.5" /> Đặt lại{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Thời gian"><select disabled={disabled} className={selectControlClass} value={filters.datePreset} onChange={(e) => update("datePreset", e.target.value as DatePreset)}>{dateOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
        <Field label="Dự án"><select disabled={disabled} className={selectControlClass} value={filters.project ?? ""} onChange={(e) => update("project", e.target.value)}><option value="">Tất cả dự án</option>{options.projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Block tháp"><select disabled={disabled} className={selectControlClass} value={filters.zone ?? ""} onChange={(e) => update("zone", e.target.value)}><option value="">Tất cả block tháp</option>{zones.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Tòa"><select disabled={disabled} className={selectControlClass} value={filters.building ?? ""} onChange={(e) => update("building", e.target.value)}><option value="">Tất cả tòa</option>{buildings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Loại sản phẩm"><select disabled={disabled} className={selectControlClass} value={filters.productType ?? ""} onChange={(e) => update("productType", e.target.value)}><option value="">Tất cả loại</option>{options.productTypes.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Đơn vị phân phối"><select disabled={disabled} className={selectControlClass} value={filters.agency ?? ""} onChange={(e) => update("agency", e.target.value)}><option value="">Tất cả đơn vị</option>{options.agencies.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="Sản phẩm"><select disabled={disabled} className={selectControlClass} value={filters.productId ?? ""} onChange={(e) => update("productId", e.target.value)}><option value="">Tất cả sản phẩm</option>{options.products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
        <Field label="Trạng thái"><select disabled={disabled} className={selectControlClass} value={filters.productStatus ?? ""} onChange={(e) => update("productStatus", e.target.value as DashboardFilters["productStatus"])}><option value="">Tất cả trạng thái</option><option value="sold">Đã bán</option><option value="available">Chưa bán</option></select></Field>
      </div>
      {filters.datePreset === "custom" && <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4"><Field label="Từ ngày"><input disabled={disabled} className={dateControlClass} type="date" value={filters.from ?? ""} max={filters.to} onChange={(e) => update("from", e.target.value)} /></Field><Field label="Đến ngày"><input disabled={disabled} className={dateControlClass} type="date" value={filters.to ?? ""} min={filters.from} onChange={(e) => update("to", e.target.value)} /></Field></div>}
    </section>
  );
}
