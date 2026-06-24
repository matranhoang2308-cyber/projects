import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RotateCw,
  RotateCcw,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerRankingData, CustomerRankingKind, CustomerRankingQuery, CustomerRankingSortKey, DashboardFilters, DatePreset, getCustomerRankings } from "./dashboardApi";

const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
const fieldClass = "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const selectClass = `crm-native-select w-full border ${fieldClass}`;
const pageSize = 10;

type RangeState = { min: string; max: string };

const timeOptions: Array<{ value: DatePreset; label: string }> = [
  { value: "today", label: "Hôm nay" },
  { value: "7d", label: "7 ngày gần nhất" },
  { value: "30d", label: "30 ngày gần nhất" },
  { value: "quarter", label: "Quý này" },
  { value: "year", label: "Năm nay" },
  { value: "custom", label: "Khoảng thời gian" },
];

const reportConfig: Record<CustomerRankingKind, { label: string; description: string; defaultSort: CustomerRankingSortKey }> = {
  productCount: { label: "Mua nhiều sản phẩm", description: "Xếp hạng khách hàng theo số lượng sản phẩm đã mua", defaultSort: "productCount" },
  contractValue: { label: "Giá trị giao dịch cao", description: "Xếp hạng khách hàng theo tổng giá trị giao dịch", defaultSort: "contractValue" },
};

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date(); const from = new Date(to); from.setDate(from.getDate() - 30);
  return { from: inputDate(from), to: inputDate(to) };
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-r border-slate-200 px-4 py-3 last:border-r-0"><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 truncate text-base font-semibold tabular-nums text-slate-950" title={value}>{value}</p></div>;
}

