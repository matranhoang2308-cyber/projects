import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BadgeCheck, CircleDollarSign, ClipboardCheck, FileCheck, FileClock, FileText, Handshake, Percent, Stamp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardFilters, TrendGroup } from "./dashboardApi";
import { hdmbImportRecords, type HdmbRecord } from "@/data/hdmbImportSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MetricTone = "blue" | "green" | "red" | "amber" | "slate" | "violet";
const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const axisStyle = { fontSize: 11, fill: "#64748b" };
const chartSelectClass = "h-9 min-w-[164px] rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 transition shadow-none text-left";
const dateInputClass = "h-9 min-w-0 w-full rounded-[8px] border border-[#E5EAF3] bg-white px-2.5 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 transition";
const reportStatusBadgeBaseClass = "inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1";
const metricToneClass: Record<MetricTone, string> = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  red: "border-red-100 bg-red-50 text-red-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  slate: "border-slate-100 bg-slate-50 text-slate-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};
const metricAccentClass: Record<MetricTone, string> = {
  blue: "bg-blue-600",
  green: "bg-emerald-600",
  red: "bg-red-600",
  amber: "bg-amber-500",
  slate: "bg-slate-500",
  violet: "bg-violet-600",
};

const dossierStatuses = ["Đã cọc", "Đã phát hành", "Đã ký", "Đã đóng dấu", "Chờ trả HĐMB", "Đã trả", "Bàn giao"] as const;
const trendOptions: Array<{ value: TrendGroup; label: string }> = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "custom", label: "Khoảng thời gian" },
];
type ContractQuantityView = "block" | "floor" | "unitType";
type TransferLineMetric = "count" | "value";
type TransferBarMetric = "valueByAgency" | "countByAgency" | "timesByProduct" | "countByZone" | "topProducts";
const contractQuantityOptions: Array<{ value: ContractQuantityView; label: string }> = [
  { value: "block", label: "Theo tháp" },
  { value: "floor", label: "Tầng" },
  { value: "unitType", label: "Loại căn" },
];
const transferLineMetricOptions: Array<{ value: TransferLineMetric; label: string }> = [
  { value: "count", label: "Số lượng" },
  { value: "value", label: "Giá trị" },
];
const transferBarMetricOptions: Array<{ value: TransferBarMetric; label: string }> = [
  { value: "valueByAgency", label: "Giá trị theo ĐVPP" },
  { value: "countByAgency", label: "Số lượng theo ĐVPP" },
  { value: "timesByProduct", label: "Số lần theo sản phẩm" },
  { value: "countByZone", label: "Hồ sơ theo phân khu" },
  { value: "topProducts", label: "Top sản phẩm" },
];
const towerOrder = ["Vitalis", "Harmonie"];
const unitTypeOrder = ["Sky Garden", "Penhouse", "Sky Villa Residence", "Duplex Garden"];
const transferSlaDays = 14;

type TransferDashboardLog = {
  id?: string;
  createdAt?: string;
  seq?: number;
  sequence?: number;
  transferDate?: string;
  file?: string;
  form?: {
    signedDate?: string;
    notarizedNo?: string;
    receivedDate?: string;
    confirmedDate?: string;
    documentNo?: string;
    fileName?: string;
    transferFee?: string;
    fee?: string;
  };
};

function normalizeStatus(status?: string) {
  if (status === "Chờ trả hợp đồng") return "Chờ trả HĐMB";
  return status || "Đã cọc";
}

