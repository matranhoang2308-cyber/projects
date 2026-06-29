import { useEffect, useState } from "react";
import {
  Building2,
  FileCheck,
  DollarSign,
  Users,
  Handshake,
  Home,
  Package,
  CircleDollarSign,
  Wallet,
  FileClock,
  Percent,
  User,
  TrendingDown,
  Receipt,
  RotateCw,
  Tag,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, Treemap, XAxis, YAxis, ZAxis } from "recharts";
import { DashboardFilters, getAgencyPerformance, getCustomerDemographics, getCustomerStructure, getProductCharts, getSalesInventorySummary, getSalesTrends, SalesInventorySummary, SalesTrendData, TrendGroup } from "./dashboardApi";
import { CustomerRankingReports } from "./CustomerRankingReports";

type Tone = "inventory" | "revenue" | "customer" | "warning" | "danger";
const toneStyles: Record<Tone, { icon: string; iconBg: string; accent: string }> = {
  inventory: { icon: "text-blue-700", iconBg: "bg-blue-50 border-blue-100", accent: "bg-blue-600" },
  revenue: { icon: "text-green-700", iconBg: "bg-green-50 border-green-100", accent: "bg-green-600" },
  customer: { icon: "text-violet-700", iconBg: "bg-violet-50 border-violet-100", accent: "bg-violet-600" },
  warning: { icon: "text-amber-700", iconBg: "bg-amber-50 border-amber-100", accent: "bg-amber-500" },
  danger: { icon: "text-red-700", iconBg: "bg-red-50 border-red-100", accent: "bg-red-600" },
};

const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
function money(value: number) {
  if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} nghìn tỷ`;
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  return `${number(value)} ₫`;
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: React.ElementType; tone: Tone }) {
  const style = toneStyles[tone];
  return <Card className="relative gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-5 shadow-sm"><span className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" /><p className="min-h-5 pr-12 text-xs font-medium leading-5 text-slate-500">{label}</p><p className="mt-3 whitespace-nowrap text-xl font-semibold leading-7 tabular-nums text-slate-950">{value}</p><p className="mt-1.5 text-[11px] leading-4 text-slate-400">{hint}</p><div className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border ${style.iconBg} ${style.icon}`}><Icon className="size-5" /></div></Card>;
}