function SortButton({ label, column, sortBy, direction, onSort }: { label: string; column: CustomerRankingSortKey; sortBy: CustomerRankingSortKey; direction: "asc" | "desc"; onSort: (column: CustomerRankingSortKey) => void }) {
  const active = sortBy === column;
  return <button type="button" className={`inline-flex items-center gap-1 rounded-md py-1 text-left text-xs font-semibold ${active ? "text-blue-700" : "text-slate-500 hover:text-slate-900"}`} onClick={() => onSort(column)} aria-label={`Sắp xếp theo ${label}`}>{label}{active ? direction === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" /> : <ChevronsUpDown className="size-3.5" />}</button>;
}

function RankBadge({ rank }: { rank: number }) {
  const style = rank === 1 ? "bg-amber-100 text-amber-800" : rank === 2 ? "bg-slate-200 text-slate-700" : rank === 3 ? "bg-orange-100 text-orange-800" : "bg-slate-50 text-slate-600";
  return <span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-xs font-bold tabular-nums ${style}`}>{rank}</span>;
}

export function CustomerRankingReports({ filters }: { filters: DashboardFilters }) {
  const initialRange = defaultRange();
  const [kind, setKind] = useState<CustomerRankingKind>("productCount");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<DatePreset>("30d");
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<RangeState>({ min: "", max: "" });
  const [sortBy, setSortBy] = useState<CustomerRankingSortKey>(reportConfig.productCount.defaultSort);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<CustomerRankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const effectiveFilters = useMemo<DashboardFilters>(() => ({ ...filters, datePreset: timeRange, from: timeRange === "custom" ? from : undefined, to: timeRange === "custom" ? to : undefined }), [filters, timeRange, from, to]);
  const query = useMemo<CustomerRankingQuery>(() => ({
    search: search || undefined,
    minProductCount: kind === "productCount" && range.min ? Number(range.min) : undefined,
    maxProductCount: kind === "productCount" && range.max ? Number(range.max) : undefined,
    minContractValue: kind === "contractValue" && range.min ? Number(range.min) * 1_000_000_000 : undefined,
    maxContractValue: kind === "contractValue" && range.max ? Number(range.max) * 1_000_000_000 : undefined,
    sortBy, sortDirection, page, pageSize,
  }), [kind, search, range, sortBy, sortDirection, page]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getCustomerRankings(kind, effectiveFilters, query, controller.signal).then(setData).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải bảng xếp hạng"); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [kind, effectiveFilters, query, reloadKey]);

  function changeKind(next: CustomerRankingKind) {
    setKind(next); setSortBy(reportConfig[next].defaultSort); setSortDirection("desc"); setRange({ min: "", max: "" }); setPage(1);
  }
  function sort(column: CustomerRankingSortKey) {
    if (sortBy === column) setSortDirection((value) => value === "asc" ? "desc" : "asc");
    else { setSortBy(column); setSortDirection("desc"); }
    setPage(1);
  }
  function resetFilters() {
    setTimeRange("30d"); setFrom(initialRange.from); setTo(initialRange.to); setSearch(""); setRange({ min: "", max: "" }); setPage(1);
  }

  const summary = data?.summary;
  const pagination = data?.pagination;
  const startRow = pagination && pagination.totalRows ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endRow = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.totalRows) : 0;

  return <section aria-labelledby="ranking-reports-title"><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-indigo-600" /><div><h2 id="ranking-reports-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Bảng xếp hạng khách hàng</h2><p className="mt-1 text-xs text-slate-500">Xác định nhóm khách hàng dẫn đầu theo sản lượng mua và giá trị giao dịch</p></div></div>
    <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200/90 bg-white p-0 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.035)]">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-4 pt-4 lg:flex-row lg:items-end lg:px-5">
        <div className="flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Loại bảng xếp hạng">{(Object.keys(reportConfig) as CustomerRankingKind[]).map((item) => <button key={item} type="button" role="tab" aria-selected={kind === item} className={`relative whitespace-nowrap px-3 pb-4 pt-2 text-sm font-medium ${kind === item ? "text-blue-700 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-blue-600" : "text-slate-600 hover:text-slate-950"}`} onClick={() => changeKind(item)}>{reportConfig[item].label}</button>)}</div>
        <div className="flex w-full gap-2 pb-4 lg:w-auto"><label className="relative min-w-0 flex-1 lg:w-72"><span className="sr-only">Tìm khách hàng</span><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4.5" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tên hoặc số điện thoại" className={`${fieldClass} !pl-11 !pr-4`} /></label><Button variant="outline" className={`h-10 gap-2 rounded-xl ${filtersOpen ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white"}`} onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}><Filter className="size-4.5" /> Bộ lọc</Button></div>
      </div>

      {filtersOpen && <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1fr_auto] xl:items-end lg:p-5"><label className="grid gap-1.5"><span className="text-xs font-semibold text-slate-600">Thời gian</span><select value={timeRange} onChange={(event) => { setTimeRange(event.target.value as DatePreset); setPage(1); }} className={selectClass}>{timeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{timeRange === "custom" ? <div className="grid grid-cols-2 gap-2"><label className="grid gap-1.5"><span className="text-xs font-semibold text-slate-600">Từ ngày</span><Input type="date" value={from} max={to} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className={fieldClass} /></label><label className="grid gap-1.5"><span className="text-xs font-semibold text-slate-600">Đến ngày</span><Input type="date" value={to} min={from} onChange={(event) => { setTo(event.target.value); setPage(1); }} className={fieldClass} /></label></div> : <div className="hidden xl:block" />}<div className="grid grid-cols-2 gap-2"><label className="grid gap-1.5"><span className="text-xs font-semibold text-slate-600">{kind === "productCount" ? "SL tối thiểu" : "Từ (tỷ đồng)"}</span><Input type="number" min="0" value={range.min} onChange={(event) => { setRange((current) => ({ ...current, min: event.target.value })); setPage(1); }} placeholder="Từ" className={fieldClass} /></label><label className="grid gap-1.5"><span className="text-xs font-semibold text-slate-600">{kind === "productCount" ? "SL tối đa" : "Đến (tỷ đồng)"}</span><Input type="number" min={range.min || "0"} value={range.max} onChange={(event) => { setRange((current) => ({ ...current, max: event.target.value })); setPage(1); }} placeholder="Đến" className={fieldClass} /></label></div><Button variant="ghost" className="h-10 gap-1.5 rounded-xl text-slate-600" onClick={resetFilters}><RestartAltRounded sx={{ fontSize: 18 }} /> Đặt lại</Button></div>}

      <div className="grid border-b border-slate-200 bg-white sm:grid-cols-3">{kind === "productCount" ? <><SummaryItem label="Tổng khách hàng" value={summary ? number(summary.totalCustomers) : "—"} /><SummaryItem label="Tổng sản phẩm" value={summary ? number(summary.totalProducts) : "—"} /><SummaryItem label="Tổng giá trị hợp đồng" value={summary ? money(summary.totalContractValue) : "—"} /></> : <><SummaryItem label="Tổng khách hàng" value={summary ? number(summary.totalCustomers) : "—"} /><SummaryItem label="Tổng giá trị giao dịch" value={summary ? money(summary.totalContractValue) : "—"} /><SummaryItem label="Giá trị trung bình" value={summary ? money(summary.averageContractValue) : "—"} /></>}</div>

      {error ? <div role="alert" className="flex min-h-72 flex-col items-center justify-center gap-3 bg-red-50/50 px-6 text-center text-sm text-red-800"><span>Không thể tải bảng xếp hạng. {error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={() => setReloadKey((value) => value + 1)}><RotateCw className="size-4" /> Thử lại</Button></div> : loading && !data ? <div className="space-y-3 p-5" aria-label="Đang tải bảng xếp hạng">{Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-11 w-full rounded-lg" />)}</div> : data?.rows.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><Trophy className="size-6 text-slate-500" /></div><h3 className="mt-4 text-sm font-semibold text-slate-900">Không có khách hàng phù hợp</h3><p className="mt-1 text-xs text-slate-500">Hãy thay đổi thời gian, từ khóa hoặc khoảng giá trị.</p><Button variant="outline" size="sm" className="mt-4 rounded-xl" onClick={resetFilters}>Đặt lại bộ lọc</Button></div> : <div className={loading ? "opacity-55" : ""} aria-busy={loading}><div className="max-h-[520px] overflow-auto"><table className="w-full min-w-[1120px] border-collapse text-sm"><thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_#e2e8f0]"><tr><th className="w-16 px-4 py-3 text-left text-xs font-semibold text-slate-500">Hạng</th><th className="px-3 py-3 text-left"><SortButton label="Mã KH" column="customerCode" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th><th className="px-3 py-3 text-left"><SortButton label="Khách hàng" column="customerName" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th><th className="px-3 py-3 text-left"><SortButton label="Số điện thoại" column="phoneNumber" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th>{kind === "productCount" ? <><th className="px-3 py-3 text-right"><SortButton label="Sản phẩm" column="productCount" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th><th className="px-3 py-3 text-right"><SortButton label="Giá trị hợp đồng" column="contractValue" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th></> : <><th className="px-3 py-3 text-right"><SortButton label="Giá trị giao dịch" column="contractValue" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th><th className="px-3 py-3 text-right"><SortButton label="Sản phẩm" column="productCount" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th></>}<th className="px-3 py-3 text-right"><SortButton label="Giá trị TB/SP" column="averageProductValue" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th><th className="px-4 py-3 text-right"><SortButton label="Mua gần nhất" column="lastPurchaseDate" sortBy={sortBy} direction={sortDirection} onSort={sort} /></th></tr></thead><tbody>{data?.rows.map((row) => <tr key={row.customerCode} className="border-b border-slate-100 hover:bg-blue-50/35"><td className="px-4 py-3"><RankBadge rank={row.rank} /></td><td className="px-3 py-3 font-medium text-blue-700">{row.customerCode}</td><td className="px-3 py-3 font-semibold text-slate-900">{row.customerName}</td><td className="px-3 py-3 text-slate-600">{row.phoneNumber}</td>{kind === "productCount" ? <><td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">{number(row.productCount)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-700">{money(row.contractValue)}</td></> : <><td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-900">{money(row.contractValue)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-700">{number(row.productCount)}</td></>}<td className="px-3 py-3 text-right tabular-nums text-slate-700">{money(row.averageProductValue)}</td><td className="px-4 py-3 text-right text-slate-600">{new Date(row.lastPurchaseDate).toLocaleDateString("vi-VN")}</td></tr>)}</tbody></table></div></div>}

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 sm:flex-row lg:px-5"><span>Hiển thị {startRow}–{endRow} trong {pagination?.totalRows ?? 0} khách hàng</span><div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={!pagination || pagination.page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} aria-label="Trang trước"><ChevronLeft className="size-4.5" /></Button><span className="min-w-20 text-center font-medium text-slate-700">Trang {pagination?.page ?? 1} / {pagination?.totalPages ?? 1}</span><Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled={!pagination || pagination.page >= pagination.totalPages || loading} onClick={() => setPage((value) => value + 1)} aria-label="Trang sau"><ChevronRight className="size-4.5" /></Button></div></div>
    </Card>
  </section>;
}
