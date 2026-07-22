import React, { useState, useMemo } from "react";
import { BarChart2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalFilters } from "../dashboard/components/GlobalFilters";
import { GqutTab } from "../dashboard/components/tabs/GqutTab";
import { RefundTab } from "../dashboard/components/tabs/RefundTab";

import { initialBookings } from "../mock/mockBookings";
import { filterBookings, type FilterState } from "../dashboard/utils/computeMetrics";

const INITIAL_FILTERS: FilterState = {
  timePreset: "ALL",
  donViPhanPhoi: "ALL",
  trangThaiThanhToan: "ALL",
  tinhTrangGiaoDich: "ALL",
};

const reportSelectorClass =
  "h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 lg:w-80 shadow-none text-left";

export function CustomerBookingDashboardPage() {
  const [reportType, setReportType] = useState<string>("gqut");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Extract unique distributors list for filter slicer dropdown
  const distributorsList = useMemo(() => {
    const set = new Set<string>();
    initialBookings.forEach((b) => {
      if (b.donViPhanPhoi) set.add(b.donViPhanPhoi);
    });
    return Array.from(set);
  }, []);

  // Filter bookings based on global filter state
  const filteredBookings = useMemo(() => {
    return filterBookings(initialBookings, filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 p-4 pb-10 md:p-6 md:pb-12">
      {/* 1. Header with Customer Booking module domain info arranged like the main dashboard */}
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-[720px]">
          <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700">
            <BarChart2 className="size-4.5 text-blue-700" />
            <span>Trung tâm báo cáo</span>
          </div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-950">
            Dashboard khách hàng đặt chỗ
          </h1>
          <p className="mt-2 max-w-[680px] text-sm leading-6 text-slate-500">
            Theo dõi và phân tích dữ liệu giao dịch đặt chỗ (GQUT), dòng tiền thu, công nợ và hoàn tiền theo từng nhóm báo cáo.
          </p>
        </div>

        {/* Top Right: Selector "Loại báo cáo" */}
        <label className="grid w-full gap-2 lg:w-auto">
          <span className="block min-h-4 text-xs font-medium leading-4 text-slate-600">
            Loại báo cáo
          </span>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className={reportSelectorClass} aria-label="Loại báo cáo">
              <SelectValue placeholder="Chọn loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gqut">Theo dõi giao dịch GQUT</SelectItem>
              <SelectItem value="refund">Hoàn GQUT</SelectItem>
            </SelectContent>
          </Select>
        </label>
      </header>

      {/* 2. Bộ lọc dùng chung cho module Khách hàng đặt chỗ */}
      <GlobalFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        distributors={distributorsList}
      />

      {/* 3. Active Report View (Gqut vs Refund) */}
      {reportType === "gqut" && <GqutTab bookings={filteredBookings} />}
      {reportType === "refund" && <RefundTab bookings={filteredBookings} filters={filters} />}
    </div>
  );
}
