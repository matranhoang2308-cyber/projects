import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardFilterOptions, DashboardFilters, DatePreset } from "./dashboardApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingDateRangePicker, type TimePresetKey } from "@/features/customer-booking/components/BookingDateRangePicker";

export const defaultDashboardFilters: DashboardFilters = { datePreset: "30d" };

const dateOptions: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "quarter", label: "Quý này" },
  { value: "year", label: "Năm nay" },
  { value: "custom", label: "Tùy chỉnh" },
];

const controlClass = "h-9 min-w-0 w-full rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 text-left shadow-none";
const dateControlClass = `px-3.5 ${controlClass}`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="block text-[11px] font-semibold text-slate-600 leading-none">{label}</span>
      {children}
    </label>
  );
}

interface SharedFiltersProps {
  filters: DashboardFilters;
  options: DashboardFilterOptions;
  reportType?: string;
  disabled?: boolean;
  onChange: (filters: DashboardFilters) => void;
}

export function SharedFilters({ filters, options, reportType, disabled, onChange }: SharedFiltersProps) {
  const zones = useMemo(() => filters.project ? options.zones.filter((item) => item.project === filters.project) : options.zones, [filters.project, options.zones]);
  const buildings = useMemo(() => {
    if (filters.zone) return options.buildings.filter((item) => item.zone === filters.zone);
    if (filters.project) {
      const zoneIds = new Set(zones.map((item) => item.id));
      return options.buildings.filter((item) => zoneIds.has(item.zone));
    }
    return options.buildings;
  }, [filters.project, filters.zone, options.buildings, zones]);

  const update = <K extends keyof DashboardFilters>(key: K, value: string) => {
    const val = value === "_all_" ? undefined : value;
    const next = { ...filters, [key]: val || undefined };
    if (key === "project") { next.zone = undefined; next.building = undefined; }
    if (key === "zone") next.building = undefined;
    if (key === "datePreset" && value !== "custom") { next.from = undefined; next.to = undefined; }
    onChange(next);
  };

  const activeCount = Object.entries(filters).filter(([key, value]) => key !== "datePreset" && Boolean(value)).length;

  return (
    <section aria-labelledby="dashboard-filters" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035),0_10px_30px_rgba(15,23,42,0.025)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="dashboard-filters" className="text-sm font-semibold text-slate-950">Bộ lọc dùng chung</h2>
          <p className="mt-1 text-xs text-slate-500">Áp dụng cho loại báo cáo đang chọn.</p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 h-9 rounded-[8px]" onClick={() => onChange(defaultDashboardFilters)} disabled={disabled || activeCount === 0}>
          <RotateCcw className="h-3.5 w-3.5" /> Đặt lại{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </div>

      {reportType === "debt" ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Đợt thanh toán">
            <Select disabled={disabled} value={filters.paymentStage ?? "_all_"} onValueChange={(val) => update("paymentStage", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.paymentStage && filters.paymentStage !== "_all_")}>
                <SelectValue placeholder="Tất cả đợt" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả đợt</SelectItem>
                {options.paymentStages.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Thời gian">
            <BookingDateRangePicker
              preset={
                filters.datePreset === "today" ? "today" :
                filters.datePreset === "7d" ? "this_week" :
                filters.datePreset === "30d" ? "this_month" :
                filters.datePreset === "quarter" ? "this_quarter" :
                filters.datePreset === "year" ? "this_year" : "this_month"
              }
              fromDate={filters.from}
              toDate={filters.to}
              onApply={(presetKey, fromStr, toStr) => {
                let p: DatePreset = "30d";
                if (presetKey === "today") p = "today";
                else if (presetKey === "this_week") p = "7d";
                else if (presetKey === "this_month") p = "30d";
                else if (presetKey === "this_quarter") p = "quarter";
                else if (presetKey === "this_year") p = "year";
                else p = "custom";
                onChange({ ...filters, datePreset: p, from: fromStr, to: toStr });
              }}
            />
          </Field>
          <Field label="Khách hàng">
            <Select disabled={disabled} value={filters.customerId ?? "_all_"} onValueChange={(val) => update("customerId", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.customerId && filters.customerId !== "_all_")}>
                <SelectValue placeholder="Tất cả khách hàng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả khách hàng</SelectItem>
                {options.customers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Đơn vị bán hàng">
            <Select disabled={disabled} value={filters.salesUnit ?? "_all_"} onValueChange={(val) => update("salesUnit", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.salesUnit && filters.salesUnit !== "_all_")}>
                <SelectValue placeholder="Tất cả đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả đơn vị</SelectItem>
                {options.salesUnits.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phân khu">
            <Select disabled={disabled} value={filters.zone ?? "_all_"} onValueChange={(val) => update("zone", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.zone && filters.zone !== "_all_")}>
                <SelectValue placeholder="Tất cả phân khu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả phân khu</SelectItem>
                {zones.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Loại căn">
            <Select disabled={disabled} value={filters.apartmentType ?? "_all_"} onValueChange={(val) => update("apartmentType", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.apartmentType && filters.apartmentType !== "_all_")}>
                <SelectValue placeholder="Tất cả loại căn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả loại căn</SelectItem>
                {options.apartmentTypes.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Sản phẩm">
            <Select disabled={disabled} value={filters.productId ?? "_all_"} onValueChange={(val) => update("productId", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.productId && filters.productId !== "_all_")}>
                <SelectValue placeholder="Tất cả sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả sản phẩm</SelectItem>
                {options.products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tình trạng thanh toán">
            <Select disabled={disabled} value={filters.paymentStatus ?? "_all_"} onValueChange={(val) => update("paymentStatus", val)}>
              <SelectTrigger className={controlClass} isActive={Boolean(filters.paymentStatus && filters.paymentStatus !== "_all_")}>
                <SelectValue placeholder="Tất cả tình trạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả tình trạng</SelectItem>
                {options.paymentStatuses.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Thời gian">
            <BookingDateRangePicker
              preset={
                filters.datePreset === "today" ? "today" :
                filters.datePreset === "7d" ? "this_week" :
                filters.datePreset === "30d" ? "this_month" :
                filters.datePreset === "quarter" ? "this_quarter" :
                filters.datePreset === "year" ? "this_year" : "this_month"
              }
              fromDate={filters.from}
              toDate={filters.to}
              onApply={(presetKey, fromStr, toStr) => {
                let p: DatePreset = "30d";
                if (presetKey === "today") p = "today";
                else if (presetKey === "this_week") p = "7d";
                else if (presetKey === "this_month") p = "30d";
                else if (presetKey === "this_quarter") p = "quarter";
                else if (presetKey === "this_year") p = "year";
                else p = "custom";
                onChange({ ...filters, datePreset: p, from: fromStr, to: toStr });
              }}
            />
          </Field>
          <Field label="Đơn vị phân phối">
            <Select disabled={disabled} value={filters.agency ?? "_all_"} onValueChange={(val) => update("agency", val)}>
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Tất cả đơn vị" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả đơn vị</SelectItem>
                {options.agencies.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mã sản phẩm">
            <Select disabled={disabled} value={filters.productId ?? "_all_"} onValueChange={(val) => update("productId", val)}>
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Tất cả mã sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả mã sản phẩm</SelectItem>
                {options.products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phân khu">
            <Select disabled={disabled} value={filters.zone ?? "_all_"} onValueChange={(val) => update("zone", val)}>
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Tất cả phân khu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả phân khu</SelectItem>
                {zones.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Loại sản phẩm">
            <Select disabled={disabled} value={filters.productType ?? "_all_"} onValueChange={(val) => update("productType", val)}>
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Tất cả loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả loại</SelectItem>
                {options.productTypes.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trạng thái hồ sơ">
            <Select disabled={disabled} value={filters.dossierStatus ?? "_all_"} onValueChange={(val) => update("dossierStatus", val)}>
              <SelectTrigger className={controlClass}>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all_">Tất cả trạng thái</SelectItem>
                {options.dossierStatuses.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}
      {filters.datePreset === "custom" && (
        <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Từ ngày">
            <input disabled={disabled} className={dateControlClass} type="date" value={filters.from ?? ""} max={filters.to} onChange={(e) => update("from", e.target.value)} />
          </Field>
          <Field label="Đến ngày">
            <input disabled={disabled} className={dateControlClass} type="date" value={filters.to ?? ""} min={filters.from} onChange={(e) => update("to", e.target.value)} />
          </Field>
        </div>
      )}
    </section>
  );
}
