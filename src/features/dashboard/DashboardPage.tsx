import { useEffect, useState } from "react";
import { BarChart2, AreaChart, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardBootstrap, DashboardFilters, getDashboardBootstrap } from "./dashboardApi";
import { defaultDashboardFilters, SharedFilters } from "./SharedFilters";
import { ContractDashboardReport } from "./ContractDashboardReport";
import { DebtDashboardReport } from "./DebtDashboardReport";
import { SalesInventoryReport } from "./SalesInventoryReport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const reportSelectorClass = "h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 lg:w-80 shadow-none text-left";

function PendingReport({ label }: { label: string }) {
  return <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.025)]"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><AreaChart className="size-6 text-blue-700" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Báo cáo {label} chưa được cấu hình</h2><p className="mt-1 max-w-md text-sm leading-6 text-slate-500">Khung Dashboard đã sẵn sàng. Cards, charts và tables của nhóm này sẽ được kết nối ở giai đoạn triển khai tương ứng.</p></section>;
}

export function DashboardPage() {
  const [bootstrap, setBootstrap] = useState<DashboardBootstrap | null>(null);
  const [reportType, setReportType] = useState("sales-inventory");
  const [filters, setFilters] = useState<DashboardFilters>(defaultDashboardFilters);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController(); setError(null);
    getDashboardBootstrap(controller.signal).then((value) => { setBootstrap(value); setReportType((current) => value.reportTypes.some((item) => item.value === current) ? current : value.defaultReportType); }).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải cấu hình Dashboard"); });
    return () => controller.abort();
  }, [reloadKey]);

  const selectedLabel = bootstrap?.reportTypes.find((item) => item.value === reportType)?.label ?? "";
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 p-4 pb-10 md:p-6 md:pb-12">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-[720px]"><div className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700"><BarChart2 className="size-4.5 text-blue-700" /> Trung tâm báo cáo</div><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-950">Thống kê tổng quan</h1><p className="mt-2 max-w-[680px] text-sm leading-6 text-slate-500">Theo dõi và phân tích dữ liệu kinh doanh, hợp đồng, công nợ và vận hành theo từng nhóm báo cáo.</p></div>
        <label className="grid w-full gap-2 lg:w-auto">
          <span className="block min-h-4 text-xs font-medium leading-4 text-slate-600">Loại báo cáo</span>
          {bootstrap ? (
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className={reportSelectorClass} aria-label="Loại báo cáo">
                <SelectValue placeholder="Chọn loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                {bootstrap.reportTypes.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Skeleton className="h-9 w-full rounded-[8px] lg:w-80" />
          )}
        </label>
      </header>

      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>Không thể tải cấu hình Dashboard. {error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={() => setReloadKey((v) => v + 1)}><RotateCw className="size-4" /> Thử lại</Button></div>}
      {bootstrap && <SharedFilters filters={filters} options={bootstrap.filterOptions} reportType={reportType} onChange={setFilters} />}
      {bootstrap && reportType === "sales-inventory" && <SalesInventoryReport filters={filters} />}
      {bootstrap && reportType === "contracts" && <ContractDashboardReport filters={filters} />}
      {bootstrap && reportType === "debt" && <DebtDashboardReport filters={filters} />}
      {bootstrap && reportType && !["sales-inventory", "contracts", "debt"].includes(reportType) && <PendingReport label={selectedLabel} />}
    </div>
  );
}