function LoadingReport() {
  return <div className="space-y-7" aria-label="Đang tải báo cáo">{[5, 4, 7].map((count, group) => <section key={group}><Skeleton className="mb-2 h-5 w-28" /><Skeleton className="mb-4 h-3 w-64" /><div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${count === 5 ? "xl:grid-cols-5" : ""}`}>{Array.from({ length: count }).map((_, i) => <Card key={i} className="rounded-2xl border-slate-200 p-5 shadow-none"><Skeleton className="h-3 w-24" /><Skeleton className="mt-5 h-7 w-28" /><Skeleton className="mt-2 h-3 w-20" /></Card>)}</div></section>)}</div>;
}

function EmptyReport() {
  return <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><Package className="size-5.5 text-slate-500" /></div><h2 className="mt-4 text-base font-semibold text-slate-900">Không có dữ liệu phù hợp</h2><p className="mt-1 text-sm text-slate-500">Hãy thay đổi bộ lọc để xem dữ liệu.</p></section>;
}

const axisStyle = { fontSize: 11, fill: "#64748b" };
type UnsoldGroup = "zone" | "productType";
const unsoldGroupOptions: Array<{ value: UnsoldGroup; label: string }> = [
  { value: "zone", label: "Theo block tháp" },
  { value: "productType", label: "Theo loại sản phẩm" },
];
const chartSelectClass = "crm-native-select h-9 min-w-[164px] rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const trendGroupOptions: Array<{ value: TrendGroup; label: string }> = [
  { value: "day", label: "Theo ngày" },
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
  { value: "custom", label: "Khoảng thời gian" },
];
const dateInputClass = "h-9 min-w-0 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function defaultTrendRange() {
  const to = new Date();
  const from = new Date(to); from.setDate(from.getDate() - 30);
  return { from: inputDate(from), to: inputDate(to) };
}

type TimedLoader<T> = (filters: DashboardFilters, signal?: AbortSignal) => Promise<T>;
type TimedChartData<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  group: TrendGroup;
  from: string;
  to: string;
  setGroup: (value: TrendGroup) => void;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  reload: () => void;
};

function timedFilters(filters: DashboardFilters, group: TrendGroup, from: string, to: string): DashboardFilters {
  const datePreset = group === "day" ? "today" : group === "week" ? "7d" : group === "month" ? "30d" : group === "year" ? "year" : "custom";
  return { ...filters, datePreset, from: group === "custom" ? from : undefined, to: group === "custom" ? to : undefined };
}

function useTimedChartData<T>(filters: DashboardFilters, loader: TimedLoader<T>): TimedChartData<T> {
  const range = defaultTrendRange();
  const [group, setGroup] = useState<TrendGroup>("day");
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    loader(timedFilters(filters, group, from, to), controller.signal).then(setData).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu biểu đồ"); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, loader, group, from, to, reloadKey]);
  return { data, loading, error, group, from, to, setGroup, setFrom, setTo, reload: () => setReloadKey((value) => value + 1) };
}

function ChartTimeControl<T>({ chartName, state }: { chartName: string; state: TimedChartData<T> }) {
  return <div className="grid gap-2"><select aria-label={`Thời gian - ${chartName}`} className={chartSelectClass} value={state.group} onChange={(event) => state.setGroup(event.target.value as TrendGroup)}>{trendGroupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{state.group === "custom" && <div className="grid grid-cols-2 gap-2"><input aria-label={`Ngày bắt đầu - ${chartName}`} className={dateInputClass} type="date" value={state.from} max={state.to} onChange={(event) => state.setFrom(event.target.value)} /><input aria-label={`Ngày kết thúc - ${chartName}`} className={dateInputClass} type="date" value={state.to} min={state.from} onChange={(event) => state.setTo(event.target.value)} /></div>}</div>;
}

function TimedSectionError({ states, label }: { states: Array<TimedChartData<unknown>>; label: string }) {
  const failed = states.filter((state) => state.error);
  if (!failed.length) return null;
  return <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>Không thể tải {label}. {failed[0].error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={() => failed.forEach((state) => state.reload())}><RotateCw className="size-4" /> Thử lại</Button></div>;
}

function ChartCard({ title, description, legend, headerAction, children }: { title: string; description: string; legend: React.ReactNode; headerAction?: React.ReactNode; children: React.ReactNode }) {
  return <Card className="gap-0 rounded-2xl border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.035)]"><div className="flex min-h-[58px] flex-col items-start justify-between gap-4 sm:flex-row"><div className="min-w-0"><h3 className="text-sm font-semibold tracking-[-0.01em] text-slate-950">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>{headerAction && <div className="w-full shrink-0 sm:w-auto">{headerAction}</div>}</div><div className="mt-4 h-[270px] min-w-0">{children}</div><div className="mt-4 flex min-h-5 flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">{legend}</div></Card>;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />{label}</span>;
}

function ChartSkeleton() {
  return <Card className="rounded-2xl border-slate-200 p-5 shadow-none"><Skeleton className="h-4 w-44" /><Skeleton className="mt-2 h-3 w-64 max-w-full" /><div className="mt-6 flex h-[270px] items-end gap-3 border-b border-l border-slate-100 px-4 pb-1">{[42, 68, 54, 86].map((height) => <Skeleton key={height} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />)}</div><Skeleton className="mt-5 h-3 w-32" /></Card>;
}

function EmptyChart({ title }: { title: string }) {
  return <Card className="flex min-h-[390px] flex-col items-center justify-center rounded-2xl border-dashed border-slate-300 p-6 text-center shadow-none"><BarChart3 className="size-7 text-slate-400" /><h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3><p className="mt-1 text-xs text-slate-500">Không có dữ liệu theo bộ lọc hiện tại.</p></Card>;
}

function ProductChartsSection({ filters }: { filters: DashboardFilters }) {
  const [unsoldGroup, setUnsoldGroup] = useState<UnsoldGroup>("zone");
  const unsoldState = useTimedChartData(filters, getProductCharts);
  const valueState = useTimedChartData(filters, getProductCharts);
  const statusState = useTimedChartData(filters, getProductCharts);
  const heatState = useTimedChartData(filters, getProductCharts);
  const states = [unsoldState, valueState, statusState, heatState];
  if (states.some((state) => state.error)) return <TimedSectionError states={states} label="biểu đồ sản phẩm" />;
  if (states.some((state) => !state.data)) return <section aria-label="Đang tải biểu đồ sản phẩm"><div className="mb-4"><Skeleton className="h-5 w-40" /><Skeleton className="mt-2 h-3 w-72" /></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <ChartSkeleton key={index} />)}</div></section>;

  const unsoldData = unsoldState.data!;
  const valueData = valueState.data!;
  const statusData = statusState.data!;
  const heatData = heatState.data!;
  const maxHeatValue = Math.max(1, ...heatData.zoneStatusMatrix.flatMap((item) => [item.sold, item.available]));
  const unsoldChart = unsoldGroup === "zone"
    ? { title: "Sản phẩm chưa bán theo block tháp", description: "Số lượng sản phẩm còn lại trong từng block tháp", data: unsoldData.availableByZone.map((item) => ({ label: item.zone, count: item.count })) }
    : { title: "Sản phẩm chưa bán theo loại sản phẩm", description: "Số lượng sản phẩm còn lại theo từng loại sản phẩm", data: unsoldData.availableByProductType.map((item) => ({ label: item.productType, count: item.count })) };
  const availableTotal = unsoldChart.data.reduce((sum, item) => sum + item.count, 0);
  const productValueTotal = valueData.valueByProductType.reduce((sum, item) => sum + item.value, 0);
  const statusTotal = statusData.salesStatus.reduce((sum, item) => sum + item.value, 0);
  const heatTotal = heatData.zoneStatusMatrix.reduce((sum, item) => sum + item.sold + item.available, 0);

  return <section className={states.some((state) => state.loading) ? "pointer-events-none opacity-60" : ""} aria-labelledby="product-charts-title" aria-busy={states.some((state) => state.loading)}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id="product-charts-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Phân tích sản phẩm</h2><p className="mt-1 text-xs text-slate-500">So sánh quy mô, giá trị và tình trạng bán theo cơ cấu giỏ hàng</p></div></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <ChartCard title={unsoldChart.title} description={unsoldChart.description} headerAction={<div className="flex flex-wrap items-center justify-end gap-3"><select aria-label="Nhóm dữ liệu" className={chartSelectClass} value={unsoldGroup} onChange={(event) => setUnsoldGroup(event.target.value as UnsoldGroup)}>{unsoldGroupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChartTimeControl chartName="Sản phẩm chưa bán" state={unsoldState} /></div>} legend={<LegendItem color="#2563eb" label="Sản phẩm chưa bán" />}>{availableTotal === 0 ? <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">Không có sản phẩm chưa bán theo nhóm dữ liệu này.</div> : <ResponsiveContainer width="100%" height="100%"><BarChart data={unsoldChart.data} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} interval={0} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Chưa bán"]} /><Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false} /></BarChart></ResponsiveContainer>}</ChartCard>
    {productValueTotal === 0 ? <EmptyChart title="Không có giá trị sản phẩm" /> : <ChartCard title="Giá trị theo loại sản phẩm" description="Tổng giá trị giỏ hàng, phân nhóm theo loại sản phẩm" headerAction={<ChartTimeControl chartName="Giá trị theo loại sản phẩm" state={valueState} />} legend={<LegendItem color="#059669" label="Giá trị sản phẩm" />}><ResponsiveContainer width="100%" height="100%"><BarChart data={valueData.valueByProductType} layout="vertical" margin={{ top: 8, right: 18, left: 12, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000_000)} tỷ`} /><YAxis dataKey="productType" type="category" width={68} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Giá trị"]} /><Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} maxBarSize={34} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>}
    {statusTotal === 0 ? <EmptyChart title="Không có dữ liệu tình trạng bán" /> : <ChartCard title="Cơ cấu đã bán / chưa bán" description="Tỷ trọng sản phẩm theo trạng thái bán hiện tại" headerAction={<ChartTimeControl chartName="Cơ cấu tình trạng bán" state={statusState} />} legend={<>{statusData.salesStatus.map((item) => <LegendItem key={item.name} color={item.fill} label={`${item.name}: ${number(item.value)}`} />)}</>}><ResponsiveContainer width="100%" height="100%"><Treemap data={statusData.salesStatus} dataKey="value" nameKey="name" stroke="#ffffff" aspectRatio={1.75} content={(props) => { const { x = 0, y = 0, width = 0, height = 0, name, value, fill } = props; return <g><rect x={x} y={y} width={width} height={height} rx={8} fill={fill} stroke="#fff" strokeWidth={4} /><text x={x + 14} y={y + 26} fill="#fff" fontSize={13} fontWeight={600}>{name}</text><text x={x + 14} y={y + 47} fill="rgba(255,255,255,.86)" fontSize={12}>{number(Number(value))} sản phẩm</text></g>; }} /></ResponsiveContainer></ChartCard>}
    {heatTotal === 0 ? <EmptyChart title="Không có dữ liệu block tháp" /> : <ChartCard title="Block tháp × tình trạng bán" description="Mật độ sản phẩm theo block tháp và trạng thái bán" headerAction={<ChartTimeControl chartName="Block tháp và tình trạng bán" state={heatState} />} legend={<><LegendItem color="#dbeafe" label="Thấp" /><LegendItem color="#2563eb" label="Cao" /></>}><div className="grid h-full grid-cols-[minmax(92px,1.2fr)_repeat(2,minmax(76px,1fr))] content-center gap-2" role="table" aria-label="Mật độ sản phẩm theo block tháp và tình trạng bán"><span /><span className="pb-1 text-center text-[11px] font-semibold text-slate-500" role="columnheader">Đã bán</span><span className="pb-1 text-center text-[11px] font-semibold text-slate-500" role="columnheader">Chưa bán</span>{heatData.zoneStatusMatrix.map((item) => <div className="contents" key={item.zone}><span className="flex items-center text-xs font-medium text-slate-600" role="rowheader">{item.zone}</span>{([item.sold, item.available] as number[]).map((value, index) => { const alpha = 0.12 + value / maxHeatValue * 0.88; return <div key={index} role="cell" aria-label={`${item.zone}, ${index === 0 ? "Đã bán" : "Chưa bán"}: ${value}`} className="flex h-12 items-center justify-center rounded-lg text-xs font-semibold tabular-nums" style={{ backgroundColor: `rgba(37,99,235,${alpha})`, color: alpha > 0.55 ? "white" : "#1e3a8a" }}>{number(value)}</div>; })}</div>)}</div></ChartCard>}
  </div></section>;
}

function useSalesTrendSeries(filters: DashboardFilters, group: TrendGroup, from: string, to: string) {
  const [data, setData] = useState<SalesTrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getSalesTrends(filters, group, group === "custom" ? from : undefined, group === "custom" ? to : undefined, controller.signal).then(setData).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải xu hướng bán hàng"); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, group, from, to, reloadKey]);
  return { data, loading, error, reload: () => setReloadKey((value) => value + 1) };
}

function TrendSelect({ chartName, value, onChange }: { chartName: string; value: TrendGroup; onChange: (value: TrendGroup) => void }) {
  return <select aria-label={`Thời gian - ${chartName}`} className={chartSelectClass} value={value} onChange={(event) => onChange(event.target.value as TrendGroup)}>{trendGroupOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>;
}

function TrendRange({ chartName, from, to, onFromChange, onToChange }: { chartName: string; from: string; to: string; onFromChange: (value: string) => void; onToChange: (value: string) => void }) {
  return <div className="mb-3 grid h-10 grid-cols-2 gap-2"><input aria-label={`Ngày bắt đầu - ${chartName}`} className={dateInputClass} type="date" value={from} max={to} onChange={(event) => onFromChange(event.target.value)} /><input aria-label={`Ngày kết thúc - ${chartName}`} className={dateInputClass} type="date" value={to} min={from} onChange={(event) => onToChange(event.target.value)} /></div>;
}

function TrendState({ loading, error, emptyText, onRetry, children }: { loading: boolean; error: string | null; emptyText: string; onRetry: () => void; children: React.ReactNode }) {
  if (error) return <div role="alert" className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-red-50 px-4 text-center text-xs text-red-800"><span>Không thể tải dữ liệu. {error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={onRetry}><RotateCw className="size-4" /> Thử lại</Button></div>;
  if (loading && !children) return <div className="flex h-full items-end gap-3 border-b border-l border-slate-100 px-4 pb-1">{[38, 62, 48, 78, 66, 88].map((height) => <Skeleton key={height} className="flex-1 rounded-t-md" style={{ height: `${height}%` }} />)}</div>;
  if (!children) return <div className="flex h-full items-center justify-center px-6 text-center text-xs text-slate-500">{emptyText}</div>;
  return <div className={loading ? "h-full opacity-50" : "h-full"}>{children}</div>;
}

function SalesTrendSection({ filters }: { filters: DashboardFilters }) {
  const initialRange = defaultTrendRange();
  const [soldGroup, setSoldGroup] = useState<TrendGroup>("day");
  const [valueGroup, setValueGroup] = useState<TrendGroup>("day");
  const [soldFrom, setSoldFrom] = useState(initialRange.from);
  const [soldTo, setSoldTo] = useState(initialRange.to);
  const [valueFrom, setValueFrom] = useState(initialRange.from);
  const [valueTo, setValueTo] = useState(initialRange.to);
  const soldSeries = useSalesTrendSeries(filters, soldGroup, soldFrom, soldTo);
  const valueSeries = useSalesTrendSeries(filters, valueGroup, valueFrom, valueTo);
  const soldTotal = soldSeries.data?.points.reduce((sum, point) => sum + point.soldProductCount, 0) ?? 0;
  const salesTotal = valueSeries.data?.points.reduce((sum, point) => sum + point.salesValue, 0) ?? 0;
  const soldChart = soldTotal > 0 && soldSeries.data ? <ResponsiveContainer width="100%" height="100%"><LineChart data={soldSeries.data.points} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [number(Number(value)), "Sản phẩm đã bán"]} /><Line type="monotone" dataKey="soldProductCount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer> : null;
  const valueChart = salesTotal > 0 && valueSeries.data ? <ResponsiveContainer width="100%" height="100%"><LineChart data={valueSeries.data.points} margin={{ top: 8, right: 12, left: 2, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000_000)} tỷ`} width={48} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [money(Number(value)), "Giá trị bán hàng"]} /><Line type="monotone" dataKey="salesValue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer> : null;

  return <section aria-labelledby="sales-trends-title"><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id="sales-trends-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Xu hướng bán hàng</h2><p className="mt-1 text-xs text-slate-500">Theo dõi biến động số lượng sản phẩm bán và giá trị bán hàng theo thời gian</p></div></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <ChartCard title="Sản phẩm bán theo thời gian" description="Số lượng sản phẩm đã bán theo từng mốc thời gian" headerAction={<TrendSelect chartName="Sản phẩm bán" value={soldGroup} onChange={setSoldGroup} />} legend={<LegendItem color="#2563eb" label={`Sản phẩm đã bán: ${number(soldTotal)}`} />}><>{soldGroup === "custom" && <TrendRange chartName="Sản phẩm bán" from={soldFrom} to={soldTo} onFromChange={setSoldFrom} onToChange={setSoldTo} />}<div className={soldGroup === "custom" ? "h-[214px]" : "h-full"}><TrendState loading={soldSeries.loading} error={soldSeries.error} emptyText="Không có sản phẩm bán trong khoảng thời gian này." onRetry={soldSeries.reload}>{soldChart}</TrendState></div></></ChartCard>
    <ChartCard title="Giá trị bán hàng theo thời gian" description="Tổng giá trị sản phẩm đã bán theo từng mốc thời gian" headerAction={<TrendSelect chartName="Giá trị bán hàng" value={valueGroup} onChange={setValueGroup} />} legend={<LegendItem color="#16a34a" label={`Tổng giá trị: ${money(salesTotal)}`} />}><>{valueGroup === "custom" && <TrendRange chartName="Giá trị bán hàng" from={valueFrom} to={valueTo} onFromChange={setValueFrom} onToChange={setValueTo} />}<div className={valueGroup === "custom" ? "h-[214px]" : "h-full"}><TrendState loading={valueSeries.loading} error={valueSeries.error} emptyText="Không có giá trị bán hàng trong khoảng thời gian này." onRetry={valueSeries.reload}>{valueChart}</TrendState></div></></ChartCard>
  </div></section>;
}

function AgencyPerformanceSection({ filters }: { filters: DashboardFilters }) {
  const valueState = useTimedChartData(filters, getAgencyPerformance);
  const countState = useTimedChartData(filters, getAgencyPerformance);
  const scatterState = useTimedChartData(filters, getAgencyPerformance);
  const funnelState = useTimedChartData(filters, getAgencyPerformance);
  const states = [valueState, countState, scatterState, funnelState];
  if (states.some((state) => state.error)) return <TimedSectionError states={states} label="hiệu suất đơn vị phân phối" />;
  if (states.some((state) => !state.data)) return <section aria-label="Đang tải hiệu suất đơn vị phân phối"><div className="mb-4"><Skeleton className="h-5 w-52" /><Skeleton className="mt-2 h-3 w-80" /></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <ChartSkeleton key={index} />)}</div></section>;

  const valueData = valueState.data!;
  const countData = countState.data!;
  const scatterData = scatterState.data!;
  const funnelData = funnelState.data!;
  const transactionValue = valueData.agencies.reduce((sum, item) => sum + item.transactionValue, 0);
  const transactionCount = countData.agencies.reduce((sum, item) => sum + item.transactionCount, 0);
  const scatterCount = scatterData.agencies.reduce((sum, item) => sum + item.transactionCount, 0);
  const funnelStart = funnelData.funnel[0]?.count ?? 0;
  const funnelEnd = funnelData.funnel[funnelData.funnel.length - 1]?.count ?? 0;
  const conversion = funnelStart ? funnelEnd / funnelStart * 100 : 0;
  return <section className={states.some((state) => state.loading) ? "pointer-events-none opacity-60" : ""} aria-labelledby="agency-performance-title" aria-busy={states.some((state) => state.loading)}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id="agency-performance-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Hiệu suất đơn vị phân phối</h2><p className="mt-1 text-xs text-slate-500">So sánh quy mô giao dịch, giá trị và hiệu quả chuyển đổi theo đơn vị phân phối</p></div></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {transactionValue === 0 ? <EmptyChart title="Không có giá trị giao dịch theo đơn vị" /> : <ChartCard title="Giá trị giao dịch theo đơn vị phân phối" description="Tổng giá trị giao dịch ghi nhận theo từng đơn vị phân phối" headerAction={<ChartTimeControl chartName="Giá trị giao dịch" state={valueState} />} legend={<LegendItem color="#16a34a" label={`Tổng giá trị: ${money(transactionValue)}`} />}><ResponsiveContainer width="100%" height="100%"><BarChart data={valueData.agencies} layout="vertical" margin={{ top: 8, right: 16, left: 24, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000_000)} tỷ`} /><YAxis dataKey="agency" type="category" width={104} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Giá trị giao dịch"]} /><Bar dataKey="transactionValue" fill="#16a34a" radius={[0, 6, 6, 0]} maxBarSize={30} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>}
    {transactionCount === 0 ? <EmptyChart title="Không có giao dịch theo đơn vị" /> : <ChartCard title="Số giao dịch theo đơn vị phân phối" description="Khối lượng giao dịch phát sinh theo từng đơn vị phân phối" headerAction={<ChartTimeControl chartName="Số giao dịch" state={countState} />} legend={<LegendItem color="#2563eb" label={`Tổng giao dịch: ${number(transactionCount)}`} />}><ResponsiveContainer width="100%" height="100%"><BarChart data={countData.agencies} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="agency" tick={axisStyle} tickLine={false} axisLine={false} interval={0} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Giao dịch"]} /><Bar dataKey="transactionCount" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>}
    {scatterCount === 0 ? <EmptyChart title="Không có dữ liệu tương quan giao dịch" /> : <ChartCard title="Số lượng giao dịch × giá trị" description="Tương quan giữa khối lượng và tổng giá trị giao dịch của từng đơn vị" headerAction={<ChartTimeControl chartName="Tương quan giao dịch" state={scatterState} />} legend={<LegendItem color="#7c3aed" label="Mỗi điểm là một đơn vị phân phối" />}><ResponsiveContainer width="100%" height="100%"><ScatterChart margin={{ top: 12, right: 18, left: 8, bottom: 8 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis type="number" dataKey="transactionCount" name="Số giao dịch" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis type="number" dataKey="transactionValue" name="Giá trị" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000_000)} tỷ`} width={48} /><ZAxis type="number" dataKey="transactionValue" range={[90, 260]} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value, name) => [name === "Giá trị" ? money(Number(value)) : number(Number(value)), name]} /><Scatter data={scatterData.agencies} fill="#7c3aed" isAnimationActive={false} /></ScatterChart></ResponsiveContainer></ChartCard>}
    {funnelStart === 0 ? <EmptyChart title="Không có dữ liệu phễu bán hàng" /> : <ChartCard title="Phễu bán hàng" description="Mức chuyển đổi từ giỏ hàng đến hợp đồng" headerAction={<ChartTimeControl chartName="Phễu bán hàng" state={funnelState} />} legend={<LegendItem color="#0891b2" label={`Tỷ lệ chuyển đổi: ${conversion.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`} />}><ResponsiveContainer width="100%" height="100%"><FunnelChart><Tooltip formatter={(value) => [number(Number(value)), "Số lượng"]} /><Funnel dataKey="count" data={funnelData.funnel} isAnimationActive={false}><LabelList position="right" fill="#475569" stroke="none" dataKey="stage" /></Funnel></FunnelChart></ResponsiveContainer></ChartCard>}
  </div></section>;
}

function CustomerStructureSection({ filters }: { filters: DashboardFilters }) {
  const groupState = useTimedChartData(filters, getCustomerStructure);
  const valueState = useTimedChartData(filters, getCustomerStructure);
  const states = [groupState, valueState];
  if (states.some((state) => state.error)) return <TimedSectionError states={states} label="cơ cấu khách hàng" />;
  if (states.some((state) => !state.data)) return <section aria-label="Đang tải cơ cấu khách hàng"><div className="mb-4"><Skeleton className="h-5 w-40" /><Skeleton className="mt-2 h-3 w-72" /></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><ChartSkeleton /><ChartSkeleton /></div></section>;

  const groupData = groupState.data!;
  const valueData = valueState.data!;
  const totalCustomers = groupData.groups.reduce((sum, item) => sum + item.count, 0);
  const totalContractValue = valueData.groups.reduce((sum, item) => sum + item.contractValue, 0);
  const groupLegend = <>{groupData.groups.map((item) => <LegendItem key={item.customerGroup} color={item.fill} label={`${item.customerGroup}: ${number(item.count)}`} />)}</>;
  return <section className={states.some((state) => state.loading) ? "pointer-events-none opacity-60" : ""} aria-labelledby="customer-structure-title" aria-busy={states.some((state) => state.loading)}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id="customer-structure-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Cơ cấu khách hàng</h2><p className="mt-1 text-xs text-slate-500">Phân tích quy mô và giá trị hợp đồng theo từng nhóm khách hàng</p></div></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {totalCustomers === 0 ? <EmptyChart title="Không có dữ liệu nhóm khách hàng" /> : <ChartCard title="Phân bổ nhóm khách hàng" description="Tỷ trọng khách hàng thuộc từng nhóm hiện tại" headerAction={<ChartTimeControl chartName="Phân bổ nhóm khách hàng" state={groupState} />} legend={groupLegend}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => { const percentage = totalCustomers ? Number(value) / totalCustomers * 100 : 0; return [`${number(Number(value))} (${percentage.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`, item.payload.customerGroup]; }} /><Pie data={groupData.groups} dataKey="count" nameKey="customerGroup" cx="50%" cy="48%" innerRadius={68} outerRadius={104} paddingAngle={2} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{groupData.groups.map((item) => <Cell key={item.customerGroup} fill={item.fill} />)}</Pie><text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="22" fontWeight="700">{number(totalCustomers)}</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11">khách hàng</text></PieChart></ResponsiveContainer></ChartCard>}
    {totalContractValue === 0 ? <EmptyChart title="Không có giá trị hợp đồng theo nhóm" /> : <ChartCard title="Giá trị hợp đồng theo nhóm khách hàng" description="Tổng giá trị hợp đồng đóng góp bởi từng nhóm khách hàng" headerAction={<ChartTimeControl chartName="Giá trị hợp đồng theo nhóm" state={valueState} />} legend={<LegendItem color="#7c3aed" label={`Tổng giá trị: ${money(totalContractValue)}`} />}><ResponsiveContainer width="100%" height="100%"><BarChart data={valueData.groups} layout="vertical" margin={{ top: 8, right: 18, left: 18, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000_000)} tỷ`} /><YAxis dataKey="customerGroup" type="category" width={96} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Giá trị hợp đồng"]} /><Bar dataKey="contractValue" radius={[0, 6, 6, 0]} maxBarSize={32} isAnimationActive={false}>{valueData.groups.map((item) => <Cell key={item.customerGroup} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer></ChartCard>}
  </div></section>;
}

function CustomerDemographicsSection({ filters }: { filters: DashboardFilters }) {
  const genderState = useTimedChartData(filters, getCustomerDemographics);
  const ageState = useTimedChartData(filters, getCustomerDemographics);
  const provinceState = useTimedChartData(filters, getCustomerDemographics);
  const states = [genderState, ageState, provinceState];
  if (states.some((state) => state.error)) return <TimedSectionError states={states} label="dữ liệu nhân khẩu học" />;
  if (states.some((state) => !state.data)) return <section aria-label="Đang tải dữ liệu nhân khẩu học"><div className="mb-4"><Skeleton className="h-5 w-44" /><Skeleton className="mt-2 h-3 w-80 max-w-full" /></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{Array.from({ length: 3 }).map((_, index) => <ChartSkeleton key={index} />)}</div></section>;

  const genderData = genderState.data!;
  const ageData = ageState.data!;
  const provinceData = provinceState.data!;
  const genderTotal = genderData.genders.reduce((sum, item) => sum + item.count, 0);
  const ageTotal = ageData.ageRanges.reduce((sum, item) => sum + item.count, 0);
  const provinceTotal = provinceData.provinces.reduce((sum, item) => sum + item.count, 0);
  return <section className={states.some((state) => state.loading) ? "pointer-events-none opacity-60" : ""} aria-labelledby="customer-demographics-title" aria-busy={states.some((state) => state.loading)}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id="customer-demographics-title" className="text-base font-semibold tracking-[-0.01em] text-slate-950">Nhân khẩu học khách hàng</h2><p className="mt-1 text-xs text-slate-500">Phân tích cơ cấu giới tính, độ tuổi và khu vực cư trú của khách hàng</p></div></div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    {genderTotal === 0 ? <EmptyChart title="Không có dữ liệu giới tính" /> : <ChartCard title="Phân bổ giới tính" description="Tỷ trọng khách hàng theo giới tính đã ghi nhận" headerAction={<ChartTimeControl chartName="Phân bổ giới tính" state={genderState} />} legend={<>{genderData.genders.map((item) => <LegendItem key={item.gender} color={item.fill} label={`${item.gender}: ${number(item.count)}`} />)}</>}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => { const percentage = genderTotal ? Number(value) / genderTotal * 100 : 0; return [`${number(Number(value))} (${percentage.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`, item.payload.gender]; }} /><Pie data={genderData.genders} dataKey="count" nameKey="gender" cx="50%" cy="48%" innerRadius={68} outerRadius={104} paddingAngle={2} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{genderData.genders.map((item) => <Cell key={item.gender} fill={item.fill} />)}</Pie><text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="22" fontWeight="700">{number(genderTotal)}</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11">khách hàng</text></PieChart></ResponsiveContainer></ChartCard>}
    {ageTotal === 0 ? <EmptyChart title="Không có dữ liệu độ tuổi" /> : <ChartCard title="Phân bổ độ tuổi" description="Số khách hàng trong từng khoảng tuổi" headerAction={<ChartTimeControl chartName="Phân bổ độ tuổi" state={ageState} />} legend={<LegendItem color="#0891b2" label={`Tổng có dữ liệu tuổi: ${number(ageTotal)}`} />}><ResponsiveContainer width="100%" height="100%"><BarChart data={ageData.ageRanges} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="ageRange" tick={axisStyle} tickLine={false} axisLine={false} interval={0} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Khách hàng"]} /><Bar dataKey="count" fill="#0891b2" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>}
    {provinceTotal === 0 ? <EmptyChart title="Không có dữ liệu tỉnh/thành" /> : <ChartCard title="Khách hàng theo tỉnh/thành" description="Phân bổ khách hàng theo tỉnh/thành cư trú" headerAction={<ChartTimeControl chartName="Khách hàng theo tỉnh thành" state={provinceState} />} legend={<LegendItem color="#7c3aed" label={`Tổng khách hàng: ${number(provinceTotal)}`} />}><ResponsiveContainer width="100%" height="100%"><BarChart data={provinceData.provinces} layout="vertical" margin={{ top: 4, right: 16, left: 30, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><YAxis dataKey="province" type="category" width={112} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Khách hàng"]} /><Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} maxBarSize={22} isAnimationActive={false} /></BarChart></ResponsiveContainer></ChartCard>}
  </div></section>;
}

export function SalesInventoryReport({ filters }: { filters: DashboardFilters }) {
  const [data, setData] = useState<SalesInventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(null);
    getSalesInventorySummary(filters, controller.signal).then(setData).catch((reason: unknown) => { if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Không thể tải dữ liệu báo cáo"); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, reloadKey]);

  if (error) return <div role="alert" className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>Không thể tải báo cáo. {error}</span><Button variant="outline" size="sm" className="gap-1.5 border-red-200 bg-white" onClick={() => setReloadKey((v) => v + 1)}><RotateCw className="size-4" /> Thử lại</Button></div>;
  if (!data) return <LoadingReport />;
  if (data.inventory.totalProducts === 0 && data.transactions.totalTransactions === 0 && data.customers.totalCustomers === 0) return <EmptyReport />;

  const sections: Array<{ title: string; description: string; tone: Tone; items: Array<[string, string, string, React.ElementType, Tone]> }> = [
    { title: "Giỏ hàng", description: "Quy mô, giá trị và tình trạng phân phối sản phẩm", tone: "inventory", items: [["Tổng số sản phẩm", number(data.inventory.totalProducts), "COUNT(product)", Package, "inventory"], ["Tổng giá trị giỏ hàng", money(data.inventory.totalProductValue), "SUM(productValue)", CircleDollarSign, "revenue"], ["Sản phẩm đã bán", number(data.inventory.soldProducts), "Trạng thái: Đã bán", Tag, "inventory"], ["Sản phẩm chưa bán", number(data.inventory.availableProducts), "Trạng thái: Chưa bán", Home, "warning"], ["Tỷ lệ hấp thụ", `${data.inventory.absorptionRate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`, "Đã bán / Tổng sản phẩm", Percent, "inventory"]] },
    { title: "Giao dịch", description: "Khối lượng ráp căn và giá trị hợp đồng dự kiến", tone: "revenue", items: [["Tổng giao dịch ráp căn", number(data.transactions.totalTransactions), "COUNT(transaction)", Handshake, "revenue"], ["Tổng khách hàng", number(data.transactions.totalCustomers), "Khách hàng có giao dịch", Users, "customer"], ["Giá trị HDMB dự kiến", money(data.transactions.expectedContractValue), "SUM(expectedContractValue)", Receipt, "revenue"], ["Giá trị bình quân sản phẩm", money(data.transactions.averageProductValue), "AVG(productValue)", Building2, "revenue"]] },
    { title: "Khách hàng", description: "Tình trạng ký kết và tiến độ thu theo HDMB", tone: "customer", items: [["Tổng khách hàng", number(data.customers.totalCustomers), "COUNT(customer)", User, "customer"], ["Tổng khách đã ký", number(data.customers.signedCustomers), "Khách hàng có HDMB", FileCheck, "customer"], ["Tổng khách chưa ký", number(data.customers.unsignedCustomers), "Khách hàng chưa có HDMB", FileClock, "warning"], ["Tổng giá trị HDMB", money(data.customers.totalContractValue), "SUM(contractValue)", DollarSign, "revenue"], ["Tổng đã thu", money(data.customers.receivedAmount), "SUM(receivedAmount)", Wallet, "revenue"], ["Tổng còn thu", money(data.customers.remainingAmount), "HDMB − Đã thu", TrendingDown, "danger"], ["Giá trị bình quân khách hàng", money(data.customers.averageCustomerValue), "AVG(contractValue)", CircleDollarSign, "customer"]] },
  ];

  return <div className="space-y-8"><div className={loading ? "pointer-events-none opacity-60" : ""} aria-busy={loading}>{loading && <p className="sr-only" aria-live="polite">Đang cập nhật dữ liệu báo cáo</p>}{sections.map((section) => <section key={section.title} className="mb-7" aria-labelledby={`section-${section.title}`}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id={`section-${section.title}`} className="text-base font-semibold tracking-[-0.01em] text-slate-950">{section.title}</h2><p className="mt-1 text-xs text-slate-500">{section.description}</p></div></div><div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${section.items.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>{section.items.map(([label, value, hint, icon, tone]) => <MetricCard key={label} label={label} value={value} hint={hint} icon={icon} tone={tone} />)}</div></section>)}</div><ProductChartsSection filters={filters} /><SalesTrendSection filters={filters} /><AgencyPerformanceSection filters={filters} /><CustomerStructureSection filters={filters} /><CustomerDemographicsSection filters={filters} /><CustomerRankingReports filters={filters} /><p className="text-right text-[11px] text-slate-400">Cập nhật {new Date(data.meta.updatedAt).toLocaleString("vi-VN")} · Nguồn: {data.meta.source === "api" ? "API" : "dữ liệu demo"}</p></div>;
}
