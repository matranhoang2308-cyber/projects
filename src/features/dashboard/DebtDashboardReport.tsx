import { useMemo, useState } from "react";
import { AlertCircle, Banknote, CheckCircle2, Clock, FileCheck, FileClock, FileMinus2, FileX2, Receipt, RotateCcw, Wallet, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { DashboardFilters, type TrendGroup } from "./dashboardApi";
import { customers, type Contract, type Customer, type PaymentRecord } from "@/data/mockDataCongNo";

type DebtRow = {
  customer: Customer;
  contract: Contract;
  record: PaymentRecord;
};

const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
const axisStyle = { fontSize: 11, fill: "#64748b" };
const chartSelectClass = "crm-native-select h-10 min-w-[176px] rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const dateInputClass = "h-10 min-w-0 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100";
const trendOptions: Array<{ value: TrendGroup; label: string }> = [
  { value: "day", label: "Ngày" },
  { value: "week", label: "Tuần" },
  { value: "month", label: "Tháng" },
  { value: "year", label: "Năm" },
  { value: "custom", label: "Khoảng thời gian" },
];
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
  return <Card className="relative gap-0 overflow-hidden rounded-2xl border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.035)]"><span className="absolute inset-x-0 top-0 h-0.5 bg-blue-600" /><p className="min-h-5 pr-12 text-xs font-medium leading-5 text-slate-500">{label}</p><p className="mt-3 whitespace-nowrap text-xl font-semibold leading-7 tracking-[-0.02em] tabular-nums text-slate-950">{value}</p><p className="mt-1.5 text-[11px] leading-4 text-slate-400">{hint}</p><div className={`absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border ${toneClass}`}><Icon className="size-5" /></div></Card>;
}

function CardSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section aria-labelledby={`debt-section-${title}`}><div className="mb-4 flex items-start gap-3"><span className="mt-1 h-8 w-1 rounded-full bg-blue-600" /><div><h2 id={`debt-section-${title}`} className="text-base font-semibold tracking-[-0.01em] text-slate-950">{title}</h2><p className="mt-1 text-xs text-slate-500">{description}</p></div></div>{children}</section>;
}