function dossierStatusBadgeClass(status?: string) {
  const normalized = normalizeStatus(status);
  if (normalized === "Đã cọc") return `${reportStatusBadgeBaseClass} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (normalized === "Đã phát hành") return `${reportStatusBadgeBaseClass} bg-blue-50 text-blue-700 ring-blue-200`;
  if (normalized === "Đã ký") return `${reportStatusBadgeBaseClass} bg-cyan-50 text-cyan-700 ring-cyan-200`;
  if (normalized === "Đã đóng dấu") return `${reportStatusBadgeBaseClass} bg-violet-50 text-violet-700 ring-violet-200`;
  if (normalized === "Chờ trả HĐMB") return `${reportStatusBadgeBaseClass} bg-amber-50 text-amber-700 ring-amber-200`;
  if (normalized === "Đã trả") return `${reportStatusBadgeBaseClass} bg-slate-50 text-slate-700 ring-slate-200`;
  if (normalized === "Bàn giao") return `${reportStatusBadgeBaseClass} bg-indigo-50 text-indigo-700 ring-indigo-200`;
  return `${reportStatusBadgeBaseClass} bg-slate-50 text-slate-600 ring-slate-200`;
}

function parseDate(value?: string) {
  if (!value) return null;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function parseFlexibleDate(value?: string) {
  if (!value) return null;
  if (value.includes("-")) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return parseDate(value);
}

function parseCurrencyValue(value?: string) {
  if (!value) return 0;
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function recordDate(record: HdmbRecord) {
  return parseDate(record.values.c106 || record.values.c107);
}

function inputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return { from: inputDate(from), to: inputDate(to) };
}

function matchDatePreset(date: Date | null, filters: DashboardFilters) {
  if (!date) return true;
  const now = new Date();
  const start = new Date(now);
  if (filters.datePreset === "today") start.setHours(0, 0, 0, 0);
  if (filters.datePreset === "7d") start.setDate(now.getDate() - 7);
  if (filters.datePreset === "30d") start.setDate(now.getDate() - 30);
  if (filters.datePreset === "quarter") start.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
  if (filters.datePreset === "year") start.setMonth(0, 1);
  if (filters.datePreset === "custom") {
    const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;
    return (!from || date >= from) && (!to || date <= to);
  }
  return date >= start;
}

function applyFilters(records: HdmbRecord[], filters: DashboardFilters) {
  return records.filter((record) => {
    const status = normalizeStatus(record.status);
    return matchDatePreset(recordDate(record), filters)
      && (!filters.agency || record.values.c156 === filters.agency || record.values.c154 === filters.agency)
      && (!filters.productId || record.values.c51 === filters.productId)
      && (!filters.zone || record.values.c52?.toLowerCase() === filters.zone)
      && (!filters.productType || record.values.c55 === filters.productType)
      && (!filters.dossierStatus || status === filters.dossierStatus);
  });
}

function groupLabel(date: Date | null, group: TrendGroup) {
  if (!date) return "Chưa có ngày";
  if (group === "day" || group === "custom") return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  if (group === "week") return `Tuần ${Math.ceil(date.getDate() / 7)}`;
  if (group === "month") return `Tháng ${date.getMonth() + 1}`;
  return String(date.getFullYear());
}

function progressBucket(date: Date | null, group: TrendGroup) {
  if (!date) return { label: "Chưa có ngày", sortKey: "9999-99-99" };
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (group === "day" || group === "custom") return { label: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }), sortKey: inputDate(date) };
  if (group === "week") {
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000) + 1;
    const week = Math.ceil((dayOfYear + startOfYear.getDay()) / 7);
    return { label: `Tuần ${week}`, sortKey: String(week).padStart(2, "0") };
  }
  if (group === "month") return { label: `Tháng ${month}/${year}`, sortKey: `${year}-${String(month).padStart(2, "0")}` };
  return { label: String(year), sortKey: String(year) };
}

function ensureProgressBuckets(points: Array<{ date: string; count: number; sortKey: string }>, group: TrendGroup) {
  if (group === "year") {
    const year = new Date().getFullYear();
    const required = [year - 2, year - 1, year].map((item) => String(item));
    const byKey = new Map(points.map((point) => [point.sortKey, point]));
    required.forEach((key) => {
      if (!byKey.has(key)) byKey.set(key, { date: key, count: 0, sortKey: key });
    });
    return Array.from(byKey.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  if (group === "week") {
    return points.map((point) => ({ ...point, date: `Tuần ${Number(point.sortKey)}` }));
  }

  return points;
}

function filterByChartTime(records: HdmbRecord[], group: TrendGroup, from: string, to: string) {
  if (group !== "custom") return records;
  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59`) : null;
  return records.filter((record) => {
    const date = recordDate(record);
    return !date || ((!fromDate || date >= fromDate) && (!toDate || date <= toDate));
  });
}

