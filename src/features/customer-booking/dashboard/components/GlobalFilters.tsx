import React from "react";
import { RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BookingDateRangePicker,
  type TimePresetKey,
} from "@/features/customer-booking/components/BookingDateRangePicker";
import type { FilterState } from "../utils/computeMetrics";

interface GlobalFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  distributors: string[];
}

const controlClass =
  "h-9 min-w-0 w-full rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 text-left shadow-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="block text-[11px] font-semibold text-slate-600 leading-none">{label}</span>
      {children}
    </label>
  );
}

// Helper to map legacy filter state preset string to TimePresetKey
function mapToPresetKey(timePreset: string): TimePresetKey {
  switch (timePreset) {
    case "TODAY":
      return "today";
    case "LAST_7_DAYS":
    case "THIS_WEEK":
      return "this_week";
    case "THIS_MONTH":
      return "this_month";
    case "THIS_QUARTER":
      return "this_quarter";
    case "THIS_YEAR":
      return "this_year";
    case "ALL":
      return "all";
    default:
      return "this_month";
  }
}

export function GlobalFilters({
  filters,
  onFilterChange,
  onReset,
  distributors,
}: GlobalFiltersProps) {
  const currentPreset = mapToPresetKey(filters.timePreset);

  const handleDateApply = (presetKey: TimePresetKey, fromDate?: string, toDate?: string) => {
    let mappedPreset = "THIS_MONTH";
    if (presetKey === "all") mappedPreset = "ALL";
    else if (presetKey === "today") mappedPreset = "TODAY";
    else if (presetKey === "this_week") mappedPreset = "LAST_7_DAYS";
    else if (presetKey === "this_month") mappedPreset = "THIS_MONTH";
    else if (presetKey === "this_quarter") mappedPreset = "THIS_QUARTER";
    else if (presetKey === "this_year") mappedPreset = "THIS_YEAR";
    else mappedPreset = "CUSTOM";

    onFilterChange("timePreset", mappedPreset);
    if (fromDate) onFilterChange("fromDate", fromDate);
    if (toDate) onFilterChange("toDate", toDate);
  };

  return (
    <section
      aria-labelledby="dashboard-filters"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.035),0_10px_30px_rgba(15,23,42,0.025)]"
    >
      {/* Box Header: Title + Reset Button */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 id="dashboard-filters" className="text-sm font-semibold text-slate-950">
            Bộ lọc dùng chung
          </h2>
          <p className="mt-1 text-xs text-slate-500">Áp dụng cho loại báo cáo đang chọn.</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5 h-9 rounded-[8px] text-xs font-medium text-slate-600 hover:bg-slate-100"
          onClick={onReset}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Đặt lại
        </Button>
      </div>

      {/* Grid Fields: 4 filters belonging strictly to Customer Booking module */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* 1. Thời gian Popover DateRangePicker matching screenshot */}
        <Field label="Thời gian">
          <BookingDateRangePicker
            preset={currentPreset}
            fromDate={filters.fromDate}
            toDate={filters.toDate}
            onApply={handleDateApply}
          />
        </Field>

        {/* 2. Đơn vị phân phối */}
        <Field label="Đơn vị phân phối">
          <Select
            value={filters.donViPhanPhoi}
            onValueChange={(val) => onFilterChange("donViPhanPhoi", val)}
          >
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Tất cả đơn vị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả đơn vị</SelectItem>
              {distributors.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* 3. Trạng thái thanh toán */}
        <Field label="Trạng thái thanh toán">
          <Select
            value={filters.trangThaiThanhToan}
            onValueChange={(val) => onFilterChange("trangThaiThanhToan", val)}
          >
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="DA_THANH_TOAN">Đã thanh toán đủ</SelectItem>
              <SelectItem value="CHUA_THANH_TOAN">Chưa thanh toán đủ</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {/* 4. Tình trạng giao dịch */}
        <Field label="Tình trạng giao dịch">
          <Select
            value={filters.tinhTrangGiaoDich}
            onValueChange={(val) => onFilterChange("tinhTrangGiaoDich", val)}
          >
            <SelectTrigger className={controlClass}>
              <SelectValue placeholder="Tất cả tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả tình trạng</SelectItem>
              <SelectItem value="DAT_CHO">Đặt chỗ</SelectItem>
              <SelectItem value="HOAN_TIEN">Hoàn tiền</SelectItem>
              <SelectItem value="CHUYEN_COC">Chuyển cọc</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </section>
  );
}
