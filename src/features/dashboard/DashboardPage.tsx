import { useEffect, useState } from "react";
import { BarChart2, AreaChart, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardBootstrap, DashboardFilters, getDashboardBootstrap } from "./dashboardApi";
import { defaultDashboardFilters, SharedFilters } from "./SharedFilters";
import { SalesInventoryReport } from "./SalesInventoryReport";

const reportSelectorClass = "crm-native-select h-11 w-full rounded-xl border border-blue-200 bg-white text-sm font-semibold text-slate-900 shadow-[0_1px_2px_rgba(37,99,235,0.06)] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-80";

function PendingReport({ label }: { label: string }) {
  return <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.025)]"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><AreaChart className="size-6 text-blue-700" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Báo cáo {label} chưa được cấu hình</h2><p className="mt-1 max-w-md text-sm leading-6 text-slate-500">Khung Dashboard đã sẵn sàng. Cards, charts và tables của nhóm này sẽ được kết nối ở giai đoạn triển khai tương ứng.</p></section>;
}

export function DashboardPage() {
  const [bootstrap, setBootstrap] = useState<DashboardBootstrap | null>(null);
  const [reportType, setReportType] = useState("");
  const [filters, setFilters] = useState<DashboardFilters>(defaultDashboardFilters);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController(); setError(null);
    getDashboardBootstrap(controller.signal).then((value) => { setBootstrap(value); setReportType((current) => current || value.defaultReportType || value.reportTypes[0]?.value || ""); }).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải cấu hình Dashboard"); });
    return () => controller.abort();
  }, [reloadKey]);

  const selectedLabel = bootstrap?.reportTypes.find((item) => item.value === reportType)?.label ?? "";
  return (
    <div className="mx-auto max-w-[1440px] space-y-7 p-4 pb-10 md:p-6 md:pb-12">
      <header className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end">
        <div className="max-w-[720px]"><div className="mb-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700"><BarChart2 className="size-4.5 text-blue-700" /> Trung tâm báo cáo</div><h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em] text-slate-950">Thống kê tổng quan</h1><p className="mt-2 max-w-[680px] text-sm leading-6 text-slate-500">Theo dõi và phân tích dữ liệu kinh doanh, hợp đồng, công nợ và vận hành theo từng nhóm báo cáo.</p></div>
        <label className="grid w-full gap-2 lg:w-auto"><span className="block min-h-4 text-xs font-semibold leading-4 text-slate-600">Loại báo cáo</span>{bootstrap ? <select aria-label="Loại báo cáo" className={reportSelectorClass} value={reportType} onChange={(e) => setReportType(e.target.value)}>{bootstrap.reportTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select> : <Skeleton className="h-11 w-full rounded-xl lg:w-80" />}</label>
      </header>

      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>Không thể tải cấu hình Dashboard. {error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={() => setReloadKey((v) => v + 1)}><RotateCw className="size-4" /> Thử lại</Button></div>}
      {bootstrap && <SharedFilters filters={filters} options={bootstrap.filterOptions} onChange={setFilters} />}
      {bootstrap && reportType === "sales-inventory" && <SalesInventoryReport filters={filters} />}
      {bootstrap && reportType && reportType !== "sales-inventory" && <PendingReport label={selectedLabel} />}
    </div>
  );
}