function filterStatusByChartTime(records: HdmbRecord[], group: TrendGroup, from: string, to: string) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (group === "week") start.setDate(now.getDate() - 7);
  if (group === "month") start.setDate(now.getDate() - 30);
  if (group === "year") start.setMonth(0, 1);

  if (group === "custom") {
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59`) : null;
    return records.filter((record) => {
      const date = recordDate(record);
      return !date || ((!fromDate || date >= fromDate) && (!toDate || date <= toDate));
    });
  }

  return records.filter((record) => {
    const date = recordDate(record);
    return !date || date >= start;
  });
}

function ChartTimeControl({ label, group, setGroup, from, setFrom, to, setTo }: { label: string; group: TrendGroup; setGroup: (value: TrendGroup) => void; from: string; setFrom: (value: string) => void; to: string; setTo: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <Select value={group} onValueChange={(val) => setGroup(val as TrendGroup)}>
        <SelectTrigger aria-label={`Thời gian - ${label}`} className={chartSelectClass}>
          <SelectValue placeholder="Thời gian" />
        </SelectTrigger>
        <SelectContent>
          {trendOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {group === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <input aria-label={`Từ ngày - ${label}`} className={dateInputClass} type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} />
          <input aria-label={`Đến ngày - ${label}`} className={dateInputClass} type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} />
        </div>
      )}
    </div>
  );
}

function ContractQuantityControl({ value, onChange }: { value: ContractQuantityView; onChange: (value: ContractQuantityView) => void }) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as ContractQuantityView)}>
      <SelectTrigger aria-label="Góc nhìn số lượng hợp đồng" className={chartSelectClass}>
        <SelectValue placeholder="Chọn góc nhìn" />
      </SelectTrigger>
      <SelectContent>
        {contractQuantityOptions.map((item) => (
          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TransferBarControl({ value, onChange }: { value: TransferBarMetric; onChange: (value: TransferBarMetric) => void }) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as TransferBarMetric)}>
      <SelectTrigger aria-label="Metric bar chart chuyển nhượng" className={chartSelectClass}>
        <SelectValue placeholder="Chọn chỉ số" />
      </SelectTrigger>
      <SelectContent>
        {transferBarMetricOptions.map((item) => (
          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TransferLineControl({ metric, setMetric, group, setGroup, from, setFrom, to, setTo }: { metric: TransferLineMetric; setMetric: (value: TransferLineMetric) => void; group: TrendGroup; setGroup: (value: TrendGroup) => void; from: string; setFrom: (value: string) => void; to: string; setTo: (value: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
      <Select value={metric} onValueChange={(val) => setMetric(val as TransferLineMetric)}>
        <SelectTrigger aria-label="Chỉ số chuyển nhượng" className={chartSelectClass}>
          <SelectValue placeholder="Chọn chỉ số" />
        </SelectTrigger>
        <SelectContent>
          {transferLineMetricOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ChartTimeControl label="Chuyển nhượng" group={group} setGroup={setGroup} from={from} setFrom={setFrom} to={to} setTo={setTo} />
    </div>
  );
}

function contractQuantityLabel(record: HdmbRecord, view: ContractQuantityView) {
  if (view === "block") {
    return towerLabel(record);
  }
  if (view === "floor") return record.values.c53 ? `Tầng ${Number(record.values.c53) || record.values.c53}` : "Chưa xác định";
  return record.values.c55 || "Chưa xác định";
}

function towerLabel(record: HdmbRecord) {
  const tower = record.values.c52?.toLowerCase();
  if (tower === "vitalis") return "Vitalis";
  if (tower === "harmonie") return "Harmonie";
  return record.values.c52 || "Chưa xác định";
}

function contractQuantitySortKey(label: string, view: ContractQuantityView) {
  if (view !== "floor") return label;
  const floor = Number(label.replace("Tầng ", ""));
  return Number.isFinite(floor) ? String(floor).padStart(3, "0") : label;
}

function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }: { label: string; value: string; hint: string; icon: React.ElementType; tone?: MetricTone }) {
  return <Card className="relative min-h-[112px] gap-0 overflow-hidden rounded-lg border-[#E5EAF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><span className={`absolute inset-x-0 top-0 h-0.5 ${metricAccentClass[tone]}`} /><p className="min-h-4 pr-11 text-[11px] font-medium leading-4 text-slate-500">{label}</p><p className="mt-1 break-words text-lg font-semibold leading-6 tracking-[-0.01em] tabular-nums text-slate-950">{value}</p><p className="mt-1 text-[11px] leading-4 text-slate-400">{hint}</p><div className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border ${metricToneClass[tone]}`}><Icon className="size-4.5" /></div></Card>;
}

