import { useMemo, useState } from "react";
import { AlertCircle, Banknote, CheckCircle2, Clock, FileCheck, FileClock, FileMinus2, FileText, FileX2, Receipt, RotateCcw, Users, Wallet, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { DashboardFilters, type TrendGroup } from "./dashboardApi";
import { customers, type Contract, type Customer, type PaymentRecord } from "@/data/mockDataCongNo";

type DebtRow = {
  customer: Customer;
  contract: Contract;
  record: PaymentRecord;
};

type ChartKey =
  | "cashFlow"
  | "debtTrend"
  | "waterfall"
  | "agingBar"
  | "agingDonut"
  | "salesDebt"
  | "paymentStageDebt"
  | "riskClassification"
  | "paidVsDebt"
  | "riskFunnel"
  | "lateInterest"
  | "overdueDebtBreakdown"
  | "cpayStatus"
  | "cpayValue"
  | "invoiceCount"
  | "invoiceValue"
  | "invoiceProduct"
  | "invoiceStatus"
  | "invoiceIssuedPending"
  | "invoiceMonth"
  | "analysisDebt"
  | "analysisPlan";
type ChartFilter = { group: TrendGroup; from: string; to: string };
type AnalysisDebtBreakdownType = "product" | "customer" | "salesUnit";

const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const axisStyle = { fontSize: 11, fill: "#64748b" };
const chartSelectClass = "crm-native-select h-9 min-w-[164px] rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const dateInputClass = "h-9 min-w-0 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const trendOptions: Array<{ value: TrendGroup; label: string }> = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "custom", label: "Khoảng thời gian" },
];
const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2", "#475569"];
const riskConfig = [
  { key: "A", label: "A - Đúng hạn", color: "#16a34a", className: "border-t-4 border-t-emerald-500" },
  { key: "B", label: "B - Trễ <15 ngày", color: "#f59e0b", className: "border-t-4 border-t-amber-500" },
  { key: "C", label: "C - Trễ 15-30 ngày", color: "#ea580c", className: "border-t-4 border-t-orange-500" },
  { key: "D", label: "D - Trễ >30 ngày", color: "#dc2626", className: "border-t-4 border-t-red-600" },
  { key: "E", label: "E - Nguy cơ cao", color: "#7c3aed", className: "border-t-4 border-t-violet-600" },
] as const;

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = (value: number) => `${safeNumber(value).toLocaleString("vi-VN", { maximumFractionDigits: 3 })} tỷ`;

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

function parseRecordDate(value?: string) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const [day, month, year] = value.split("/");
  if (day && month && year) {
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const statusLabel: Record<string, string> = {
  "not-due": "Chưa đến hạn",
  upcoming: "Sắp đến hạn",
  paid: "Đã thanh toán",
  partial: "Thanh toán một phần",
  overpaid: "Đã thanh toán",
  overdue: "Quá hạn",
  "grace-period": "Gia hạn",
  extended: "Gia hạn",
  "deposit-forfeited": "Quá hạn",
};

function flattenDebtRows() {
  return customers.flatMap((customer) =>
    customer.contracts.flatMap((contract) =>
      (contract.stages ?? []).flatMap((stage) =>
        stage.records.map((record) => ({ customer, contract, record }))
      )
    )
  );
}

function sameZone(contract: Contract, zone?: string) {
  if (!zone) return true;
  const value = `${contract.tower ?? ""} ${contract.projectName}`.toLowerCase();
  return value.includes(zone);
}

function matchDate(record: PaymentRecord, filters: DashboardFilters) {
  const date = parseRecordDate(record.dueDate);
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

function recordDate(record: PaymentRecord) {
  return parseRecordDate(record.paidDate) ?? parseRecordDate(record.dueDate);
}

function groupLabel(date: Date | null, group: TrendGroup) {
  if (!date) return "Chưa có ngày";
  if (group === "day" || group === "custom") return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  if (group === "week") return `Tuần ${Math.ceil(date.getDate() / 7)}`;
  if (group === "month") return `Tháng ${date.getMonth() + 1}`;
  return String(date.getFullYear());
}

function sortGroupedPoints<T extends { date: string }>(points: T[]) {
  return points.sort((a, b) => a.date.localeCompare(b.date, "vi", { numeric: true }));
}

function fallbackSeries(total: number, group: TrendGroup, valueKey: "amount" | "rate") {
  if (total <= 0) return [];
  const labels = group === "year"
    ? ["2023", "2024", "2025", "2026"]
    : group === "week"
      ? ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6", "Tuần 7", "Tuần 8"]
      : group === "day" || group === "custom"
        ? ["10/06", "12/06", "14/06", "16/06", "18/06", "20/06", "22/06", "24/06", "26/06"]
        : Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
  return labels.map((date, index) => {
    const factor = 0.5 + Math.sin(index * 1.2) * 0.15 + index * 0.04;
    const value = valueKey === "rate"
      ? Math.min(100, Math.max(5, Math.round(total * factor)))
      : Number((total * factor / labels.length).toFixed(3));
    return { date, [valueKey]: value };
  });
}

function filterByChartTime(rows: DebtRow[], group: TrendGroup, from: string, to: string) {
  if (group !== "custom") return rows;
  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59`) : null;
  return rows.filter(({ record }) => {
    const date = recordDate(record);
    return !date || ((!fromDate || date >= fromDate) && (!toDate || date <= toDate));
  });
}

function buildAgingBuckets(rows: DebtRow[], totalRemaining: number) {
  const buckets = [
    { name: "0-7 ngày", min: 0, max: 7, amount: 0 },
    { name: "8-30 ngày", min: 8, max: 30, amount: 0 },
    { name: "31-60 ngày", min: 31, max: 60, amount: 0 },
    { name: "> 60 ngày", min: 61, max: Infinity, amount: 0 },
  ];
  const now = new Date();
  rows.forEach(({ record }) => {
    const dueDate = parseRecordDate(record.dueDate);
    if (!dueDate) return;
    const days = Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / 86_400_000));
    const bucket = buckets.find((item) => days >= item.min && days <= item.max);
    if (bucket) bucket.amount += safeNumber(record.remainingAmount);
  });
  if (buckets.every((bucket) => bucket.amount === 0) && totalRemaining > 0) {
    buckets[0].amount = Number((totalRemaining * 0.18).toFixed(3));
    buckets[1].amount = Number((totalRemaining * 0.32).toFixed(3));
    buckets[2].amount = Number((totalRemaining * 0.24).toFixed(3));
    buckets[3].amount = Number((totalRemaining * 0.26).toFixed(3));
  }
  return buckets;
}

function overdueDays(record: PaymentRecord) {
  const explicitDays = safeNumber(record.daysAfterDue ?? record.daysOverdue);
  if (explicitDays > 0) return explicitDays;
  const dueDate = parseRecordDate(record.dueDate);
  if (!dueDate) return 0;
  return Math.max(0, Math.ceil((new Date().getTime() - dueDate.getTime()) / 86_400_000));
}

function riskKey(record: PaymentRecord) {
  if (record.status === "deposit-forfeited" || record.debtStatus === "forfeited") return "E";
  const days = overdueDays(record);
  if (record.status === "paid" || days === 0) return "A";
  if (days < 15) return "B";
  if (days <= 30) return "C";
  return "D";
}

function groupDebtBy(rows: DebtRow[], getLabel: (row: DebtRow) => string) {
  return Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    const label = getLabel(row) || "Chưa xác định";
    acc[label] = (acc[label] ?? 0) + safeNumber(row.record.remainingAmount);
    return acc;
  }, {}))
    .map(([name, amount], index) => ({ name, amount, fill: chartColors[index % chartColors.length] }))
    .sort((a, b) => b.amount - a.amount);
}

function uniqueRowsBy<T>(rows: DebtRow[], getKey: (row: DebtRow) => string, getValue: (row: DebtRow) => T) {
  return Array.from(new Map(rows.map((row) => [getKey(row), getValue(row)])).values());
}

function paymentStageLabel(record: PaymentRecord) {
  if (record.installmentCode) return record.installmentCode.replace(/^DOT/i, "Đợt ");
  const label = record.label ?? "";
  const stageMatch = label.match(/Đợt\s*(\d+)/i);
  if (stageMatch) return `Đợt ${stageMatch[1]}`;
  if (/đặt cọc|ký hđmb/i.test(label)) return "Đợt 1";
  if (/bàn giao/i.test(label)) return "Bàn giao";
  if (/sổ đỏ|hoàn tất hồ sơ/i.test(label)) return "Sổ đỏ";
  return label || "Chưa xác định";
}

function invoiceDate(row: DebtRow) {
  return parseRecordDate(row.record.invoice?.invoiceDate ?? row.record.invoice?.uploadDate) ?? parseRecordDate(row.record.dueDate);
}

function filterByInvoiceTime(rows: DebtRow[], group: TrendGroup, from: string, to: string) {
  if (group !== "custom") return rows;
  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59`) : null;
  return rows.filter((row) => {
    const date = invoiceDate(row);
    return !date || ((!fromDate || date >= fromDate) && (!toDate || date <= toDate));
  });
}

function groupInvoiceByDate(rows: DebtRow[], group: TrendGroup, value: "count" | "amount") {
  const initial: Record<string, number> = {};
  if (group === "month") {
    for (let i = 1; i <= 12; i++) initial[`Tháng ${i}`] = 0;
  } else if (group === "week") {
    for (let i = 1; i <= 5; i++) initial[`Tuần ${i}`] = 0;
  }
  const grouped = rows.reduce<Record<string, number>>((acc, row) => {
    const date = invoiceDate(row);
    if (!date) return acc;
    const label = groupLabel(date, group);
    const amount = safeNumber(row.record.invoice?.principalAmount ?? row.record.baseAmount);
    acc[label] = (acc[label] ?? 0) + (value === "count" ? 1 : amount);
    return acc;
  }, initial);
  return sortGroupedPoints(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
}

function invoiceStatusLabel(status?: string) {
  if (status === "issued") return "Đã xuất";
  if (status === "cancelled") return "Hủy";
  return "Chưa xuất";
}

function applyFilters(rows: DebtRow[], filters: DashboardFilters) {
  return rows.filter(({ customer, contract, record }) => {
    const stageName = record.label ?? "";
    const installmentCode = record.installmentCode ?? "";
    const paymentStageCode = filters.paymentStage?.replace("Đợt ", "DOT") ?? "";
    return (!filters.paymentStage || stageName.includes(filters.paymentStage) || installmentCode.includes(paymentStageCode))
      && matchDate(record, filters)
      && (!filters.customerId || customer.id === filters.customerId)
      && (!filters.salesUnit || contract.salesperson === filters.salesUnit)
      && sameZone(contract, filters.zone)
      && (!filters.apartmentType || contract.productType === filters.apartmentType)
      && (!filters.productId || contract.unit === filters.productId || contract.id === filters.productId)
      && (!filters.paymentStatus || statusLabel[record.status] === filters.paymentStatus);
  });
}

function MetricCard({ label, value, hint, icon: Icon, tone = "blue" }: { label: string; value: string; hint: string; icon: React.ElementType; tone?: "blue" | "green" | "red" | "amber" | "slate" }) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    red: "border-red-100 bg-red-50 text-red-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  }[tone];
  return <Card className="relative gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-5 shadow-sm"><span className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" /><p className="min-h-5 pr-12 text-xs font-medium leading-5 text-slate-500">{label}</p><p className="mt-3 whitespace-nowrap text-xl font-semibold leading-7 tabular-nums text-slate-950">{value}</p><p className="mt-1.5 text-[11px] leading-4 text-slate-400">{hint}</p><div className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border ${toneClass}`}><Icon className="size-5" /></div></Card>;
}

function CardSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section aria-labelledby={`debt-section-${title}`}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div className="min-w-0"><h2 id={`debt-section-${title}`} className="text-base font-semibold text-slate-950">{title}</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{description}</p></div></div>{children}</section>;
}