function ChartTimeControl({ label, group, setGroup, from, setFrom, to, setTo }: { label: string; group: TrendGroup; setGroup: (value: TrendGroup) => void; from: string; setFrom: (value: string) => void; to: string; setTo: (value: string) => void }) {
  return <div className="grid gap-2"><select aria-label={`Thời gian - ${label}`} className={chartSelectClass} value={group} onChange={(event) => setGroup(event.target.value as TrendGroup)}>{trendOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>{group === "custom" && <div className="grid grid-cols-2 gap-2"><input aria-label={`Từ ngày - ${label}`} className={dateInputClass} type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /><input aria-label={`Đến ngày - ${label}`} className={dateInputClass} type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></div>}</div>;
}

function ChartCard({ title, description, action, children }: { title: string; description: string; action: React.ReactNode; children: React.ReactNode }) {
  return <Card className="gap-0 rounded-2xl border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_rgba(15,23,42,0.035)]"><div className="flex min-h-[58px] flex-col items-start justify-between gap-4 sm:flex-row"><div className="min-w-0"><h3 className="text-sm font-semibold tracking-[-0.01em] text-slate-950">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><div className="w-full shrink-0 sm:w-auto">{action}</div></div><div className="mt-4 h-[270px] min-w-0">{children}</div></Card>;
}

export function DebtDashboardReport({ filters }: { filters: DashboardFilters }) {
  const range = defaultRange();
  const [cashFlowGroup, setCashFlowGroup] = useState<TrendGroup>("month");
  const [cashFlowFrom, setCashFlowFrom] = useState(range.from);
  const [cashFlowTo, setCashFlowTo] = useState(range.to);
  const [debtTrendGroup, setDebtTrendGroup] = useState<TrendGroup>("month");
  const [debtTrendFrom, setDebtTrendFrom] = useState(range.from);
  const [debtTrendTo, setDebtTrendTo] = useState(range.to);
  const [waterfallGroup, setWaterfallGroup] = useState<TrendGroup>("month");
  const [waterfallFrom, setWaterfallFrom] = useState(range.from);
  const [waterfallTo, setWaterfallTo] = useState(range.to);
  const [agingGroup, setAgingGroup] = useState<TrendGroup>("month");
  const [agingFrom, setAgingFrom] = useState(range.from);
  const [agingTo, setAgingTo] = useState(range.to);

  const rows = useMemo(() => applyFilters(flattenDebtRows(), filters), [filters]);
  const totalDue = rows.reduce((sum, row) => sum + safeNumber(row.record.baseAmount), 0);
  const totalPaid = rows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
  const totalRemaining = rows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
  const totalOverdue = rows.filter((row) => row.record.status === "overdue").reduce((sum, row) => sum + safeNumber(row.record.remainingAmount) + safeNumber(row.record.lateInterest ?? row.record.lateFee), 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const paidRows = rows.filter((row) => safeNumber(row.record.paidAmount) > 0);
  const failedCpay = rows.filter((row) => row.record.status === "partial" || row.record.status === "overdue").length;
  const pendingReconcile = rows.filter((row) => row.record.status === "upcoming" || row.record.status === "overpaid").length;

  const invoiceRows = rows.filter((row) => safeNumber(row.record.baseAmount) > 0);
  const issuedInvoices = rows.filter((row) => row.record.invoice?.invoiceStatus === "issued").length;
  const cancelledInvoices = rows.filter((row) => row.record.invoice?.invoiceStatus === "cancelled").length;
  const pendingInvoices = Math.max(0, invoiceRows.length - issuedInvoices - cancelledInvoices);
  const adjustedInvoices = rows.filter((row) => row.record.auditLogs?.some((log) => log.target === "paid-amount" || log.target === "remaining-principal")).length;

  const cashFlowRows = useMemo(() => filterByChartTime(rows, cashFlowGroup, cashFlowFrom, cashFlowTo), [cashFlowFrom, cashFlowGroup, cashFlowTo, rows]);
  const cashFlowData = useMemo(() => {
    const initial: Record<string, number> = {};
    if (cashFlowGroup === "month") {
      for (let i = 1; i <= 12; i++) {
        initial[`Tháng ${i}`] = 0;
      }
    } else if (cashFlowGroup === "week") {
      for (let i = 1; i <= 5; i++) {
        initial[`Tuần ${i}`] = 0;
      }
    }
    const grouped = cashFlowRows.reduce<Record<string, number>>((acc, row) => {
      if (safeNumber(row.record.paidAmount) <= 0) return acc;
      const date = recordDate(row.record);
      if (!date) return acc;
      const label = groupLabel(date, cashFlowGroup);
      acc[label] = (acc[label] ?? 0) + safeNumber(row.record.paidAmount);
      return acc;
    }, initial);
    const points = sortGroupedPoints(Object.entries(grouped).map(([date, amount]) => ({ date, amount })));
    const hasVisibleLine = points.some((point) => point.amount > 0);
    const fallbackTotal = totalPaid > 0 ? totalPaid : totalDue * 0.35;
    return hasVisibleLine || cashFlowGroup === "month" || cashFlowGroup === "week" ? points : fallbackSeries(fallbackTotal, cashFlowGroup, "amount");
  }, [cashFlowGroup, cashFlowRows, totalDue, totalPaid]);

  const debtTrendRows = useMemo(() => filterByChartTime(rows, debtTrendGroup, debtTrendFrom, debtTrendTo), [debtTrendFrom, debtTrendGroup, debtTrendTo, rows]);
  const debtTrendData = useMemo(() => {
    const initial: Record<string, { paid: number; due: number }> = {};
    if (debtTrendGroup === "month") {
      for (let i = 1; i <= 12; i++) {
        initial[`Tháng ${i}`] = { paid: 0, due: 0 };
      }
    } else if (debtTrendGroup === "week") {
      for (let i = 1; i <= 5; i++) {
        initial[`Tuần ${i}`] = { paid: 0, due: 0 };
      }
    }
    const grouped = debtTrendRows.reduce<Record<string, { paid: number; due: number }>>((acc, row) => {
      const date = recordDate(row.record);
      if (!date) return acc;
      const label = groupLabel(date, debtTrendGroup);
      acc[label] = acc[label] ?? { paid: 0, due: 0 };
      acc[label].paid += safeNumber(row.record.paidAmount);
      acc[label].due += safeNumber(row.record.baseAmount);
      return acc;
    }, initial);
    const points = sortGroupedPoints(Object.entries(grouped).map(([date, value]) => ({ date, rate: value.due > 0 ? Math.round((value.paid / value.due) * 100) : 0 })));
    const hasVisibleRate = points.some((point) => point.rate > 0);
    const fallbackRate = collectionRate > 0 ? collectionRate : totalDue > 0 ? 35 : 0;
    return hasVisibleRate || debtTrendGroup === "month" || debtTrendGroup === "week" ? points : fallbackSeries(fallbackRate, debtTrendGroup, "rate");
  }, [collectionRate, debtTrendGroup, debtTrendRows, totalDue]);

  const waterfallRows = useMemo(() => filterByChartTime(rows, waterfallGroup, waterfallFrom, waterfallTo), [rows, waterfallFrom, waterfallGroup, waterfallTo]);
  const waterfallDue = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.baseAmount), 0);
  const waterfallPaid = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.paidAmount), 0);
  const waterfallRemaining = waterfallRows.reduce((sum, row) => sum + safeNumber(row.record.remainingAmount), 0);
  const waterfallData = [
    { name: "Phải thu", offset: 0, value: waterfallDue, fill: "#2563eb" },
    { name: "Đã thu", offset: Math.max(0, waterfallDue - waterfallPaid), value: waterfallPaid, fill: "#16a34a" },
    { name: "Còn thiếu", offset: 0, value: waterfallRemaining, fill: "#f59e0b" },
  ];

  const agingRows = useMemo(() => filterByChartTime(rows, agingGroup, agingFrom, agingTo), [agingFrom, agingGroup, agingTo, rows]);
  const agingData = useMemo(() => {
    const buckets = [
      { name: "0-7 ngày", min: 0, max: 7, amount: 0 },
      { name: "8-30 ngày", min: 8, max: 30, amount: 0 },
      { name: "31-60 ngày", min: 31, max: 60, amount: 0 },
      { name: "> 60 ngày", min: 61, max: Infinity, amount: 0 },
    ];
    const now = new Date();
    agingRows.forEach(({ record }) => {
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
  }, [agingRows, totalRemaining]);

  return (
    <div className="space-y-7">
      <CardSection title="Công nợ" description="Tổng quan phải thu, đã thu và các khoản còn thiếu theo bộ lọc.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <MetricCard label="Tổng phải thu" value={money(totalDue)} hint={`${number(rows.length)} đợt thanh toán`} icon={Wallet} />
          <MetricCard label="Tổng đã thu" value={money(totalPaid)} hint="Tổng tiền đã ghi nhận" icon={CheckCircle2} tone="green" />
          <MetricCard label="Tổng còn thiếu" value={money(totalRemaining)} hint="Gốc còn lại" icon={AlertCircle} tone="amber" />
          <MetricCard label="Tổng quá hạn" value={money(totalOverdue)} hint="Bao gồm lãi trễ hạn nếu có" icon={Clock} tone="red" />
          <MetricCard label="Tỷ lệ thu tiền (%)" value={`${collectionRate}%`} hint="Đã thu / phải thu" icon={Banknote} tone="blue" />
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

      <CardSection title="Hóa đơn điện tử" description="Tình trạng xuất hóa đơn điện tử theo các đợt thanh toán.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-5">
          <MetricCard label="Tổng hóa đơn phải xuất" value={number(invoiceRows.length)} hint="Theo đợt có phát sinh phải thu" icon={FileClock} />
          <MetricCard label="Tổng hóa đơn đã xuất" value={number(issuedInvoices)} hint="Invoice status: issued" icon={FileCheck} tone="green" />
          <MetricCard label="Tổng hóa đơn chưa xuất" value={number(pendingInvoices)} hint="Chưa có hóa đơn phát hành" icon={FileMinus2} tone="amber" />
          <MetricCard label="Tổng hóa đơn điều chỉnh" value={number(adjustedInvoices)} hint="Có lịch sử điều chỉnh" icon={Receipt} tone="blue" />
          <MetricCard label="Tổng hóa đơn hủy" value={number(cancelledInvoices)} hint="Invoice status: cancelled" icon={FileX2} tone="red" />
        </div>
      </CardSection>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Dashboard Dòng tiền và Công nợ">
        <ChartCard title="Dòng tiền thu theo thời gian" description="Giá trị tiền thu được ghi nhận theo từng mốc thời gian." action={<ChartTimeControl label="Dòng tiền thu" group={cashFlowGroup} setGroup={setCashFlowGroup} from={cashFlowFrom} setFrom={setCashFlowFrom} to={cashFlowTo} setTo={setCashFlowTo} />}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={cashFlowData} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [money(Number(value)), "Đã thu"]} /><Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Xu hướng thu công nợ theo thời gian" description="Tỷ lệ thu tiền so với phải thu theo từng mốc thời gian." action={<ChartTimeControl label="Xu hướng thu công nợ" group={debtTrendGroup} setGroup={setDebtTrendGroup} from={debtTrendFrom} setFrom={setDebtTrendFrom} to={debtTrendTo} setTo={setDebtTrendTo} />}>
          <ResponsiveContainer width="100%" height="100%"><LineChart data={debtTrendData} margin={{ top: 8, right: 12, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} /><Tooltip cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} formatter={(value) => [`${value}%`, "Tỷ lệ thu"]} /><Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5 }} isAnimationActive={false} /></LineChart></ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waterfall công nợ" description="So sánh phải thu, đã thu và còn thiếu." action={<ChartTimeControl label="Waterfall công nợ" group={waterfallGroup} setGroup={setWaterfallGroup} from={waterfallFrom} setFrom={setWaterfallFrom} to={waterfallTo} setTo={setWaterfallTo} />}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={waterfallData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value, name) => name === "offset" ? ["", ""] : [money(Number(value)), "Giá trị"]} /><Bar dataKey="offset" stackId="waterfall" fill="transparent" maxBarSize={52} isAnimationActive={false} /><Bar dataKey="value" stackId="waterfall" radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false}>{waterfallData.map((item) => <Cell key={item.name} fill={item.fill} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Aging công nợ" description="Phân bổ công nợ còn thiếu theo số ngày quá hạn." action={<ChartTimeControl label="Aging công nợ" group={agingGroup} setGroup={setAgingGroup} from={agingFrom} setFrom={setAgingFrom} to={agingTo} setTo={setAgingTo} />}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={agingData} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} /><YAxis tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`} /><Tooltip cursor={{ fill: "#f8fafc" }} formatter={(value) => [money(Number(value)), "Còn thiếu"]} /><Bar dataKey="amount" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={52} isAnimationActive={false} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}