function TransferMetricCard({ label, value, hint, icon: Icon, tone = "blue" }: { label: string; value: string; hint: string; icon: React.ElementType; tone?: MetricTone }) {
  return <div className="relative min-h-[112px] overflow-hidden rounded-lg border border-[#E5EAF3] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"><span className={`absolute inset-x-0 top-0 h-0.5 ${metricAccentClass[tone]}`} /><p className="min-h-4 pr-11 text-[11px] font-medium leading-4 text-slate-500">{label}</p><p className="mt-1 break-words text-lg font-semibold leading-6 tracking-[-0.01em] tabular-nums text-slate-950">{value}</p><p className="mt-1 text-[11px] leading-4 text-slate-400">{hint}</p><div className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border ${metricToneClass[tone]}`}><Icon className="size-4.5" /></div></div>;
}

function TransferMetricGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">{title}</h4><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div></div>;
}

function ChartCard({ title, description, action, children }: { title: string; description: string; action: React.ReactNode; children: React.ReactNode }) {
  return <Card className="gap-0 rounded-2xl border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.035)]"><div className="flex min-h-[58px] flex-col items-start justify-between gap-4 sm:flex-row"><div className="min-w-0"><h3 className="text-sm font-medium text-slate-950">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><div className="w-full shrink-0 sm:w-auto">{action}</div></div><div className="mt-4 h-[270px] min-w-0">{children}</div></Card>;
}

function isTransferCompleted(log: TransferDashboardLog) {
  return Boolean(log.form?.confirmedDate || log.transferDate);
}

function transferFee(log: TransferDashboardLog) {
  const raw = log.form?.transferFee || log.form?.fee || "";
  const normalized = raw.replace(/[^\d]/g, "");
  return normalized ? Number(normalized) : 0;
}

function transferLogDate(log: TransferDashboardLog) {
  return parseFlexibleDate(log.transferDate || log.form?.confirmedDate || log.form?.signedDate || log.createdAt);
}

function transferLogValue(record: HdmbRecord, log: TransferDashboardLog) {
  return transferFee(log) || parseCurrencyValue(record.values.c93 || record.values.c87);
}

function filterTransferByChartTime(entries: Array<{ record: HdmbRecord; log: TransferDashboardLog }>, group: TrendGroup, from: string, to: string) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (group === "week") start.setDate(now.getDate() - 7);
  if (group === "month") start.setDate(now.getDate() - 30);
  if (group === "year") start.setMonth(0, 1);

  if (group === "custom") {
    const fromDate = from ? new Date(`${from}T00:00:00`) : null;
    const toDate = to ? new Date(`${to}T23:59:59`) : null;
    return entries.filter(({ log }) => {
      const date = transferLogDate(log);
      return !date || ((!fromDate || date >= fromDate) && (!toDate || date <= toDate));
    });
  }

  return entries.filter(({ log }) => {
    const date = transferLogDate(log);
    return !date || date >= start;
  });
}

function compactMoney(value: number) {
  if (value >= 1_000_000_000) return `${number(Math.round(value / 1_000_000_000))} tỷ`;
  if (value >= 1_000_000) return `${number(Math.round(value / 1_000_000))} tr`;
  return number(value);
}

function transferBarLabel(record: HdmbRecord, metric: TransferBarMetric) {
  if (metric === "valueByAgency" || metric === "countByAgency") return record.values.c156 || record.values.c154 || "Chưa xác định";
  if (metric === "countByZone") return towerLabel(record);
  return record.values.c51 || "Chưa xác định";
}

function transferBarDescription(metric: TransferBarMetric) {
  if (metric === "valueByAgency") return "Giá trị chuyển nhượng theo đơn vị phân phối.";
  if (metric === "countByAgency") return "Số lượng HĐ chuyển nhượng theo đơn vị phân phối.";
  if (metric === "timesByProduct") return "Số lần chuyển nhượng theo sản phẩm.";
  if (metric === "countByZone") return "Số lượng hồ sơ chuyển nhượng theo phân khu.";
  return "Top sản phẩm chuyển nhượng nhiều nhất.";
}

function isTransferOverSla(log: TransferDashboardLog) {
  if (isTransferCompleted(log)) return false;
  const start = parseFlexibleDate(log.form?.receivedDate || log.form?.signedDate || log.createdAt);
  if (!start) return false;
  const elapsedDays = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return elapsedDays > transferSlaDays;
}

export function ContractDashboardReport({ filters }: { filters: DashboardFilters }) {
  const range = defaultRange();
  const [statusGroup, setStatusGroup] = useState<TrendGroup>("month");
  const [statusFrom, setStatusFrom] = useState(range.from);
  const [statusTo, setStatusTo] = useState(range.to);
  const [progressGroup, setProgressGroup] = useState<TrendGroup>("week");
  const [progressFrom, setProgressFrom] = useState(range.from);
  const [progressTo, setProgressTo] = useState(range.to);
  const [contractQuantityView, setContractQuantityView] = useState<ContractQuantityView>("block");
  const [transferLineMetric, setTransferLineMetric] = useState<TransferLineMetric>("count");
  const [transferLineGroup, setTransferLineGroup] = useState<TrendGroup>("month");
  const [transferLineFrom, setTransferLineFrom] = useState(range.from);
  const [transferLineTo, setTransferLineTo] = useState(range.to);
  const [transferBarMetric, setTransferBarMetric] = useState<TransferBarMetric>("valueByAgency");

  const records = useMemo(() => applyFilters(hdmbImportRecords, filters), [filters]);
  const statusRecords = useMemo(() => filterStatusByChartTime(records, statusGroup, statusFrom, statusTo), [records, statusFrom, statusGroup, statusTo]);
  const progressRecords = useMemo(() => filterByChartTime(records, progressGroup, progressFrom, progressTo), [records, progressFrom, progressGroup, progressTo]);

  const statusData = useMemo(() => dossierStatuses.map((status) => ({ status, count: statusRecords.filter((record) => normalizeStatus(record.status) === status).length })), [statusRecords]);
  const progressData = useMemo(() => {
    const grouped = progressRecords.reduce<Record<string, { date: string; count: number; sortKey: string }>>((acc, record) => {
      const date = recordDate(record);
      const bucket = progressBucket(date, progressGroup);
      acc[bucket.sortKey] = acc[bucket.sortKey] ?? { date: bucket.label, count: 0, sortKey: bucket.sortKey };
      acc[bucket.sortKey].count += 1;
      return acc;
    }, {});
    return ensureProgressBuckets(Object.values(grouped), progressGroup)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ date, count }) => ({ date, count }));
  }, [progressGroup, progressRecords]);
  const contractQuantityData = useMemo(() => {
    const grouped = records.reduce<Record<string, { label: string; count: number; sortKey: string }>>((acc, record) => {
      const label = contractQuantityLabel(record, contractQuantityView);
      acc[label] = acc[label] ?? { label, count: 0, sortKey: contractQuantitySortKey(label, contractQuantityView) };
      acc[label].count += 1;
      return acc;
    }, {});
    if (contractQuantityView === "block") {
      towerOrder.forEach((label, index) => {
        grouped[label] = grouped[label] ?? { label, count: 0, sortKey: String(index).padStart(2, "0") };
        grouped[label].sortKey = String(index).padStart(2, "0");
      });
      return towerOrder.map((label) => grouped[label]);
    }
    if (contractQuantityView === "unitType") {
      unitTypeOrder.forEach((label, index) => {
        grouped[label] = grouped[label] ?? { label, count: 0, sortKey: String(index).padStart(2, "0") };
        grouped[label].sortKey = String(index).padStart(2, "0");
      });
      return Object.values(grouped).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }
    return Object.values(grouped).sort((a, b) => contractQuantityView === "floor" ? a.sortKey.localeCompare(b.sortKey) : b.count - a.count);
  }, [contractQuantityView, records]);

  const transferLogs = readTransferLogs();
  const transferEntries = records.flatMap((record) => (transferLogs[record.id] ?? []).map((log) => ({ record, log })));
  const transferLineData = useMemo(() => {
    const filteredEntries = filterTransferByChartTime(transferEntries, transferLineGroup, transferLineFrom, transferLineTo);
    const grouped = filteredEntries.reduce<Record<string, { date: string; count: number; value: number; sortKey: string }>>((acc, entry) => {
      const bucket = progressBucket(transferLogDate(entry.log), transferLineGroup);
      acc[bucket.sortKey] = acc[bucket.sortKey] ?? { date: bucket.label, count: 0, value: 0, sortKey: bucket.sortKey };
      acc[bucket.sortKey].count += 1;
      acc[bucket.sortKey].value += transferLogValue(entry.record, entry.log);
      return acc;
    }, {});
    return Object.values(grouped)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ date, count, value }) => ({ date, count, value }));
  }, [transferEntries, transferLineFrom, transferLineGroup, transferLineTo]);
  const transferBarData = useMemo(() => {
    const grouped = transferEntries.reduce<Record<string, { label: string; count: number; value: number; contractIds: Set<string> }>>((acc, entry) => {
      const label = transferBarLabel(entry.record, transferBarMetric);
      acc[label] = acc[label] ?? { label, count: 0, value: 0, contractIds: new Set<string>() };
      acc[label].count += 1;
      acc[label].value += transferLogValue(entry.record, entry.log);
      acc[label].contractIds.add(entry.record.id);
      return acc;
    }, {});
    return Object.values(grouped)
      .map((item) => ({
        label: item.label,
        amount: transferBarMetric === "valueByAgency" ? item.value : transferBarMetric === "countByAgency" ? item.contractIds.size : item.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, transferBarMetric === "topProducts" ? 8 : 12);
  }, [transferBarMetric, transferEntries]);
  const transferredContractCount = records.filter((record) => (transferLogs[record.id]?.length ?? 0) > 0).length;
  const completedTransferCount = transferEntries.filter(({ log }) => isTransferCompleted(log)).length;
  const processingTransferCount = Math.max(transferEntries.length - completedTransferCount, 0);
  const completedTransferRate = transferEntries.length ? Math.round((completedTransferCount / transferEntries.length) * 100) : 0;
  const financialConfirmedCount = transferEntries.filter(({ log }) => Boolean(log.form?.documentNo)).length;
  const notarizedCount = transferEntries.filter(({ log }) => Boolean(log.form?.notarizedNo || log.file || log.form?.fileName)).length;
  const transferConfirmedCount = transferEntries.filter(({ log }) => Boolean(log.form?.confirmedDate || log.transferDate)).length;
  const transferOverSlaCount = transferEntries.filter(({ log }) => isTransferOverSla(log)).length;
  const transferFeeTotal = transferEntries.reduce((total, { log }) => total + transferFee(log), 0);
  const metrics = [
    { label: "Tổng số hợp đồng", value: records.length, hint: "Toàn bộ HĐ theo bộ lọc", icon: FileText, tone: "blue" as MetricTone },
    { label: "Tổng HĐ đã cọc", value: records.filter((record) => normalizeStatus(record.status) === "Đã cọc").length, hint: "Trạng thái: Đã cọc", icon: CircleDollarSign, tone: "green" as MetricTone },
    { label: "Tổng HĐ đã ký", value: records.filter((record) => normalizeStatus(record.status) === "Đã ký").length, hint: "Trạng thái: Đã ký", icon: FileCheck, tone: "green" as MetricTone },
    { label: "Tổng HĐ chuyển nhượng", value: transferredContractCount, hint: "HĐ có phát sinh chuyển nhượng", icon: Handshake, tone: "violet" as MetricTone },
    { label: "Tổng HĐ bàn giao", value: records.filter((record) => normalizeStatus(record.status) === "Bàn giao").length, hint: "Trạng thái: Bàn giao", icon: BadgeCheck, tone: "blue" as MetricTone },
  ];

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((item) => <MetricCard key={item.label} label={item.label} value={number(item.value)} hint={item.hint} icon={item.icon} tone={item.tone} />)}
      </div>
      <section className="space-y-5">
        <div className="px-1">
          <h3 className="text-sm font-medium text-slate-950">Chuyển nhượng hợp đồng</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">Theo dõi khối lượng, tiến độ và rủi ro tài chính của hồ sơ chuyển nhượng.</p>
        </div>
        <div className="grid gap-5">
          <TransferMetricGroup title="Khối lượng">
            <TransferMetricCard label="Tổng HĐ chuyển nhượng" value={number(transferredContractCount)} hint="HĐ có phát sinh chuyển nhượng" icon={Handshake} tone="violet" />
            <TransferMetricCard label="HĐ đang xử lý" value={number(processingTransferCount)} hint="Hồ sơ chưa hoàn tất" icon={FileClock} tone="amber" />
            <TransferMetricCard label="HĐ hoàn tất" value={number(completedTransferCount)} hint="Đã có ngày xác nhận" icon={BadgeCheck} tone="green" />
          </TransferMetricGroup>
          <TransferMetricGroup title="Tiến độ">
            <TransferMetricCard label="Tỷ lệ hoàn tất (%)" value={`${number(completedTransferRate)}%`} hint="Hoàn tất / tổng hồ sơ CN" icon={Percent} tone="blue" />
            <TransferMetricCard label="Đã xác nhận nghĩa vụ tài chính" value={number(financialConfirmedCount)} hint="Có số chứng từ" icon={ClipboardCheck} tone="green" />
            <TransferMetricCard label="Đã công chứng" value={number(notarizedCount)} hint="Có VBCN hoặc file CN" icon={Stamp} tone="slate" />
            <TransferMetricCard label="Đã xác nhận chuyển nhượng" value={number(transferConfirmedCount)} hint="Có ngày XNCN" icon={FileCheck} tone="green" />
          </TransferMetricGroup>
          <TransferMetricGroup title="Rủi ro / tài chính">
            <TransferMetricCard label="Hồ sơ quá SLA" value={number(transferOverSlaCount)} hint={`Chưa hoàn tất sau ${transferSlaDays} ngày`} icon={AlertTriangle} tone="red" />
            <TransferMetricCard label="Tổng số tiền phí chuyển nhượng" value={transferFeeTotal ? `${number(transferFeeTotal)} đ` : "0 đ"} hint="Theo phí ghi nhận trong hồ sơ CN" icon={CircleDollarSign} tone="green" />
          </TransferMetricGroup>
        </div>
      </section>
      <ChartCard title="Biểu đồ - Chuyển nhượng" description="Số lượng HĐ chuyển nhượng và giá trị chuyển nhượng theo tháng." action={<TransferLineControl metric={transferLineMetric} setMetric={setTransferLineMetric} group={transferLineGroup} setGroup={setTransferLineGroup} from={transferLineFrom} setFrom={setTransferLineFrom} to={transferLineTo} setTo={setTransferLineTo} />}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={transferLineData} margin={{ top: 8, right: 12, left: transferLineMetric === "value" ? 18 : -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} width={transferLineMetric === "value" ? 58 : undefined} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => transferLineMetric === "value" ? compactMoney(Number(value)) : number(Number(value))} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => transferLineMetric === "value" ? [`${number(Number(value))} đ`, "Giá trị chuyển nhượng"] : [number(Number(value)), "HĐ chuyển nhượng"]} /><Line type="monotone" dataKey={transferLineMetric} name={transferLineMetric === "value" ? "Giá trị chuyển nhượng" : "Số lượng HĐ chuyển nhượng"} stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Biểu đồ - Chuyển nhượng" description={transferBarDescription(transferBarMetric)} action={<TransferBarControl value={transferBarMetric} onChange={setTransferBarMetric} />}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={transferBarData} layout="vertical" margin={{ top: 8, right: 42, left: 20, bottom: 4 }}><CartesianGrid stroke="#eef2f7" horizontal={false} vertical={false} /><XAxis type="number" hide domain={[0, "dataMax + 1"]} /><YAxis dataKey="label" type="category" width={132} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => transferBarMetric === "valueByAgency" ? [`${number(Number(value))} đ`, "Giá trị"] : [number(Number(value)), transferBarMetric === "timesByProduct" ? "Lần chuyển nhượng" : "Hồ sơ"]} /><Bar dataKey="amount" fill="#2563eb" radius={[0, 7, 7, 0]} maxBarSize={28} isAnimationActive={false}><LabelList dataKey="amount" position="right" formatter={(value: number) => transferBarMetric === "valueByAgency" ? compactMoney(Number(value)) : number(Number(value))} className="fill-slate-700 text-[11px] font-medium" /></Bar></BarChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Biểu đồ - Trạng thái hồ sơ" description="Số lượng HĐ theo từng trạng thái hồ sơ." action={<ChartTimeControl label="Trạng thái hồ sơ" group={statusGroup} setGroup={setStatusGroup} from={statusFrom} setFrom={setStatusFrom} to={statusTo} setTo={setStatusTo} />}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={statusData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="status" tick={axisStyle} tickLine={false} axisLine={false} interval={0} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Hợp đồng"]} /><Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false} /></BarChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Biểu đồ - Tiến độ xử lý" description="Tiến độ xử lý hợp đồng theo thời gian." action={<ChartTimeControl label="Tiến độ xử lý" group={progressGroup} setGroup={setProgressGroup} from={progressFrom} setFrom={setProgressFrom} to={progressTo} setTo={setProgressTo} />}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={progressData} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [number(Number(value)), "Hợp đồng"]} /><Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Biểu đồ số lượng HĐ" description="So sánh số lượng hợp đồng theo Block, tầng hoặc loại căn." action={<ContractQuantityControl value={contractQuantityView} onChange={setContractQuantityView} />}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={contractQuantityData} layout="vertical" margin={{ top: 8, right: 34, left: 20, bottom: 4 }}><CartesianGrid stroke="#eef2f7" horizontal={false} vertical={false} /><XAxis type="number" hide domain={[0, "dataMax + 1"]} /><YAxis dataKey="label" type="category" width={112} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Hợp đồng"]} /><Bar dataKey="count" fill="#2563eb" radius={[0, 7, 7, 0]} maxBarSize={28} isAnimationActive={false}><LabelList dataKey="count" position="right" formatter={(value: number) => number(Number(value))} className="fill-slate-700 text-[11px] font-medium" /></Bar></BarChart></ResponsiveContainer>
      </ChartCard>
      <Card className="gap-0 rounded-xl border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="text-sm font-medium text-slate-950">Danh sách hợp đồng</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">Chi tiết các hợp đồng mua bán phát sinh trong kỳ báo cáo.</p>
        </div>
        <div className="mt-4 max-h-[320px] overflow-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm">
            <thead className="sticky top-0 z-10">
              <tr>
                {["Mã KH", "Khách hàng", "Mã sản phẩm", "Phân khu", "Loại sản phẩm", "Trạng thái hồ sơ", "Ngày"].map((label) => (
                  <th key={label} className="border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left text-[11px] leading-4 text-slate-600 last:border-r-0" style={{ fontWeight: 650 }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="transition-colors hover:bg-[#F8FAFC]">
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5 text-2sm text-blue-700" style={{ fontWeight: 600 }}>{record.values.c2}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5 text-2sm text-slate-900" style={{ fontWeight: 600 }}>{record.values.c3}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5 text-2sm text-slate-600">{record.values.c51}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5 text-2sm text-slate-600">{record.values.c52}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5 text-2sm text-slate-600">{record.values.c55}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2.5"><span className={dossierStatusBadgeClass(record.status)} style={{ fontWeight: 650 }}>{normalizeStatus(record.status)}</span></td>
                  <td className="border-b border-[#E5EAF3] px-3 py-2.5 text-2sm text-slate-600">{record.values.c106 || record.values.c107 || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function readTransferLogs(): Record<string, TransferDashboardLog[]> {
  try {
    return JSON.parse(localStorage.getItem("crm-contract-transfer-logs") || "{}");
  } catch {
    return {};
  }
}