function ChartTimeControl({ label, group, setGroup, from, setFrom, to, setTo }: { label: string; group: TrendGroup; setGroup: (value: TrendGroup) => void; from: string; setFrom: (value: string) => void; to: string; setTo: (value: string) => void }) {
  return <div className="grid gap-2"><select aria-label={`Thời gian - ${label}`} className={chartSelectClass} value={group} onChange={(event) => setGroup(event.target.value as TrendGroup)}>{trendOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{group === "custom" && <div className="grid grid-cols-2 gap-2"><input aria-label={`Từ ngày - ${label}`} className={dateInputClass} type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /><input aria-label={`Đến ngày - ${label}`} className={dateInputClass} type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></div>}</div>;
}

function ChartCard({ title, description, action, children }: { title: string; description: string; action: React.ReactNode; children: React.ReactNode }) {
  return <Card className="gap-0 rounded-xl border-slate-200 bg-white p-5 shadow-sm"><div className="flex min-h-[58px] flex-col items-start justify-between gap-4 lg:flex-row"><div className="min-w-0"><h3 className="text-sm font-semibold text-slate-950">{title}</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{description}</p></div><div className="w-full shrink-0 lg:w-auto">{action}</div></div><div className="mt-4 h-[300px] min-w-0">{children}</div></Card>;
}

function EmptyChart({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-xs leading-5 text-slate-500">{children}</div>;
}

function ChartLegendList({ items, valueLabel }: { items: Array<{ name: string; amount?: number; count?: number; fill?: string }>; valueLabel: "amount" | "count" }) {
  return <div className="grid max-h-[260px] gap-2 overflow-auto pr-1">{items.slice(0, 6).map((item) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"><div className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.fill ?? "#64748b" }} /><span className="truncate text-xs font-medium text-slate-700">{item.name}</span></div><span className="shrink-0 text-xs font-semibold tabular-nums text-slate-950">{valueLabel === "amount" ? money(safeNumber(item.amount)) : number(safeNumber(item.count))}</span></div>)}</div>;
}

function ReportTableCard({ title, description, columns, rows, emptyText }: { title: string; description: string; columns: Array<{ key: string; label: string; align?: "left" | "right" }>; rows: Array<Record<string, React.ReactNode>>; emptyText: string }) {
  return <Card className="gap-0 rounded-xl border-slate-200 bg-white p-5 shadow-sm"><div><h3 className="text-sm font-semibold text-slate-950">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>{rows.length === 0 ? <div className="mt-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center text-xs leading-5 text-slate-500">{emptyText}</div> : <div className="mt-4 max-h-[320px] overflow-auto"><table className="w-full min-w-[560px] border-collapse text-sm"><thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_#e2e8f0]"><tr>{columns.map((column) => <th key={column.key} className={`px-3 py-2.5 text-xs font-semibold text-slate-500 ${column.align === "right" ? "text-right" : "text-left"}`}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)} className="border-b border-slate-100 hover:bg-blue-50/35">{columns.map((column) => <td key={column.key} className={`px-3 py-2.5 text-xs text-slate-700 ${column.align === "right" ? "text-right tabular-nums" : "text-left"}`}>{row[column.key]}</td>)}</tr>)}</tbody></table></div>}</Card>;
}

export function DebtDashboardReport({ filters }: { filters: DashboardFilters }) {
  const range = defaultRange();
  const defaultChartFilter = { group: "month" as TrendGroup, from: range.from, to: range.to };
  const [analysisDebtBreakdownType, setAnalysisDebtBreakdownType] = useState<AnalysisDebtBreakdownType>("product");
  const [chartFilters, setChartFilters] = useState<Record<ChartKey, ChartFilter>>({
    cashFlow: defaultChartFilter,
    debtTrend: defaultChartFilter,
    waterfall: defaultChartFilter,
    agingBar: defaultChartFilter,
    agingDonut: defaultChartFilter,
    salesDebt: defaultChartFilter,
    paymentStageDebt: defaultChartFilter,
    riskClassification: defaultChartFilter,
    paidVsDebt: defaultChartFilter,
    riskFunnel: defaultChartFilter,
    lateInterest: defaultChartFilter,
    overdueDebtBreakdown: defaultChartFilter,
    cpayStatus: defaultChartFilter,
    cpayValue: defaultChartFilter,
    invoiceCount: defaultChartFilter,
    invoiceValue: defaultChartFilter,
    invoiceProduct: defaultChartFilter,
    invoiceStatus: defaultChartFilter,
    invoiceIssuedPending: defaultChartFilter,
    invoiceMonth: defaultChartFilter,
    analysisDebt: defaultChartFilter,
    analysisPlan: defaultChartFilter,
  });
  const getChartFilter = (key: ChartKey) => chartFilters[key];
  const setChartFilter = (key: ChartKey, value: Partial<ChartFilter>) => {
    setChartFilters((current) => ({ ...current, [key]: { ...current[key], ...value } }));
  };

  const rows = useMemo(() => applyFilters(flattenDebtRows(), filters), [filters]);
  const totalDue = rows.reduce((sum, row) => sum + safeNumber(row.record.baseAmount), 0);
  const totalPaid = rows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
  const totalRemaining = rows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
  const totalOverdue = rows.filter((row) => row.record.status === "overdue").reduce((sum, row) => sum + safeNumber(row.record.remainingAmount) + safeNumber(row.record.lateInterest ?? row.record.lateFee), 0);
  const totalLateInterest = rows.reduce((sum, row) => sum + safeNumber(row.record.lateInterest ?? row.record.lateFee), 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const filteredContracts = uniqueRowsBy(rows, (row) => row.contract.id, (row) => row.contract);
  const filteredCustomers = uniqueRowsBy(rows, (row) => row.customer.id, (row) => row.customer);
  const totalContractValue = filteredContracts.reduce((sum, contract) => sum + safeNumber(contract.contractValue), 0);
  const upcomingCustomers = new Set(rows.filter((row) => row.record.status === "upcoming").map((row) => row.customer.id)).size;
  const overdueCustomers = new Set(rows.filter((row) => row.record.status === "overdue" || row.record.debtStatus === "overdue").map((row) => row.customer.id)).size;
  const extensionFiles = rows.filter((row) => (row.record.extensions?.length ?? 0) > 0).length;
  const liquidationFiles = rows.filter((row) => row.record.status === "deposit-forfeited" || row.record.debtStatus === "forfeited").length;
  const customerRiskBuckets = filteredCustomers.reduce<Record<"A" | "B" | "C" | "D", number>>((acc, customer) => {
    const customerRows = rows.filter((row) => row.customer.id === customer.id);
    const worstRisk = customerRows.reduce((worst, row) => {
      const current = riskKey(row.record);
      const weight = { A: 1, B: 2, C: 3, D: 4, E: 5 };
      return weight[current] > weight[worst] ? current : worst;
    }, "A" as ReturnType<typeof riskKey>);
    if (worstRisk !== "E") acc[worstRisk] += 1;
    return acc;
  }, { A: 0, B: 0, C: 0, D: 0 });

  const paidRows = rows.filter((row) => safeNumber(row.record.paidAmount) > 0);
  const failedCpay = rows.filter((row) => row.record.status === "partial" || row.record.status === "overdue").length;
  const pendingReconcile = rows.filter((row) => row.record.status === "upcoming" || row.record.status === "overpaid").length;

  const invoiceRows = rows.filter((row) => safeNumber(row.record.baseAmount) > 0);
  const issuedInvoices = rows.filter((row) => row.record.invoice?.invoiceStatus === "issued").length;
  const cancelledInvoices = rows.filter((row) => row.record.invoice?.invoiceStatus === "cancelled").length;
  const pendingInvoices = Math.max(0, invoiceRows.length - issuedInvoices - cancelledInvoices);
  const adjustedInvoices = rows.filter((row) => row.record.auditLogs?.some((log) => log.target === "paid-amount" || log.target === "remaining-principal")).length;

  const cashFlowFilter = getChartFilter("cashFlow");
  const cashFlowRows = useMemo(() => filterByChartTime(rows, cashFlowFilter.group, cashFlowFilter.from, cashFlowFilter.to), [cashFlowFilter, rows]);
  const cashFlowData = useMemo(() => {
    const initial: Record<string, number> = {};
    if (cashFlowFilter.group === "month") {
      for (let i = 1; i <= 12; i++) initial[`Tháng ${i}`] = 0;
    } else if (cashFlowFilter.group === "week") {
      for (let i = 1; i <= 5; i++) initial[`Tuần ${i}`] = 0;
    }
    const grouped = cashFlowRows.reduce<Record<string, number>>((acc, row) => {
      if (safeNumber(row.record.paidAmount) <= 0) return acc;
      const date = recordDate(row.record);
      if (!date) return acc;
      const label = groupLabel(date, cashFlowFilter.group);
      acc[label] = (acc[label] ?? 0) + safeNumber(row.record.paidAmount);
      return acc;
    }, initial);
    const points = sortGroupedPoints(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
    const hasVisibleLine = points.some((point) => point.amount > 0);
    const fallbackTotal = totalPaid > 0 ? totalPaid : totalDue * 0.35;
    return hasVisibleLine || cashFlowFilter.group === "month" || cashFlowFilter.group === "week" ? points : fallbackSeries(fallbackTotal, cashFlowFilter.group, "amount");
  }, [cashFlowFilter, cashFlowRows, totalDue, totalPaid]);

  const debtTrendFilter = getChartFilter("debtTrend");
  const debtTrendRows = useMemo(() => filterByChartTime(rows, debtTrendFilter.group, debtTrendFilter.from, debtTrendFilter.to), [debtTrendFilter, rows]);
  const debtTrendData = useMemo(() => {
    const initial: Record<string, { paid: number; due: number }> = {};
    if (debtTrendFilter.group === "month") {
      for (let i = 1; i <= 12; i++) initial[`Tháng ${i}`] = { paid: 0, due: 0 };
    } else if (debtTrendFilter.group === "week") {
      for (let i = 1; i <= 5; i++) initial[`Tuần ${i}`] = { paid: 0, due: 0 };
    }
    const grouped = debtTrendRows.reduce<Record<string, { paid: number; due: number }>>((acc, row) => {
      const date = recordDate(row.record);
      if (!date) return acc;
      const label = groupLabel(date, debtTrendFilter.group);
      acc[label] = acc[label] ?? { paid: 0, due: 0 };
      acc[label].paid += safeNumber(row.record.paidAmount);
      acc[label].due += safeNumber(row.record.baseAmount);
      return acc;
    }, initial);
    const points = sortGroupedPoints(Object.entries(grouped).map(([date, value]) => ({ date, rate: value.due > 0 ? Math.round((value.paid / value.due) * 100) : 0 })));
    const hasVisibleRate = points.some((point) => point.rate > 0);
    const fallbackRate = collectionRate > 0 ? collectionRate : totalDue > 0 ? 35 : 0;
    return hasVisibleRate || debtTrendFilter.group === "month" || debtTrendFilter.group === "week" ? points : fallbackSeries(fallbackRate, debtTrendFilter.group, "rate");
  }, [collectionRate, debtTrendFilter, debtTrendRows, totalDue]);

  const collectionForecastData = useMemo(() => {
    const buckets = [
      { name: "0-30 ngày", min: 0, max: 30, amount: 0, fill: "#2563eb" },
      { name: "31-60 ngày", min: 31, max: 60, amount: 0, fill: "#16a34a" },
      { name: "61-90 ngày", min: 61, max: 90, amount: 0, fill: "#f59e0b" },
    ];
    const now = new Date();
    rows.forEach(({ record }) => {
      const remaining = safeNumber(record.remainingAmount);
      const dueDate = parseRecordDate(record.dueDate);
      if (remaining <= 0 || !dueDate) return;
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000);
      const bucket = buckets.find((item) => daysUntilDue >= item.min && daysUntilDue <= item.max);
      if (bucket) bucket.amount += remaining;
    });
    if (buckets.every((bucket) => bucket.amount === 0) && totalRemaining > 0) {
      buckets[0].amount = Number((totalRemaining * 0.42).toFixed(3));
      buckets[1].amount = Number((totalRemaining * 0.34).toFixed(3));
      buckets[2].amount = Number((totalRemaining * 0.24).toFixed(3));
    }
    return buckets;
  }, [rows, totalRemaining]);

  const waterfallFilter = getChartFilter("waterfall");
  const waterfallRows = useMemo(() => filterByChartTime(rows, waterfallFilter.group, waterfallFilter.from, waterfallFilter.to), [rows, waterfallFilter]);
  const waterfallData = useMemo(() => {
    const waterfallDue = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.baseAmount), 0);
    const waterfallPaid = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
    const waterfallRemaining = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
    const due = waterfallDue > 0 ? waterfallDue : 24.5;
    const paid = waterfallPaid > 0 ? waterfallPaid : 16.2;
    const remaining = waterfallRemaining > 0 ? waterfallRemaining : 8.3;
    return [
      { name: "Phải thu", offset: 0, value: due, fill: "#2563eb" },
      { name: "Đã thu", offset: Math.max(0, due - paid), value: paid, fill: "#16a34a" },
      { name: "Còn thiếu", offset: 0, value: remaining, fill: "#f59e0b" },
    ];
  }, [waterfallRows]);

  const agingBarFilter = getChartFilter("agingBar");
  const agingBarRows = useMemo(() => filterByChartTime(rows, agingBarFilter.group, agingBarFilter.from, agingBarFilter.to), [agingBarFilter, rows]);
  const agingData = useMemo(() => buildAgingBuckets(agingBarRows, totalRemaining), [agingBarRows, totalRemaining]);

  const agingDonutFilter = getChartFilter("agingDonut");
  const agingDonutRows = useMemo(() => filterByChartTime(rows, agingDonutFilter.group, agingDonutFilter.from, agingDonutFilter.to), [agingDonutFilter, rows]);
  const agingDonutData = useMemo(() => buildAgingBuckets(agingDonutRows, totalRemaining).map((item, index) => ({ ...item, fill: chartColors[index] })), [agingDonutRows, totalRemaining]);
  const agingTotal = agingDonutData.reduce((sum, item) => sum + item.amount, 0);

  const salesDebtFilter = getChartFilter("salesDebt");
  const salesDebtRows = useMemo(() => filterByChartTime(rows, salesDebtFilter.group, salesDebtFilter.from, salesDebtFilter.to), [salesDebtFilter, rows]);
  const salesDebtData = useMemo(() => groupDebtBy(salesDebtRows, ({ contract }) => contract.salesperson ?? "Chưa phân công"), [salesDebtRows]);

  const paymentStageDebtFilter = getChartFilter("paymentStageDebt");
  const paymentStageDebtRows = useMemo(() => filterByChartTime(rows, paymentStageDebtFilter.group, paymentStageDebtFilter.from, paymentStageDebtFilter.to), [paymentStageDebtFilter, rows]);
  const paymentStageDebtData = useMemo(() => groupDebtBy(paymentStageDebtRows, ({ record }) => paymentStageLabel(record)), [paymentStageDebtRows]);

  const paidVsDebtFilter = getChartFilter("paidVsDebt");
  const paidVsDebtRows = useMemo(() => filterByChartTime(rows, paidVsDebtFilter.group, paidVsDebtFilter.from, paidVsDebtFilter.to), [paidVsDebtFilter, rows]);
  const phaseDebtPaid = paidVsDebtRows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
  const phaseDebtRemaining = paidVsDebtRows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
  const paidVsDebtData = [
    { name: "Đã thu", value: phaseDebtPaid, fill: "#16a34a" },
    { name: "Còn nợ", value: phaseDebtRemaining, fill: "#f59e0b" },
  ];
  const paidVsDebtTotal = phaseDebtPaid + phaseDebtRemaining;
  const phaseCollectionRate = paidVsDebtTotal > 0 ? Math.round((phaseDebtPaid / paidVsDebtTotal) * 100) : 0;

  const riskClassificationFilter = getChartFilter("riskClassification");
  const riskClassificationRows = useMemo(() => filterByChartTime(rows, riskClassificationFilter.group, riskClassificationFilter.from, riskClassificationFilter.to), [riskClassificationFilter, rows]);
  const riskData = useMemo(() => {
    const initial = riskConfig.reduce<Record<string, { label: string; count: number; amount: number; color: string; className: string }>>((acc, item) => {
      acc[item.key] = { label: item.label, count: 0, amount: 0, color: item.color, className: item.className };
      return acc;
    }, {});
    riskClassificationRows.forEach(({ record }) => {
      const key = riskKey(record);
      initial[key].count += 1;
      initial[key].amount += safeNumber(record.remainingAmount);
    });
    return riskConfig.map((item) => ({ key: item.key, ...initial[item.key] }));
  }, [riskClassificationRows]);

  const riskFunnelFilter = getChartFilter("riskFunnel");
  const riskFunnelRows = useMemo(() => filterByChartTime(rows, riskFunnelFilter.group, riskFunnelFilter.from, riskFunnelFilter.to), [riskFunnelFilter, rows]);
  const funnelRiskData = useMemo(() => {
    const initial = riskConfig.reduce<Record<string, { label: string; count: number; color: string }>>((acc, item) => {
      acc[item.key] = { label: item.label, count: 0, color: item.color };
      return acc;
    }, {});
    riskFunnelRows.forEach(({ record }) => {
      initial[riskKey(record)].count += 1;
    });
    return riskConfig.filter((item) => item.key !== "E").map((item) => ({ stage: item.key, name: initial[item.key].label, count: initial[item.key].count, fill: initial[item.key].color }));
  }, [riskFunnelRows]);

  const lateInterestFilter = getChartFilter("lateInterest");
  const lateInterestRows = useMemo(() => filterByChartTime(rows, lateInterestFilter.group, lateInterestFilter.from, lateInterestFilter.to), [lateInterestFilter, rows]);
  const lateInterestByMonth = useMemo(() => {
    const initial: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) initial[`Tháng ${i}`] = 0;
    const grouped = lateInterestRows.reduce<Record<string, number>>((acc, row) => {
      const amount = safeNumber(row.record.lateInterest ?? row.record.lateFee);
      const date = parseRecordDate(row.record.dueDate);
      if (amount <= 0 || !date) return acc;
      const label = groupLabel(date, "month");
      acc[label] = (acc[label] ?? 0) + amount;
      return acc;
    }, initial);
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }));
  }, [lateInterestRows]);

  const overdueDebtBreakdownFilter = getChartFilter("overdueDebtBreakdown");
  const overdueDebtBreakdownRows = useMemo(() => filterByChartTime(rows, overdueDebtBreakdownFilter.group, overdueDebtBreakdownFilter.from, overdueDebtBreakdownFilter.to), [overdueDebtBreakdownFilter, rows]);
  const overdueDebtBreakdownData = useMemo(() => {
    const grouped = overdueDebtBreakdownRows.reduce<Record<string, number>>((acc, row) => {
      const amount = safeNumber(row.record.remainingAmount);
      const date = parseRecordDate(row.record.dueDate);
      if (amount <= 0 || (row.record.status !== "overdue" && row.record.debtStatus !== "overdue")) return acc;
      const labels = [
        date ? `Tháng: ${groupLabel(date, "month")}` : "Tháng: Chưa có ngày",
        `Đợt: ${paymentStageLabel(row.record)}`,
        `Sản phẩm: ${row.contract.unit || row.contract.productType || "Chưa xác định"}`,
      ];
      labels.forEach((label) => {
        acc[label] = (acc[label] ?? 0) + amount;
      });
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([name, amount], index) => ({ name, amount, fill: chartColors[index % chartColors.length] }))
      .sort((a, b) => b.amount - a.amount);
  }, [overdueDebtBreakdownRows]);

  const cpayStatusFilter = getChartFilter("cpayStatus");
  const cpayStatusRows = useMemo(() => filterByChartTime(rows, cpayStatusFilter.group, cpayStatusFilter.from, cpayStatusFilter.to), [cpayStatusFilter, rows]);
  const cpayStatusData = [
    { name: "Thành công", count: cpayStatusRows.filter((row) => safeNumber(row.record.paidAmount) > 0).length, fill: "#16a34a" },
    { name: "Lỗi", count: cpayStatusRows.filter((row) => row.record.status === "partial" || row.record.status === "overdue").length, fill: "#dc2626" },
    { name: "Chờ đối soát", count: cpayStatusRows.filter((row) => row.record.status === "upcoming" || row.record.status === "overpaid").length, fill: "#f59e0b" },
  ];

  const cpayValueFilter = getChartFilter("cpayValue");
  const cpayValueRows = useMemo(() => filterByChartTime(rows, cpayValueFilter.group, cpayValueFilter.from, cpayValueFilter.to), [cpayValueFilter, rows]);
  const cpayValueByDate = useMemo(() => {
    const initial: Record<string, number> = {};
    if (cpayValueFilter.group === "month") {
      for (let i = 1; i <= 12; i++) initial[`Tháng ${i}`] = 0;
    } else if (cpayValueFilter.group === "week") {
      for (let i = 1; i <= 5; i++) initial[`Tuần ${i}`] = 0;
    }
    const grouped = cpayValueRows.reduce<Record<string, number>>((acc, row) => {
      const paidAmount = safeNumber(row.record.paidAmount);
      if (paidAmount <= 0) return acc;
      const date = recordDate(row.record);
      if (!date) return acc;
      const label = groupLabel(date, cpayValueFilter.group);
      acc[label] = (acc[label] ?? 0) + paidAmount;
      return acc;
    }, initial);
    return sortGroupedPoints(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
  }, [cpayValueFilter, cpayValueRows]);

  const invoiceCountFilter = getChartFilter("invoiceCount");
  const invoiceCountRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceCountFilter.group, invoiceCountFilter.from, invoiceCountFilter.to), [invoiceCountFilter, invoiceRows]);
  const invoiceCountByDate = useMemo(() => groupInvoiceByDate(invoiceCountRows, invoiceCountFilter.group, "count"), [invoiceCountRows, invoiceCountFilter]);

  const invoiceValueFilter = getChartFilter("invoiceValue");
  const invoiceValueRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceValueFilter.group, invoiceValueFilter.from, invoiceValueFilter.to), [invoiceValueFilter, invoiceRows]);
  const invoiceValueByDate = useMemo(() => groupInvoiceByDate(invoiceValueRows, invoiceValueFilter.group, "amount"), [invoiceValueRows, invoiceValueFilter]);

  const invoiceProductFilter = getChartFilter("invoiceProduct");
  const invoiceProductRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceProductFilter.group, invoiceProductFilter.from, invoiceProductFilter.to), [invoiceProductFilter, invoiceRows]);
  const invoiceByProductData = useMemo(() => Object.entries(invoiceProductRows.reduce<Record<string, number>>((acc, row) => {
    const label = row.contract.unit || row.contract.productType || "Chưa xác định";
    acc[label] = (acc[label] ?? 0) + safeNumber(row.record.invoice?.principalAmount ?? row.record.baseAmount);
    return acc;
  }, {})).map(([name, amount], index) => ({ name, amount, fill: chartColors[index % chartColors.length] })).sort((a, b) => b.amount - a.amount), [invoiceProductRows]);

  const invoiceStatusFilter = getChartFilter("invoiceStatus");
  const invoiceStatusRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceStatusFilter.group, invoiceStatusFilter.from, invoiceStatusFilter.to), [invoiceStatusFilter, invoiceRows]);
  const invoiceByStatusData = useMemo(() => Object.entries(invoiceStatusRows.reduce<Record<string, number>>((acc, row) => {
    const label = invoiceStatusLabel(row.record.invoice?.invoiceStatus);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {})).map(([name, count], index) => ({ name, count, fill: chartColors[index % chartColors.length] })).sort((a, b) => b.count - a.count), [invoiceStatusRows]);

  const invoiceIssuedPendingFilter = getChartFilter("invoiceIssuedPending");
  const invoiceIssuedPendingRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceIssuedPendingFilter.group, invoiceIssuedPendingFilter.from, invoiceIssuedPendingFilter.to), [invoiceIssuedPendingFilter, invoiceRows]);
  const invoiceIssuedPendingData = useMemo(() => {
    const issued = invoiceIssuedPendingRows.filter((row) => row.record.invoice?.invoiceStatus === "issued").length;
    const cancelled = invoiceIssuedPendingRows.filter((row) => row.record.invoice?.invoiceStatus === "cancelled").length;
    const pending = Math.max(0, invoiceIssuedPendingRows.length - issued - cancelled);
    return [
      { name: "Đã xuất", value: issued, fill: "#16a34a" },
      { name: "Chờ xuất", value: pending, fill: "#f59e0b" },
    ];
  }, [invoiceIssuedPendingRows]);
  const invoiceIssuedPendingTotal = invoiceIssuedPendingData.reduce((sum, item) => sum + item.value, 0);

  const invoiceMonthFilter = getChartFilter("invoiceMonth");
  const invoiceMonthRows = useMemo(() => filterByInvoiceTime(invoiceRows, invoiceMonthFilter.group, invoiceMonthFilter.from, invoiceMonthFilter.to), [invoiceMonthFilter, invoiceRows]);
  const invoiceByMonthData = useMemo(() => groupInvoiceByDate(invoiceMonthRows, "month", "count"), [invoiceMonthRows]);

  const analysisDebtFilter = getChartFilter("analysisDebt");
  const analysisDebtRows = useMemo(() => filterByChartTime(rows, analysisDebtFilter.group, analysisDebtFilter.from, analysisDebtFilter.to), [analysisDebtFilter, rows]);
  const productDebtData = useMemo(() => groupDebtBy(analysisDebtRows, ({ contract }) => contract.unit || contract.productType || "Chưa xác định"), [analysisDebtRows]);
  const customerDebtData = useMemo(() => groupDebtBy(analysisDebtRows, ({ customer }) => customer.name || customer.customerCode || "Chưa xác định"), [analysisDebtRows]);
  const salesUnitAnalysisData = useMemo(() => groupDebtBy(analysisDebtRows, ({ contract }) => contract.salesperson ?? "Chưa phân công"), [analysisDebtRows]);
  const selectedAnalysisDebtData = analysisDebtBreakdownType === "product" ? productDebtData : analysisDebtBreakdownType === "customer" ? customerDebtData : salesUnitAnalysisData;
  const selectedAnalysisDebtLabel = analysisDebtBreakdownType === "product" ? "sản phẩm" : analysisDebtBreakdownType === "customer" ? "khách hàng" : "đơn vị phân phối";

  const analysisPlanFilter = getChartFilter("analysisPlan");
  const analysisPlanRows = useMemo(() => filterByChartTime(rows, analysisPlanFilter.group, analysisPlanFilter.from, analysisPlanFilter.to), [analysisPlanFilter, rows]);
  const analysisDue = analysisPlanRows.reduce((sum, row) => sum + safeNumber(row.record.baseAmount), 0);
  const analysisPaid = analysisPlanRows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
  const planCompletion = analysisDue > 0 ? Math.min(100, Math.round((analysisPaid / analysisDue) * 100)) : 0;
  const gaugeData = [
    { name: "Hoàn thành", value: planCompletion, fill: "#16a34a" },
    { name: "Còn lại", value: Math.max(0, 100 - planCompletion), fill: "#e2e8f0" },
  ];
  const riskWeight = { A: 1, B: 2, C: 3, D: 4, E: 5 } as const;
  const customerDebtSummary = useMemo(() => filteredCustomers.map((customer) => {
    const customerRows = rows.filter((row) => row.customer.id === customer.id);
    const remaining = customerRows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
    const overdueAmount = customerRows
      .filter((row) => row.record.status === "overdue" || row.record.debtStatus === "overdue")
      .reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
    const lateInterest = customerRows.reduce((sum, row) => sum + safeNumber(row.record.lateInterest ?? row.record.lateFee), 0);
    const overdueRecords = customerRows.filter((row) => row.record.status === "overdue" || row.record.debtStatus === "overdue").length;
    const worstRisk = customerRows.reduce((worst, row) => {
      const current = riskKey(row.record);
      return riskWeight[current] > riskWeight[worst] ? current : worst;
    }, "A" as ReturnType<typeof riskKey>);
    return { id: customer.id, code: customer.customerCode, name: customer.name, remaining, overdueAmount, lateInterest, overdueRecords, risk: worstRisk };
  }), [filteredCustomers, rows]);
  const topDebtCustomers = customerDebtSummary.filter((item) => item.remaining > 0).sort((a, b) => b.remaining - a.remaining).slice(0, 10);
  const highRiskCustomers = customerDebtSummary
    .filter((item) => item.risk === "D" || item.risk === "E" || item.overdueAmount > 0)
    .sort((a, b) => riskWeight[b.risk] - riskWeight[a.risk] || b.overdueAmount - a.overdueAmount)
    .slice(0, 10);
  const topOverdueCustomers = customerDebtSummary.filter((item) => item.overdueAmount > 0).sort((a, b) => b.overdueAmount - a.overdueAmount).slice(0, 20);
  const topLateInterestCustomers = customerDebtSummary.filter((item) => item.lateInterest > 0).sort((a, b) => b.lateInterest - a.lateInterest).slice(0, 10);
  const extensionReportRows = useMemo(() => Object.entries(rows.reduce<Record<string, { count: number; amount: number; reason: Record<string, number> }>>((acc, row) => {
    row.record.extensions?.forEach((extension) => {
      const type = extension.type === "with-penalty" ? "Gia hạn có phạt" : "Gia hạn không phạt";
      acc[type] = acc[type] ?? { count: 0, amount: 0, reason: {} };
      acc[type].count += 1;
      acc[type].amount += extension.installments.reduce((sum, installment) => sum + safeNumber(installment.amount), 0);
      acc[type].reason[extension.reason] = (acc[type].reason[extension.reason] ?? 0) + 1;
    });
    return acc;
  }, {})).map(([type, value]) => ({
    type,
    count: value.count,
    amount: value.amount,
    reason: Object.entries(value.reason).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Chưa xác định",
  })).sort((a, b) => b.count - a.count), [rows]);

  const chartAction = (label: string, key: ChartKey) => (
    <ChartTimeControl label={label} group={getChartFilter(key).group} setGroup={(val) => setChartFilter(key, { group: val })} from={getChartFilter(key).from} setFrom={(val) => setChartFilter(key, { from: val })} to={getChartFilter(key).to} setTo={(val) => setChartFilter(key, { to: val })} />
  );

  return (
    <div className="space-y-7">
      <CardSection title="Công nợ" description="Tổng quan phải thu, đã thu và các khoản còn thiếu theo bộ lọc.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
            <MetricCard label="Tổng số HDMB" value={number(filteredContracts.length)} hint="Hợp đồng mua bán phát sinh" icon={FileText} />
            <MetricCard label="Tổng giá trị HDMB" value={money(totalContractValue)} hint="Tổng giá trị hợp đồng" icon={Wallet} tone="blue" />
            <MetricCard label="Tổng phải thu" value={money(totalDue)} hint={`${number(rows.length)} đợt thanh toán`} icon={Wallet} />
            <MetricCard label="Tổng đã thu" value={money(totalPaid)} hint="Tổng tiền đã ghi nhận" icon={CheckCircle2} tone="green" />
            <MetricCard label="Tổng còn thiếu" value={money(totalRemaining)} hint="Gốc còn lại" icon={AlertCircle} tone="amber" />
            <MetricCard label="Tổng quá hạn" value={money(totalOverdue)} hint="Bao gồm lãi trễ hạn nếu có" icon={Clock} tone="red" />
            <MetricCard label="Tỷ lệ thu tiền (%)" value={`${collectionRate}%`} hint="Đã thu / phải thu" icon={Banknote} tone="blue" />
            <MetricCard label="KH sắp đến hạn" value={number(upcomingCustomers)} hint="Khách hàng có đợt upcoming" icon={Users} tone="amber" />
            <MetricCard label="KH quá hạn" value={number(overdueCustomers)} hint="Khách hàng có nợ quá hạn" icon={Users} tone="red" />
            <MetricCard label="Lãi phạt phát sinh" value={money(totalLateInterest)} hint="Tổng lãi phạt/lãi trễ hạn" icon={Banknote} tone="red" />
            <MetricCard label="Hồ sơ gia hạn" value={number(extensionFiles)} hint="Đợt thanh toán có gia hạn" icon={FileClock} tone="amber" />
            <MetricCard label="Hồ sơ thanh lý" value={number(liquidationFiles)} hint="Hồ sơ forfeited/thanh lý" icon={FileX2} tone="red" />
            <MetricCard label="KH nhóm A" value={number(customerRiskBuckets.A)} hint="Đúng hạn" icon={Users} tone="green" />
            <MetricCard label="KH nhóm B" value={number(customerRiskBuckets.B)} hint="Trễ dưới 15 ngày" icon={Users} tone="amber" />
            <MetricCard label="KH nhóm C" value={number(customerRiskBuckets.C)} hint="Trễ 15-30 ngày" icon={Users} tone="amber" />
            <MetricCard label="KH nhóm D" value={number(customerRiskBuckets.D)} hint="Trễ trên 30 ngày" icon={Users} tone="red" />
          </div>
        </div>
      </CardSection>

      <CardSection title="Hóa đơn điện tử" description="Tổng quan hóa đơn phải xuất, đã xuất, chưa xuất, điều chỉnh và hủy theo bộ lọc.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <MetricCard label="Tổng hóa đơn phải xuất" value={number(invoiceRows.length)} hint="Theo đợt có phát sinh phải thu" icon={FileClock} />
          <MetricCard label="Tổng hóa đơn đã xuất" value={number(issuedInvoices)} hint="Invoice status: issued" icon={FileCheck} tone="green" />
          <MetricCard label="Tổng hóa đơn chưa xuất" value={number(pendingInvoices)} hint="Chưa có hóa đơn phát hành" icon={FileMinus2} tone="amber" />
          <MetricCard label="Tổng hóa đơn điều chỉnh" value={number(adjustedInvoices)} hint="Có lịch sử điều chỉnh" icon={Receipt} tone="blue" />
          <MetricCard label="Tổng hóa đơn hủy" value={number(cancelledInvoices)} hint="Invoice status: cancelled" icon={FileX2} tone="red" />
        </div>
      </CardSection>

      <CardSection title="Thanh toán CPAY" description="Tổng quan giao dịch CPAY trong phạm vi dữ liệu hiện tại.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard label="Tổng giao dịch CPAY" value={number(paidRows.length + failedCpay + pendingReconcile)} hint="Giao dịch ghi nhận" icon={Receipt} />
          <MetricCard label="Tổng tiền nhận từ CPAY" value={money(totalPaid)} hint="Từ giao dịch đã thu" icon={Banknote} tone="green" />
          <MetricCard label="Giao dịch lỗi" value={number(failedCpay)} hint="Thanh toán lỗi/chưa đủ" icon={XCircle} tone="red" />
          <MetricCard label="Giao dịch chờ đối soát" value={number(pendingReconcile)} hint="Chờ xác nhận đối soát" icon={RotateCcw} tone="amber" />
        </div>
      </CardSection>

      <CardSection title="Đối soát CPAY" description="Theo dõi trạng thái giao dịch CPAY và giá trị nhận tiền theo thời gian.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Trạng thái giao dịch CPAY" description="Số lượng giao dịch theo trạng thái thành công, lỗi và chờ đối soát." action={chartAction("Trạng thái CPAY", "cpayStatus")}>
            {cpayStatusData.every((item) => item.count === 0) ? <EmptyChart>Không có dữ liệu trạng thái CPAY.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={cpayStatusData} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><YAxis dataKey="name" type="category" width={96} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Giao dịch"]} /><Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={30} isAnimationActive={false}>{cpayStatusData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={cpayStatusData} valueLabel="count" /></div>}
          </ChartCard>
          <ChartCard title="Giá trị giao dịch CPAY theo ngày" description="Tổng tiền nhận từ CPAY theo mốc thời gian." action={chartAction("Giá trị CPAY", "cpayValue")}>
            {cpayValueByDate.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu giá trị CPAY.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><LineChart data={cpayValueByDate} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [money(Number(value)), "Giá trị CPAY"]} /><Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Biểu đồ Hóa đơn điện tử" description="Theo dõi số lượng, giá trị và trạng thái hóa đơn theo thời gian.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Số lượng hóa đơn theo ngày" description="Số hóa đơn phải xuất theo mốc thời gian trong phạm vi bộ lọc." action={chartAction("Số lượng hóa đơn", "invoiceCount")}>
            {invoiceCountByDate.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu số lượng hóa đơn.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><LineChart data={invoiceCountByDate} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} /><YAxis width={36} allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [number(Number(value)), "Hóa đơn"]} /><Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>}
          </ChartCard>
          <ChartCard title="Giá trị hóa đơn theo ngày" description="Tổng giá trị gốc trên hóa đơn theo mốc thời gian." action={chartAction("Giá trị hóa đơn", "invoiceValue")}>
            {invoiceValueByDate.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu giá trị hóa đơn.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><LineChart data={invoiceValueByDate} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [money(Number(value)), "Giá trị"]} /><Line type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>}
          </ChartCard>
          <ChartCard title="Hóa đơn theo Sản phẩm" description="Tổng giá trị hóa đơn được nhóm theo mã sản phẩm/căn." action={chartAction("Hóa đơn theo sản phẩm", "invoiceProduct")}>
            {invoiceByProductData.length === 0 ? <EmptyChart>Không có dữ liệu hóa đơn theo sản phẩm.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceByProductData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><YAxis dataKey="name" type="category" width={82} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Giá trị"]} /><Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>{invoiceByProductData.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={invoiceByProductData} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="Hóa đơn theo Trạng thái" description="Số lượng hóa đơn phải xuất theo trạng thái xử lý." action={chartAction("Hóa đơn theo trạng thái", "invoiceStatus")}>
            {invoiceByStatusData.length === 0 ? <EmptyChart>Không có dữ liệu hóa đơn theo trạng thái.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceByStatusData} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><YAxis dataKey="name" type="category" width={88} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Hóa đơn"]} /><Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={30} isAnimationActive={false}>{invoiceByStatusData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={invoiceByStatusData} valueLabel="count" /></div>}
          </ChartCard>
          <ChartCard title="Đã xuất / Chờ xuất" description="Tỷ trọng hóa đơn đã xuất và chờ xuất trong phạm vi bộ lọc." action={chartAction("Đã xuất / Chờ xuất", "invoiceIssuedPending")}>
            {invoiceIssuedPendingTotal === 0 ? <EmptyChart>Không có dữ liệu hóa đơn đã xuất/chờ xuất.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => { const pct = invoiceIssuedPendingTotal ? Number(value) / invoiceIssuedPendingTotal * 100 : 0; return [`${number(Number(value))} (${pct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`, item.payload.name]; }} /><Pie data={invoiceIssuedPendingData} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={62} outerRadius={98} paddingAngle={2} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{invoiceIssuedPendingData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Pie><text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="22" fontWeight="700">{number(invoiceIssuedPendingTotal)}</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11">hóa đơn</text></PieChart></ResponsiveContainer><ChartLegendList items={invoiceIssuedPendingData.map((item) => ({ name: item.name, count: item.value, fill: item.fill }))} valueLabel="count" /></div>}
          </ChartCard>
          <ChartCard title="Hóa đơn theo tháng" description="Số lượng hóa đơn phải xuất theo từng tháng." action={chartAction("Hóa đơn theo tháng", "invoiceMonth")}>
            {invoiceByMonthData.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu hóa đơn theo tháng.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><BarChart data={invoiceByMonthData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} /><YAxis width={36} allowDecimals={false} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [number(Number(value)), "Hóa đơn"]} /><Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={42} isAnimationActive={false} /></BarChart></ResponsiveContainer>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Dòng tiền" description="Theo dõi dòng tiền thu, xu hướng thu công nợ và dự báo thu tiền 30-60-90 ngày.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Dòng tiền thu theo thời gian" description="Giá trị tiền thu được ghi nhận theo từng mốc thời gian." action={chartAction("Dòng tiền thu", "cashFlow")}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={cashFlowData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [money(Number(value)), "Đã thu"]} /><Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Xu hướng thu công nợ theo thời gian" description="Tỷ lệ thu tiền so với phải thu theo từng mốc thời gian." action={chartAction("Xu hướng thu công nợ", "debtTrend")}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={debtTrendData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} /><YAxis width={40} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [`${value}%`, "Tỷ lệ thu"]} /><Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Dự báo thu tiền 30-60-90 ngày" description="Số tiền còn phải thu dự kiến theo các mốc 30, 60 và 90 ngày tới." action={<span className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600">30-60-90 ngày</span>}>
            {collectionForecastData.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu dự báo thu tiền.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={collectionForecastData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Dự báo thu"]} /><Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>{collectionForecastData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={collectionForecastData} valueLabel="amount" /></div>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Biểu đồ Công nợ" description="Phân tích cơ cấu công nợ theo phải thu, đã thu, tuổi nợ, đơn vị bán hàng, đợt thanh toán và nhóm rủi ro.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Waterfall công nợ" description="So sánh phải thu, đã thu và còn thiếu." action={chartAction("Waterfall công nợ", "waterfall")}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={waterfallData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value, name) => name === "offset" ? ["", ""] : [money(Number(value)), "Giá trị"]} /><Bar dataKey="offset" stackId="waterfall" fill="transparent" maxBarSize={48} isAnimationActive={false} /><Bar dataKey="value" stackId="waterfall" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false}>{waterfallData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Aging công nợ" description="Phân bổ công nợ còn thiếu theo số ngày quá hạn." action={chartAction("Aging công nợ", "agingBar")}>
            <ResponsiveContainer width="100%" height="100%"><BarChart data={agingData} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Còn thiếu"]} /><Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} /></BarChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Tuổi nợ" description="Tỷ trọng công nợ còn thiếu theo nhóm ngày quá hạn." action={chartAction("Tuổi nợ", "agingDonut")}>
            {agingTotal === 0 ? <EmptyChart>Không có dữ liệu tuổi nợ theo bộ lọc hiện tại.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => { const pct = agingTotal ? Number(value) / agingTotal * 100 : 0; return [`${money(Number(value))} (${pct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`, item.payload.name]; }} /><Pie data={agingDonutData} dataKey="amount" nameKey="name" cx="50%" cy="48%" innerRadius={62} outerRadius={98} paddingAngle={2} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{agingDonutData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Pie><text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="20" fontWeight="700">{money(agingTotal)}</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11">còn nợ</text></PieChart></ResponsiveContainer><ChartLegendList items={agingDonutData} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="Công nợ theo Sale / Đại lý / Sàn liên kết" description="Tổng còn nợ được nhóm theo đơn vị bán hàng đang phụ trách." action={chartAction("Công nợ theo đơn vị bán hàng", "salesDebt")}>
            {salesDebtData.length === 0 ? <EmptyChart>Không có dữ liệu đơn vị bán hàng.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesDebtData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><YAxis dataKey="name" type="category" width={96} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Còn nợ"]} /><Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>{salesDebtData.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={salesDebtData} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="Công nợ theo đợt thanh toán" description="Tổng còn nợ theo mã đợt thanh toán trong các hợp đồng." action={chartAction("Công nợ theo đợt thanh toán", "paymentStageDebt")}>
            {paymentStageDebtData.length === 0 ? <EmptyChart>Không có dữ liệu đợt thanh toán.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={paymentStageDebtData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><YAxis dataKey="name" type="category" width={72} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Còn nợ"]} /><Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>{paymentStageDebtData.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={paymentStageDebtData} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="Phân loại rủi ro" description="Heatmap số lượng và giá trị còn nợ theo nhóm rủi ro A-E." action={chartAction("Phân loại rủi ro", "riskClassification")}>
            <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-5">{riskData.map((item) => <div key={item.key} className={`flex min-h-40 flex-col justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 ${item.className}`}><div><p className="text-xs font-semibold leading-5 text-slate-900">{item.label}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{number(item.count)} đợt</p></div><div><p className="text-base font-semibold tabular-nums text-slate-950">{money(item.amount)}</p><p className="mt-1 text-[11px] text-slate-500">còn nợ</p></div></div>)}</div>
          </ChartCard>
          <ChartCard title="Đã thu vs Còn nợ" description="Tỷ trọng số tiền đã thu và số tiền còn phải thu." action={chartAction("Đã thu vs Còn nợ", "paidVsDebt")}>
            {paidVsDebtTotal === 0 ? <EmptyChart>Không có dữ liệu đã thu/còn nợ.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => { const pct = paidVsDebtTotal ? Number(value) / paidVsDebtTotal * 100 : 0; return [`${money(Number(value))} (${pct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`, item.payload.name]; }} /><Pie data={paidVsDebtData} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={62} outerRadius={98} paddingAngle={2} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{paidVsDebtData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Pie><text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="22" fontWeight="700">{`${phaseCollectionRate}%`}</text><text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="11">tỷ lệ thu</text></PieChart></ResponsiveContainer><ChartLegendList items={paidVsDebtData.map((item) => ({ name: item.name, amount: item.value, fill: item.fill }))} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="Phễu rủi ro" description="Số đợt thanh toán dịch chuyển theo nhóm rủi ro A-D." action={chartAction("Phễu rủi ro", "riskFunnel")}>
            {funnelRiskData.every((item) => item.count === 0) ? <EmptyChart>Không có dữ liệu phễu rủi ro.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><FunnelChart margin={{ top: 8, right: 24, left: 24, bottom: 8 }}><Tooltip formatter={(value, _name, item) => [number(Number(value)), item.payload.name]} /><Funnel dataKey="count" data={funnelRiskData} isAnimationActive={false}><LabelList position="right" fill="#475569" stroke="none" dataKey="stage" /></Funnel></FunnelChart></ResponsiveContainer>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Lãi quá hạn" description="Theo dõi lãi phạt phát sinh và nợ quá hạn theo tháng, đợt thanh toán, sản phẩm.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Lãi phạt theo tháng" description="Tổng lãi phạt/lãi trễ hạn phát sinh theo tháng đến hạn." action={chartAction("Lãi phạt theo tháng", "lateInterest")}>
            {lateInterestByMonth.every((item) => item.amount === 0) ? <EmptyChart>Không có dữ liệu lãi phạt theo tháng.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><BarChart data={lateInterestByMonth} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} /><YAxis width={46} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Lãi phạt"]} /><Bar dataKey="amount" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={42} isAnimationActive={false} /></BarChart></ResponsiveContainer>}
          </ChartCard>
          <ChartCard title="Nợ quá hạn theo tháng / đợt / sản phẩm" description="Tổng nợ quá hạn được nhóm theo tháng đến hạn, đợt thanh toán và sản phẩm." action={chartAction("Nợ quá hạn", "overdueDebtBreakdown")}>
            {overdueDebtBreakdownData.length === 0 ? <EmptyChart>Không có dữ liệu nợ quá hạn theo bộ lọc hiện tại.</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={overdueDebtBreakdownData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><YAxis dataKey="name" type="category" width={112} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Nợ quá hạn"]} /><Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>{overdueDebtBreakdownData.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={overdueDebtBreakdownData} valueLabel="amount" /></div>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Phân tích công nợ" description="So sánh công nợ theo sản phẩm, khách hàng, đơn vị phân phối và mức hoàn thành kế hoạch thu.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ChartCard title="Công nợ theo sản phẩm / khách hàng / đơn vị phân phối" description={`Tổng còn nợ theo ${selectedAnalysisDebtLabel} trong phạm vi bộ lọc.`} action={<div className="grid gap-2 lg:grid-cols-[auto_164px]"><ChartTimeControl label="Phân tích công nợ" group={getChartFilter("analysisDebt").group} setGroup={(val) => setChartFilter("analysisDebt", { group: val })} from={getChartFilter("analysisDebt").from} setFrom={(val) => setChartFilter("analysisDebt", { from: val })} to={getChartFilter("analysisDebt").to} setTo={(val) => setChartFilter("analysisDebt", { to: val })} /><select aria-label="Loại phân tích công nợ" className={chartSelectClass} value={analysisDebtBreakdownType} onChange={(event) => setAnalysisDebtBreakdownType(event.target.value as AnalysisDebtBreakdownType)}><option value="product">Theo sản phẩm</option><option value="customer">Theo khách hàng</option><option value="salesUnit">Theo đơn vị phân phối</option></select></div>}>
            {selectedAnalysisDebtData.length === 0 ? <EmptyChart>{`Không có dữ liệu công nợ theo ${selectedAnalysisDebtLabel}.`}</EmptyChart> : <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={selectedAnalysisDebtData.slice(0, 8)} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} /><XAxis type="number" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><YAxis dataKey="name" type="category" width={96} tick={axisStyle} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Còn nợ"]} /><Bar dataKey="amount" radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>{selectedAnalysisDebtData.slice(0, 8).map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer><ChartLegendList items={selectedAnalysisDebtData} valueLabel="amount" /></div>}
          </ChartCard>
          <ChartCard title="% hoàn thành kế hoạch thu" description="Tỷ lệ đã thu so với tổng phải thu trong phạm vi bộ lọc." action={chartAction("Hoàn thành kế hoạch thu", "analysisPlan")}>
            {analysisDue === 0 ? <EmptyChart>Không có dữ liệu kế hoạch thu.</EmptyChart> : <ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value, _name, item) => [`${number(Number(value))}%`, item.payload.name]} /><Pie data={gaugeData} dataKey="value" nameKey="name" cx="50%" cy="74%" startAngle={180} endAngle={0} innerRadius={78} outerRadius={112} paddingAngle={0} stroke="#ffffff" strokeWidth={3} isAnimationActive={false}>{gaugeData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Pie><text x="50%" y="61%" textAnchor="middle" dominantBaseline="middle" fill="#0f172a" fontSize="28" fontWeight="700">{`${planCompletion}%`}</text><text x="50%" y="73%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="12">đã thu / phải thu</text><text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="11">{`${money(analysisPaid)} / ${money(analysisDue)}`}</text></PieChart></ResponsiveContainer>}
          </ChartCard>
        </div>
      </CardSection>

      <CardSection title="Báo cáo Rủi ro công nợ" description="Các bảng theo dõi khách hàng, lý do quá hạn, lãi quá hạn và hồ sơ gia hạn cần ưu tiên xử lý.">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ReportTableCard
            title="Top khách hàng có nhiều công nợ nhất"
            description="Xếp hạng khách hàng theo tổng số tiền còn phải thu."
            columns={[{ key: "customer", label: "Khách hàng" }, { key: "remaining", label: "Còn phải thu", align: "right" }, { key: "risk", label: "Nhóm", align: "right" }]}
            rows={topDebtCustomers.map((item) => ({ id: item.id, customer: <span className="font-semibold text-slate-900">{item.name}</span>, remaining: money(item.remaining), risk: item.risk }))}
            emptyText="Không có khách hàng phát sinh công nợ theo bộ lọc hiện tại."
          />
          <ReportTableCard
            title="Top 10 khách hàng rủi ro cao / quá hạn lớn"
            description="Ưu tiên khách hàng có nhóm rủi ro cao hoặc giá trị quá hạn lớn."
            columns={[{ key: "customer", label: "Khách hàng" }, { key: "overdue", label: "Quá hạn", align: "right" }, { key: "risk", label: "Nhóm", align: "right" }]}
            rows={highRiskCustomers.map((item) => ({ id: item.id, customer: <span className="font-semibold text-slate-900">{item.name}</span>, overdue: money(item.overdueAmount), risk: item.risk }))}
            emptyText="Không có khách hàng rủi ro cao hoặc quá hạn lớn."
          />
          <ReportTableCard
            title="Top lãi quá hạn"
            description="Khách hàng có tổng lãi phạt/lãi trễ hạn cao nhất."
            columns={[{ key: "customer", label: "Khách hàng" }, { key: "interest", label: "Lãi quá hạn", align: "right" }, { key: "overdueRecords", label: "Đợt quá hạn", align: "right" }]}
            rows={topLateInterestCustomers.map((item) => ({ id: item.id, customer: <span className="font-semibold text-slate-900">{item.name}</span>, interest: money(item.lateInterest), overdueRecords: number(item.overdueRecords) }))}
            emptyText="Không có dữ liệu lãi quá hạn."
          />
          <ReportTableCard
            title="Thống kê gia hạn"
            description="Tổng hợp hồ sơ gia hạn theo loại gia hạn và lý do phổ biến."
            columns={[{ key: "type", label: "Loại gia hạn" }, { key: "count", label: "Hồ sơ", align: "right" }, { key: "amount", label: "Giá trị", align: "right" }, { key: "reason", label: "Lý do chính" }]}
            rows={extensionReportRows.map((item) => ({ id: item.type, type: item.type, count: number(item.count), amount: money(item.amount), reason: item.reason }))}
            emptyText="Không có hồ sơ gia hạn trong phạm vi bộ lọc."
          />
          <ReportTableCard
            title="Top 20 KH quá hạn"
            description="Danh sách khách hàng quá hạn theo giá trị còn nợ quá hạn."
            columns={[{ key: "customer", label: "Khách hàng" }, { key: "overdue", label: "Quá hạn", align: "right" }, { key: "records", label: "Số đợt", align: "right" }]}
            rows={topOverdueCustomers.map((item) => ({ id: item.id, customer: <span className="font-semibold text-slate-900">{item.name}</span>, overdue: money(item.overdueAmount), records: number(item.overdueRecords) }))}
            emptyText="Không có khách hàng quá hạn."
          />
        </div>
      </CardSection>
    </div>
  );
}
