import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { cn } from "@/components/ui/utils";
import { useNavigate, useSearchParams } from "react-router";
import {
  Filter,
  FileSpreadsheet,
  Search,
  ChevronDown,
  CalendarDays,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Settings,
  LayoutGrid,
  LayoutList,
  Table2,
  MoreHorizontal,
  Plus,
  Rows3,
  Upload,
  X,
  Mail,
  Eye,
  Pencil,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";
import { ContractReminderDialog } from "@/components/reminders/ContractReminderDialog";
import { PaymentReminderDialog } from "@/components/reminders/PaymentReminderDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ContractCreatePage } from "./ContractCreatePage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import {
  defaultVisibleHdmbFieldKeys,
  hdmbImportFields,
  hdmbImportRecords,
  hdmbImportSections,
  type HdmbField,
  type HdmbRecord,
} from "@/data/hdmbImportSchema";
import { CONTRACT_STATUS_FLOW } from "@/constants/contractStatus";
import { CONTRACT_STATUS_CLASSES, canJumpToStatus } from "@/helpers/contractStatus";
import { buildTransferContractDetailSections } from "./transferContractDetailSchema";
import { TransferContractBlockView } from "./TransferContractBlockView";
import { TransferContractTableView } from "./TransferContractTableView";
import { customers } from "@/data/mockDataHopDong";
import type { Contract } from "@/data/mockDataHopDong";

const compactValue = (value?: string) => {
  if (!value || !value.trim()) return "—";
  return value;
};

const inputDateValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const defaultContractTrendRange = () => {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);
  return { from: inputDateValue(from), to: inputDateValue(to) };
};

const contractTrendFactor = (group: ContractTrendGroup, from: string, to: string) => {
  if (group === "day") return 0.18;
  if (group === "week") return 0.42;
  if (group === "month") return 0.72;
  if (group === "year") return 1.28;
  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1);
  return Math.min(1.45, Math.max(0.24, days / 45));
};

const uniqueValues = (records: HdmbRecord[], key: string) =>
  Array.from(new Set(records.map((r) => r.values[key]).filter(Boolean))).sort();

const readLocalState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

const parseCurrencyValue = (value?: string) => Number((value || "").replace(/\D/g, "")) || 0;

const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  }
  return `${Math.round(value / 1_000_000).toLocaleString("vi-VN")} triệu`;
};

const contractChartColors = ["#2563eb", "#059669", "#f59e0b", "#7c3aed", "#ef4444", "#0891b2"];

const contractTowerChartCategories = ["Vitalis", "Harmonie"];

const contractApartmentTypeChartCategories = [
  "Duplex Garden",
  "Penhouse",
  "Sky Garden",
  "Sky Villa Residence",
];

type ContractTrendGroup = "day" | "week" | "month" | "year" | "custom";

const contractTrendGroupOptions: Array<{ value: ContractTrendGroup; label: string }> = [
  { value: "day", label: "Theo ngày" },
  { value: "week", label: "Theo tuần" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
  { value: "custom", label: "Khoảng thời gian" },
];

const contractChartSelectClass = "h-9 min-w-[176px] rounded-[8px] border border-[#E5EAF3] bg-white text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 transition shadow-none text-left";
const contractDateInputClass = "h-9 min-w-0 w-full rounded-[8px] border border-[#E5EAF3] bg-white px-2.5 text-xs font-medium text-slate-700 outline-none hover:border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-slate-100 transition";

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";
const detailFilterTriggerClass = "h-9 w-full rounded-[8px] border-[#E5EAF3] bg-white text-xs text-slate-700 shadow-none";
const contractPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const contractPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const contractPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const contractPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const contractPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";
const contractTablePageSize = 10;
const contractTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const contractTableCellClass = "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const contractStickyCellClass = "bg-white transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const contractDetailCtaClass = "h-[34px] min-w-[150px] rounded-[10px] px-4 text-sm font-semibold";


type CheckStatus = "passed" | "failed";

type CheckResult = {
  status: CheckStatus;
  reason: string;
  checkedBy: string;
  checkedAt: string;
};

type HandoverStatusInfo = {
  handoverDate: string;
  handoverBy: string;
  receivedBy: string;
  handoverNote: string;
  handoverFileName: string;
};

type ReturnedStatusInfo = {
  returnedDate: string;
  returnedBy: string;
  receivedBy: string;
  returnedNote: string;
  returnedFileName: string;
};

type ContractStatusInfo = {
  handover?: HandoverStatusInfo;
  returned?: ReturnedStatusInfo;
};

const checkStatusLabel: Record<CheckStatus, string> = {
  passed: "Đã kiểm tra - Đạt",
  failed: "Đã kiểm tra - Không đạt",
};

const contractBadgeBaseClass = "inline-flex h-6 max-w-full items-center justify-center rounded-md border-transparent px-2.5 text-[11px] leading-none ring-1";
const contractStatusBadgeClass = (status?: string) => `${contractBadgeBaseClass} font-semibold ${CONTRACT_STATUS_CLASSES[status || "Đã cọc"]}`;
const contractCheckBadgeClass = (status?: CheckStatus) => {
  if (status === "passed") {
    return `${contractBadgeBaseClass} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  }
  if (status === "failed") {
    return `${contractBadgeBaseClass} bg-red-50 text-red-700 ring-red-200`;
  }
  return `${contractBadgeBaseClass} bg-slate-50 text-slate-600 ring-slate-200`;
};
const contractTransferBadgeClass = `${contractBadgeBaseClass} border-violet-200 bg-violet-50 text-violet-700 ring-violet-200`;


type TransferPerson = {
  customerCode: string;
  name: string;
  phone: string;
  idNo: string;
  idDate: string;
  idPlace: string;
  birthDate: string;
  gender: string;
  email: string;
  job: string;
  oldAddress: string;
  newAddress: string;
};

type TransferFormState = {
  newOwner: TransferPerson;
  newCoOwner: TransferPerson;
  signedDate: string;
  notarizedNo: string;
  receivedDate: string;
  confirmedDate: string;
  documentNo: string;
  fileName: string;
};

type TransferLog = {
  id: string;
  createdAt: string;
  sequence: number;
  oldOwner: TransferPerson;
  newOwner: TransferPerson;
  oldCoOwner: TransferPerson;
  newCoOwner: TransferPerson;
  form: TransferFormState;
};

const blankPerson: TransferPerson = {
  customerCode: "",
  name: "",
  phone: "",
  idNo: "",
  idDate: "",
  idPlace: "",
  birthDate: "",
  gender: "",
  email: "",
  job: "",
  oldAddress: "",
  newAddress: "",
};

const ownerFromRecord = (record: HdmbRecord): TransferPerson => ({
  customerCode: record.values.c2 || "",
  name: record.values.c3 || record.values.c30 || "",
  phone: record.values.c12 || record.values.c17 || "",
  idNo: record.values.c4 || record.values.c5 || "",
  idDate: record.values.c6 || "",
  idPlace: record.values.c7 || "",
  birthDate: record.values.c8 || "",
  gender: record.values.c9 || "",
  email: record.values.c13 || record.values.c18 || "",
  job: record.values.c14 || "",
  oldAddress: record.values.c10 || record.values.c15 || "",
  newAddress: record.values.c11 || record.values.c16 || "",
});

const coOwnerFromRecord = (record: HdmbRecord): TransferPerson => ({
  customerCode: "",
  name: record.values.c19 || "",
  phone: record.values.c27 || "",
  idNo: record.values.c20 || "",
  idDate: record.values.c21 || "",
  idPlace: record.values.c22 || "",
  birthDate: record.values.c23 || "",
  gender: record.values.c24 || "",
  email: record.values.c28 || "",
  job: record.values.c29 || "",
  oldAddress: record.values.c25 || "",
  newAddress: record.values.c26 || "",
});

const personWithFallback = (base: TransferPerson, patch: Partial<TransferPerson>): TransferPerson => ({
  ...base,
  ...patch,
});

const hasPersonChanged = (before: TransferPerson, after: TransferPerson) =>
  (Object.keys(before) as Array<keyof TransferPerson>).some((key) => before[key].trim() !== after[key].trim());

const createTransferDefaults = (record: HdmbRecord, transferCount: number): TransferFormState => {
  const owner = ownerFromRecord(record);
  const coOwner = coOwnerFromRecord(record);
  return {
    newOwner: personWithFallback(owner, {
      customerCode: owner.customerCode || "KH-CN-0001",
      name: transferCount === 0 ? "Thang Zũ" : owner.name,
      newAddress: owner.newAddress || "S1.05-12.08, Vinhomes Grand Park",
    }),
    newCoOwner: personWithFallback(coOwner.name ? coOwner : blankPerson, {
      name: coOwner.name ? "Lâm Bảo Ngọc" : "",
      phone: coOwner.phone || "",
      idNo: coOwner.idNo || "",
      idDate: coOwner.idDate || "",
      idPlace: coOwner.idPlace || "",
      birthDate: coOwner.birthDate || "",
      gender: coOwner.gender || "",
      email: coOwner.email || "",
      job: coOwner.job || "",
      oldAddress: coOwner.oldAddress || "",
      newAddress: coOwner.newAddress || "",
    }),
    signedDate: "28/08/2026",
    notarizedNo: "857493",
    receivedDate: "28/08/2026",
    confirmedDate: "28/08/2026",
    documentNo: "353534",
    fileName: "hop-dong-chuyen-nhuong.pdf",
  };
};

const ownerOverrides = (owner: TransferPerson): Record<string, string> => ({
  c2: owner.customerCode,
  c3: owner.name,
  c4: owner.idNo,
  c6: owner.idDate,
  c7: owner.idPlace,
  c8: owner.birthDate,
  c9: owner.gender,
  c10: owner.oldAddress,
  c11: owner.newAddress,
  c12: owner.phone,
  c13: owner.email,
  c14: owner.job,
});

const coOwnerOverrides = (coOwner: TransferPerson): Record<string, string> => ({
  c19: coOwner.name,
  c20: coOwner.idNo,
  c21: coOwner.idDate,
  c22: coOwner.idPlace,
  c23: coOwner.birthDate,
  c24: coOwner.gender,
  c25: coOwner.oldAddress,
  c26: coOwner.newAddress,
  c27: coOwner.phone,
  c28: coOwner.email,
  c29: coOwner.job,
});

function PersonReadOnlyCard({ title, person }: { title: string; person: TransferPerson }) {
  const items = [
    ["Mã khách hàng", person.customerCode],
    ["Họ tên khách hàng", person.name],
    ["Ngày tháng năm sinh", person.birthDate],
    ["Số điện thoại", person.phone],
    ["Số CCCD/HC", person.idNo],
    ["Ngày cấp", person.idDate],
    ["Cơ quan cấp", person.idPlace],
    ["Giới tính", person.gender],
    ["Email", person.email],
    ["Nghề nghiệp", person.job],
    ["Địa chỉ thường trú (cũ)", person.oldAddress],
    ["Địa chỉ thường trú (mới)", person.newAddress],
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
        <h4 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>{title}</h4>
        <span className="text-lg leading-none text-slate-400">−</span>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-4 px-4 py-4 md:grid-cols-3">
        {items.map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-sm text-slate-800" style={{ fontWeight: 600 }}>{compactValue(value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TransferBadge({ sequence }: { sequence: number }) {
  return <span className={contractTransferBadgeClass} style={{ fontWeight: 650 }}>CN lần {sequence}</span>;
}

function TransferHistoryBlockItem({ log, defaultOpen }: { log: TransferLog; defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
    <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left ${isOpen ? "border-b border-slate-200" : ""}`}>
      <div><h3 className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Lần chuyển nhượng #{log.sequence}</h3><p className="mt-0.5 text-[11px] text-slate-500">{log.form.signedDate || log.createdAt} · {compactValue(log.oldOwner.name)} → {compactValue(log.newOwner.name)}</p></div>
      <div className="flex shrink-0 items-center gap-2"><TransferBadge sequence={log.sequence} /><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} /></div>
    </button>
    {isOpen && <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Ngày hiệu lực</span><span className="text-slate-800" style={{ fontWeight: 650 }}>{log.form.signedDate || log.createdAt}</span></div>
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div className="rounded-md border border-slate-200 p-3"><p className="text-[11px] text-slate-400">Chủ sở hữu cũ</p><p className="mt-1 text-xs text-slate-800" style={{ fontWeight: 650 }}>{compactValue(log.oldOwner.name)}</p></div><ArrowRightLeft className="h-4 w-4 text-slate-400" /><div className="rounded-md border border-emerald-200 bg-emerald-50 p-3"><p className="text-[11px] text-emerald-600">Chủ sở hữu mới</p><p className="mt-1 text-xs text-emerald-800" style={{ fontWeight: 650 }}>{compactValue(log.newOwner.name)}</p></div></div>
            {log.form.fileName && <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-blue-600">{log.form.fileName}</p>}
          </div>
          {(log.oldCoOwner.name || log.newCoOwner.name) && <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="mb-3 inline-flex rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">Thay đổi đồng sở hữu</p><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><div className="rounded-md border border-slate-200 p-3"><p className="text-[11px] text-slate-400">Đồng sở hữu cũ</p><p className="mt-1 text-xs text-slate-800" style={{ fontWeight: 650 }}>{compactValue(log.oldCoOwner.name)}</p></div><ArrowRightLeft className="h-4 w-4 text-slate-400" /><div className="rounded-md border border-emerald-200 bg-emerald-50 p-3"><p className="text-[11px] text-emerald-600">Đồng sở hữu mới</p><p className="mt-1 text-xs text-emerald-800" style={{ fontWeight: 650 }}>{compactValue(log.newCoOwner.name)}</p></div></div></div>}
        </div>
        <div className="space-y-3"><PersonReadOnlyCard title="Thông tin chủ sở hữu cũ" person={log.oldOwner} />{log.oldCoOwner.name && <PersonReadOnlyCard title="Thông tin đồng sở hữu cũ" person={log.oldCoOwner} />}</div>
      </div>}
  </section>;
}

function TransferHistoryBlock({ logs }: { logs: TransferLog[] }) {
  return <div className="space-y-3">
    {logs.map((log, index) => <TransferHistoryBlockItem key={log.id} log={log} defaultOpen={index === logs.length - 1} />)}
  </div>;
}

function TransferInput({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-700" style={{ fontWeight: 600 }}>{required && <span className="text-red-500">* </span>}{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        placeholder={label}
      />
    </label>
  );
}

function TransferPersonForm({ person, onChange }: { person: TransferPerson; onChange: (person: TransferPerson) => void }) {
  const setField = (key: keyof TransferPerson, value: string) => onChange({ ...person, [key]: value });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TransferInput label="Mã khách hàng" value={person.customerCode} onChange={(value) => setField("customerCode", value)} />
      <TransferInput label="Họ và tên khách hàng" value={person.name} onChange={(value) => setField("name", value)} required />
      <TransferInput label="Số CCCD/HC" value={person.idNo} onChange={(value) => setField("idNo", value)} />
      <TransferInput label="Ngày cấp" value={person.idDate} onChange={(value) => setField("idDate", value)} />
      <TransferInput label="Cơ quan cấp" value={person.idPlace} onChange={(value) => setField("idPlace", value)} />
      <TransferInput label="Ngày tháng năm sinh" value={person.birthDate} onChange={(value) => setField("birthDate", value)} />
      <TransferInput label="Giới tính" value={person.gender} onChange={(value) => setField("gender", value)} />
      <TransferInput label="Số điện thoại" value={person.phone} onChange={(value) => setField("phone", value)} />
      <TransferInput label="Email" value={person.email} onChange={(value) => setField("email", value)} />
      <TransferInput label="Nghề nghiệp" value={person.job} onChange={(value) => setField("job", value)} />
      <TransferInput label="Địa chỉ thường trú cũ" value={person.oldAddress} onChange={(value) => setField("oldAddress", value)} />
      <TransferInput label="Địa chỉ thường trú mới" value={person.newAddress} onChange={(value) => setField("newAddress", value)} />
    </div>
  );
}

function TransferStepper({ step }: { step: number }) {
  const steps = ["Kiểm tra thông tin", "Nhập thông tin mới", "Xác nhận"];

  return (
    <div className="flex items-center gap-2 px-8 py-6">
      {steps.map((label, index) => {
        const stepNo = index + 1;
        const done = stepNo < step;
        const active = stepNo === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${active ? "border-blue-200 bg-blue-50 text-blue-700" : done ? "border-slate-200 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-400"}`} style={{ fontWeight: 650 }}>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${active ? "bg-blue-100 text-blue-700" : "bg-white text-slate-600"}`}>{stepNo}</span>
              {label}
              {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
            {index < steps.length - 1 && <div className="h-px flex-1 border-t border-dashed border-slate-300" />}
          </div>
        );
      })}
    </div>
  );
}

function TransferDialog({
  record,
  logs,
  onClose,
  onSave,
}: {
  record: HdmbRecord;
  logs: TransferLog[];
  onClose: () => void;
  onSave: (overrides: Record<string, string>, log: TransferLog) => void;
}) {
  const oldOwner = ownerFromRecord(record);
  const oldCoOwner = coOwnerFromRecord(record);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TransferFormState>(() => createTransferDefaults(record, logs.length));
  const hasCoOwner = Boolean(oldCoOwner.name || form.newCoOwner.name);
  const hasOwnershipChanges = hasPersonChanged(oldOwner, form.newOwner) || hasPersonChanged(oldCoOwner, form.newCoOwner);
  const canSaveTransfer = Boolean(form.newOwner.name.trim()) && hasOwnershipChanges;

  const saveTransfer = () => {
    if (!canSaveTransfer) return;
    const now = new Date();
    const log: TransferLog = {
      id: `${record.id}-transfer-${Date.now()}`,
      createdAt: now.toLocaleDateString("vi-VN"),
      sequence: logs.length + 1,
      oldOwner,
      newOwner: form.newOwner,
      oldCoOwner,
      newCoOwner: form.newCoOwner,
      form,
    };
    onSave({ ...ownerOverrides(form.newOwner), ...coOwnerOverrides(form.newCoOwner) }, log);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg text-slate-950" style={{ fontWeight: 750 }}>{step === 1 ? "Chuyển nhượng hợp đồng" : "Tạo hợp đồng chuyển nhượng"}</h2>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}><X className="h-5 w-5" /></Button>
        </header>

        <TransferStepper step={step} />

        <main className="flex-1 overflow-y-auto border-t border-slate-100 px-6 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 text-blue-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-6" style={{ fontWeight: 600 }}>Các thông tin sản phẩm, giá, chiết khấu và tiến độ thanh toán sẽ được giữ nguyên. Chỉ thông tin chủ sở hữu và đồng sở hữu được cập nhật sau khi xác nhận.</p>
              </div>
              <PersonReadOnlyCard title="Thông tin chủ sở hữu" person={oldOwner} />
              <PersonReadOnlyCard title="Thông tin đồng sở hữu" person={oldCoOwner} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <section className="space-y-4">
                <h3 className="text-base text-slate-950" style={{ fontWeight: 750 }}>Thông tin chủ sở hữu</h3>
                <PersonReadOnlyCard title="Thông tin chủ sở hữu cũ" person={oldOwner} />
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><h4 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>Thông tin chủ sở hữu mới</h4></div>
                  <div className="p-4"><TransferPersonForm person={form.newOwner} onChange={(newOwner) => setForm((prev) => ({ ...prev, newOwner }))} /></div>
                </section>
              </section>

              <section className="space-y-4">
                <h3 className="text-base text-slate-950" style={{ fontWeight: 750 }}>Thông tin đồng sở hữu</h3>
                <PersonReadOnlyCard title="Thông tin đồng sở hữu cũ 1" person={oldCoOwner} />
                {hasCoOwner && (
                  <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><h4 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>Thông tin đồng sở hữu mới</h4></div>
                    <div className="p-4"><TransferPersonForm person={form.newCoOwner} onChange={(newCoOwner) => setForm((prev) => ({ ...prev, newCoOwner }))} /></div>
                  </section>
                )}
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setForm((prev) => ({ ...prev, newCoOwner: personWithFallback(oldCoOwner, { name: oldCoOwner.name || "Lâm Bảo Ngọc" }) }))}>
                  <Plus className="h-4 w-4" />
                  Thêm đồng sở hữu mới
                </Button>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><h4 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>Hồ sơ chuyển nhượng</h4></div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                  <TransferInput label="Ngày ký" value={form.signedDate} onChange={(signedDate) => setForm((prev) => ({ ...prev, signedDate }))} required />
                  <TransferInput label="Số VBCN" value={form.notarizedNo} onChange={(notarizedNo) => setForm((prev) => ({ ...prev, notarizedNo }))} required />
                  <TransferInput label="Ngày nhận XNCN từ KH (đủ/thiếu)" value={form.receivedDate} onChange={(receivedDate) => setForm((prev) => ({ ...prev, receivedDate }))} required />
                  <TransferInput label="Ngày XNCN" value={form.confirmedDate} onChange={(confirmedDate) => setForm((prev) => ({ ...prev, confirmedDate }))} required />
                  <div className="md:col-span-2"><TransferInput label="Số chứng từ" value={form.documentNo} onChange={(documentNo) => setForm((prev) => ({ ...prev, documentNo }))} required /></div>
                </div>
                <div className="mx-4 mb-4 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
                  <Upload className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-3 text-sm text-slate-800" style={{ fontWeight: 650 }}>Click hoặc kéo file và thả vào vùng này</p>
                  <p className="mt-1 text-xs text-slate-400">File demo: {form.fileName}</p>
                  <Button size="sm" className="mt-4 bg-slate-950 hover:bg-slate-800" onClick={() => setForm((prev) => ({ ...prev, fileName: "hop-dong-chuyen-nhuong.pdf" }))}>Chọn File</Button>
                </div>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-4 text-xl text-slate-950" style={{ fontWeight: 750 }}>Thông tin chủ sở hữu</h3>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-400">
                      <tr>
                        <th className="border-b border-slate-100 px-5 py-3" style={{ fontWeight: 500 }}>Nội dung</th>
                        <th className="border-b border-slate-100 px-5 py-3" style={{ fontWeight: 500 }}>Trước chuyển nhượng</th>
                        <th className="border-b border-slate-100 px-5 py-3" style={{ fontWeight: 500 }}>Sau chuyển nhượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border-b border-slate-100 px-5 py-5" style={{ fontWeight: 700 }}>Chủ sở hữu</td><td className="border-b border-slate-100 px-5 py-5">{compactValue(oldOwner.name)}</td><td className="border-b border-slate-100 px-5 py-5">{compactValue(form.newOwner.name)}</td></tr>
                      <tr><td className="px-5 py-5" style={{ fontWeight: 700 }}>Đồng sở hữu</td><td className="px-5 py-5">{compactValue(oldCoOwner.name)}</td><td className="px-5 py-5">{compactValue(form.newCoOwner.name)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <h3 className="text-base text-slate-950" style={{ fontWeight: 700 }}>Thông tin công chứng</h3>
                  <span className="text-lg leading-none text-slate-400">−</span>
                </div>
                <div className="space-y-6 px-5 py-5">
                  <div>
                    <h4 className="text-sm text-slate-500" style={{ fontWeight: 700 }}>1. Thông tin VBCN công chứng</h4>
                    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                      <DetailMini label="Ngày ký" value={form.signedDate} />
                      <DetailMini label="Số VBCN" value={form.notarizedNo} />
                      <DetailMini label="Lần chuyển nhượng" value={String(logs.length + 1)} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm text-slate-500" style={{ fontWeight: 700 }}>2. Thông tin VBCN công chứng và XNCN</h4>
                    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
                      <DetailMini label="Ngày nhận XNCN từ KH (Đủ/thiếu)" value={form.receivedDate} />
                      <DetailMini label="Ngày XCCN" value={form.confirmedDate} />
                      <DetailMini label="Số chứng từ" value={form.documentNo} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">File đính kèm</p>
                    {[form.fileName, form.fileName, form.fileName].map((file, index) => <p key={`${file}-${index}`} className="mt-2 text-sm text-blue-600">{file}</p>)}
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Xác nhận CN</Button>
          <Button className="bg-slate-950 hover:bg-slate-800" disabled={step === 3 && !canSaveTransfer} onClick={() => step < 3 ? setStep((current) => current + 1) : saveTransfer()}>{step < 3 ? "Tiếp tục" : "Lưu thay đổi"}</Button>
        </footer>
      </div>
    </div>
  );
}

function DetailMini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-sm text-slate-950" style={{ fontWeight: 650 }}>{compactValue(value)}</p>
    </div>
  );
}

const sectionColor: Record<string, string> = {
  "THÔNG TIN CHUNG": "border-slate-200 bg-slate-50 text-slate-700",
  "THÔNG TIN KHÁCH HÀNG": "border-blue-200 bg-blue-50 text-blue-700",
  "SH1 - KHÁCH HÀNG SỞ HỮU 1": "border-blue-200 bg-blue-50 text-blue-700",
  "SH2 - ĐỒNG SỞ HỮU": "border-indigo-200 bg-indigo-50 text-indigo-700",
  "KHÁCH HÀNG DOANH NGHIỆP": "border-violet-200 bg-violet-50 text-violet-700",
  "THÔNG TIN NHẬN THÔNG BÁO": "border-cyan-200 bg-cyan-50 text-cyan-700",
  "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG": "border-emerald-200 bg-emerald-50 text-emerald-700",
  "THÔNG TIN CHÍNH SÁCH BÁN HÀNG": "border-amber-200 bg-amber-50 text-amber-700",
  "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB": "border-orange-200 bg-orange-50 text-orange-700",
  "LOẠI KHÁCH HÀNG": "border-sky-200 bg-sky-50 text-sky-700",
  "THÔNG TIN NHÂN VIÊN GIAO DỊCH": "border-purple-200 bg-purple-50 text-purple-700",
  "CHỨNG TỪ KÈM THEO": "border-rose-200 bg-rose-50 text-rose-700",
  "GHI CHÚ": "border-slate-200 bg-slate-50 text-slate-700",
};

const customerInfoSection = "THÔNG TIN KHÁCH HÀNG";
const ownerOneSection = "SH1 - KHÁCH HÀNG SỞ HỮU 1";
const contractDetailSections = hdmbImportSections.filter((section) => section !== "THÔNG TIN CHUNG" && section !== customerInfoSection);
const contractDetailFields = hdmbImportFields.filter((field) => field.section !== "THÔNG TIN CHUNG");
const getContractDetailFields = (section: string) => contractDetailFields.filter((field) => section === ownerOneSection ? field.section === ownerOneSection || field.section === customerInfoSection : field.section === section);
const getContractDetailSection = (field: HdmbField) => field.section === customerInfoSection ? ownerOneSection : field.section;

function SectionPill({ section }: { section: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${sectionColor[section] ?? sectionColor["THÔNG TIN CHUNG"]}`}>
      {section}
    </span>
  );
}

function DetailField({ field, value }: { field: HdmbField; value?: string }) {
  const hasValue = Boolean(value && value.trim());

  return (
    <div className="min-w-0 py-1.5">
      <p className="text-[11px] leading-4 text-slate-400" title={`Cột ${field.column}: ${field.label}`}>
        {field.label}
      </p>
      <p className={`mt-0.5 break-words text-xs leading-5 ${hasValue ? "text-slate-800" : "text-slate-300"}`} style={{ fontWeight: hasValue ? 550 : 400 }}>
        {compactValue(value)}
      </p>
    </div>
  );
}

function DetailSection({ section, record }: { section: string; record: HdmbRecord }) {
  const [isOpen, setIsOpen] = useState(true);
  const fields = getContractDetailFields(section);
  const filledCount = fields.filter((field) => record.values[field.key]).length;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((value) => !value)} className={`flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left ${isOpen ? "border-b border-slate-200" : ""}`}>
        <div>
          <h3 className="text-xs text-slate-800" style={{ fontWeight: 650 }}>{section}</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{filledCount}/{fields.length} trường có dữ liệu</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="grid grid-cols-1 gap-x-10 gap-y-1 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <DetailField key={field.key} field={field} value={record.values[field.key]} />
        ))}
      </div>}
    </section>
  );
}


const transferPersonRows = (person: TransferPerson) => [
  ["Họ tên", person.name], ["Ngày sinh", person.birthDate], ["CMND/CCCD", person.idNo], ["Ngày cấp", person.idDate], ["Nơi cấp", person.idPlace], ["Địa chỉ thường trú", person.oldAddress], ["Địa chỉ liên hệ", person.newAddress], ["Số điện thoại", person.phone], ["Email", person.email], ["Nghề nghiệp", person.job],
];

function TransferHistoryTable({ logs }: { logs: TransferLog[] }) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const toggleSection = (key: string) => setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-xs"><tbody>
    {logs.flatMap((log) => {
      const summaryRows = [["Lần chuyển nhượng", String(log.sequence)], ["Ngày chuyển nhượng", log.form.signedDate || log.createdAt], ["Chủ sở hữu cũ", log.oldOwner.name], ["Chủ sở hữu mới", log.newOwner.name], ["Đồng sở hữu cũ", log.oldCoOwner.name], ["Đồng sở hữu mới", log.newCoOwner.name], ["File hợp đồng", log.form.fileName]];
      const sectionRow = (title: string, key: string) => {
        const isCollapsed = collapsedSections[key];
        return <tr key={key} className="bg-[#F6F8FB]"><td className="w-16 border-b border-r border-[#DDE5F0] px-3 py-2 text-center text-[11px] text-slate-600" style={{ fontWeight: 650 }}>A</td><td className="border-b border-[#DDE5F0] p-0 text-[11px] text-slate-700" style={{ fontWeight: 650 }}><button type="button" aria-expanded={!isCollapsed} onClick={() => toggleSection(key)} className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] leading-4 text-slate-700 transition-colors hover:bg-[#EEF3F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300"><span className="text-[11px] leading-4">{title}</span><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`} /></button></td><td className="w-28 border-b border-[#DDE5F0] px-3 py-2 text-right"><TransferBadge sequence={log.sequence} /></td></tr>;
      };
      const dataRows = (rows: string[][], prefix: string) => rows.map(([label, value], index) => <tr key={`${log.id}-${prefix}-${index}`} className="hover:bg-[#F8FAFC]"><td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-center text-xs text-slate-400">{index + 1}</td><td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-xs text-slate-600">{label}</td><td className="border-b border-[#E5EAF3] px-3 py-2 text-right text-xs text-slate-900" style={{ fontWeight: 600 }}>{compactValue(value)}</td></tr>);
      const groups = [
        { key: `${log.id}-summary`, title: "LỊCH SỬ CHUYỂN NHƯỢNG", rows: summaryRows, prefix: "summary" },
        { key: `${log.id}-owner`, title: "THÔNG TIN CHỦ SỞ HỮU CŨ", rows: transferPersonRows(log.oldOwner), prefix: "owner" },
        ...(log.oldCoOwner.name ? [{ key: `${log.id}-co-owner`, title: "THÔNG TIN ĐỒNG SỞ HỮU CŨ", rows: transferPersonRows(log.oldCoOwner), prefix: "co-owner" }] : []),
      ];
      return groups.flatMap((group) => [sectionRow(group.title, group.key), ...(collapsedSections[group.key] ? [] : dataRows(group.rows, group.prefix))]);
    })}
  </tbody></table></div></section>;
}

function parseVNCurrency(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const digits = Number(value.replace(/\D/g, ""));
  return digits > 0 ? digits : fallback;
}

function parseVNDate(value: string | undefined, fallback: Date): Date {
  const match = value?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return fallback;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

type PaymentRowStatus = "paid" | "partial" | "overdue" | "upcoming" | "pending";

function PaymentProgressTable({
  record,
  onAddPaymentReminder,
}: {
  record: HdmbRecord;
  onAddPaymentReminder: (row: any) => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const openPayment = searchParams.get("openPayment");
    if (openPayment) {
      setTimeout(() => {
        const el = document.getElementById(`payment-row-${openPayment}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("bg-blue-50/80");
          setTimeout(() => {
            el.classList.remove("bg-blue-50/80");
          }, 3000);
        }
      }, 500);
      const next = new URLSearchParams(searchParams);
      next.delete("openPayment");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const totalValue = parseVNCurrency(record.values.c93 || record.values.c87, 3200000000);
  const depositRequired = parseVNCurrency(record.values.c94, 200000000);
  const depositCollected = parseVNCurrency(record.values.c95, 200000000);
  const depositPaidDate = record.values.c96 || "14/04/2026";
  const signingDate = record.values.c106 || "13/07/2025";
  const pttmContent = record.values.c104 || "Thanh toán chuẩn 18 đợt";
  const pttmRatio = record.values.c105 || "40%";
  const baseDate = parseVNDate(signingDate, new Date("2026-02-20T00:00:00"));

  // Cọc chỉ áp dụng cho Đợt 1, đồng bộ với dạng xem block (PaymentTimelinePreview).
  // Số tiền của Đợt 1 = tiền cọc phải thu (c94) — phần này được TRỪ RA khỏi tổng giá trị
  // trước khi chia cho 17 đợt còn lại, để tiền cọc không bị tính lặp/trải dài qua các đợt sau.
  const depositPct = Math.round((depositRequired / totalValue) * 100);
  const depositStatus: PaymentRowStatus = depositCollected <= 0 ? "pending" : depositCollected >= depositRequired ? "paid" : "partial";
  const remainingValue = Math.max(totalValue - depositRequired, 0);
  const remainingWeightTotal = 15 * 5 + 2 * 2.5; // đợt 2-16 = 5, đợt 17-18 = 2.5

  const rows = Array.from({ length: 18 }, (_, index) => {
    if (index === 0) {
      return {
        seq: 1,
        label: "Đợt 1 - Cọc HĐMB",
        depositDate: depositPaidDate,
        pct: depositPct,
        amount: depositRequired,
        dueDate: signingDate,
        status: depositStatus,
      };
    }
    const weight = index >= 16 ? 2.5 : 5;
    const amount = Math.round((remainingValue * weight) / remainingWeightTotal);
    const pct = totalValue > 0 ? Math.round((amount / totalValue) * 1000) / 10 : 0;
    const dueDate = new Date(baseDate);
    dueDate.setMonth(baseDate.getMonth() + index * 3);
    const status: PaymentRowStatus = index <= 3 ? "paid" : index === 4 ? "overdue" : index === 5 ? "upcoming" : "pending";
    const label = index === 16 ? "Đợt 17 - Bàn giao nhà" : index === 17 ? "Đợt 18 - Cấp sổ hồng" : `Đợt ${index + 1}`;
    return { seq: index + 1, label, depositDate: "—", pct, amount, dueDate: dueDate.toLocaleDateString("vi-VN"), status };
  });
  const statusMeta = {
    paid: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700" },
    partial: { label: "Đã thu một phần", className: "bg-amber-50 text-amber-700" },
    overdue: { label: "Quá hạn", className: "bg-red-50 text-red-700" },
    upcoming: { label: "Sắp tới hạn", className: "bg-blue-50 text-blue-700" },
    pending: { label: "Chưa tới hạn", className: "bg-slate-100 text-slate-600" },
  } as const;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Tiến độ thanh toán - theo tiến độ chuẩn</h3>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => navigate("/debt/customer/5/contract/c5-1")}>Xem thanh toán</Button>
      </div>
      <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 md:grid-cols-4">
        <div>
          <p className="text-[11px] text-slate-400">Tiền cọc phải thu</p>
          <p className="mt-0.5 text-xs text-slate-800" style={{ fontWeight: 650 }}>{depositRequired.toLocaleString("vi-VN")} VNĐ</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Tiền cọc đã thu</p>
          <p className="mt-0.5 text-xs text-slate-800" style={{ fontWeight: 650 }}>{depositCollected.toLocaleString("vi-VN")} VNĐ</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Nội dung PTTT</p>
          <p className="mt-0.5 text-xs text-slate-800" style={{ fontWeight: 650 }}>{pttmContent}</p>
        </div>
        <div>
          <p className="text-[11px] text-slate-400">Tỷ lệ PTTT</p>
          <p className="mt-0.5 text-xs text-slate-800" style={{ fontWeight: 650 }}>{pttmRatio}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-xs">
          <thead className="bg-[#F6F8FB] text-slate-600">
            <tr>
              <th className="w-16 border-b border-r border-[#DDE5F0] px-3 py-2 text-center text-[11px]" style={{ fontWeight: 650 }}>STT</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-left text-[11px]" style={{ fontWeight: 650 }}>Tiến độ thanh toán</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-left text-[11px]" style={{ fontWeight: 650 }}>Ngày cọc</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-center text-[11px]" style={{ fontWeight: 650 }}>%TT</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-right text-[11px]" style={{ fontWeight: 650 }}>Số tiền</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-left text-[11px]" style={{ fontWeight: 650 }}>Ngày dự kiến TT</th>
              <th className="border-b border-r border-[#DDE5F0] px-3 py-2 text-left text-[11px]" style={{ fontWeight: 650 }}>Trạng thái TT</th>
              <th className="border-b border-[#DDE5F0] px-3 py-2 text-center text-[11px]" style={{ fontWeight: 650 }}>Nhắc hẹn</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = statusMeta[row.status];
              return (
                <tr key={row.seq} id={`payment-row-${row.seq}`} className="hover:bg-[#F8FAFC] transition-colors duration-500">
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-center text-xs text-slate-500">{row.seq}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-xs text-slate-800" style={{ fontWeight: 600 }}>{row.label}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-xs text-slate-600">{row.depositDate}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-center text-xs text-slate-700">{row.pct}%</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-right text-xs tabular-nums text-slate-900" style={{ fontWeight: 600 }}>{row.amount.toLocaleString("vi-VN")} VNĐ</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-xs text-slate-600">{row.dueDate}</td>
                  <td className="border-b border-r border-[#E5EAF3] px-3 py-2">
                    <span className={`inline-flex rounded px-2 py-1 text-[11px] ${meta.className}`} style={{ fontWeight: 650 }}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="border-b border-[#E5EAF3] px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 text-[11px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddPaymentReminder(row);
                      }}
                    >
                      <Bell className="h-3.5 w-3.5" />
                      Nhắc khách
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#F8FAFC] text-slate-900">
            <tr>
              <td className="border-r border-[#DDE5F0] px-3 py-2 text-center text-xs" style={{ fontWeight: 700 }}>Tổng</td>
              <td className="border-r border-[#DDE5F0] px-3 py-2 text-xs" style={{ fontWeight: 650 }}>18 đợt</td>
              <td className="border-r border-[#DDE5F0]" />
              <td className="border-r border-[#DDE5F0] px-3 py-2 text-center text-xs" style={{ fontWeight: 650 }}>100%</td>
              <td className="border-r border-[#DDE5F0] px-3 py-2 text-right text-xs tabular-nums" style={{ fontWeight: 650 }}>{totalValue.toLocaleString("vi-VN")} VNĐ</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function PaymentTimelinePreview({ record }: { record: HdmbRecord }) {
  const navigate = useNavigate();
  const deposit = record.values.c94 || "200.000.000 VNĐ";
  const paid = record.values.c95 || "200.000.000 VNĐ";
  const signingDate = record.values.c106 || "13/07/2025";
  const method = record.values.c104 || "Thanh toán chuẩn";

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-xs text-slate-800" style={{ fontWeight: 650 }}>Tiến độ thanh toán - theo tiến độ chuẩn</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Tóm tắt từ các trường cọc, PTTT và ngày ký HĐMB</p>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => navigate("/debt/customer/5/contract/c5-1")}>Xem thanh toán</Button>
      </div>
      <div className="space-y-3 p-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-emerald-800" style={{ fontWeight: 650 }}>Đợt cọc · {paid}</p>
              <p className="mt-0.5 text-[11px] text-emerald-700">Ngày thanh toán: {record.values.c96 || signingDate}</p>
            </div>
            <span className="text-xs text-emerald-700" style={{ fontWeight: 650 }}>Đã thanh toán</span>
          </div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-blue-800" style={{ fontWeight: 650 }}>{method}</p>
              <p className="mt-0.5 text-[11px] text-blue-700">Tỷ lệ PTTT: {record.values.c105 || "—"}</p>
            </div>
            <span className="text-xs text-blue-700" style={{ fontWeight: 650 }}>Sắp đến hạn</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-800" style={{ fontWeight: 650 }}>Tiền cọc phải thu · {deposit}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Ngày ký HĐMB theo quy định: {signingDate}</p>
            </div>
            <span className="text-xs text-slate-500">Chờ xử lý</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AttachmentPreview({ record }: { record: HdmbRecord }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localDocs, setLocalDocs] = useState<{ id: string; label: string; value: string; url?: string; fileName?: string }[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; desc: string; url?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with record changes
  useEffect(() => {
    setLocalDocs([
      { id: "c157", label: "Số thỏa thuận cọc", value: record.values.c157 },
      { id: "c158", label: "Số phiếu thông tin sản phẩm", value: record.values.c158 },
      { id: "c159", label: "Số phiếu XNCK", value: record.values.c159 },
    ].filter((doc) => doc.value));
  }, [record.id, record.values.c157, record.values.c158, record.values.c159]);

  const handleDelete = (id: string, name: string) => {
    setLocalDocs((prev) => prev.filter((doc) => doc.id !== id));
    alert(`Đã xóa tài liệu "${name}" thành công! (Dữ liệu sẽ tự động khôi phục về ban đầu khi tải lại trang)`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const localUrl = URL.createObjectURL(file);
    const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    const newDoc = {
      id: "uploaded-" + Date.now(),
      label: `Tài liệu vừa tải lên (${(file.size / 1024).toFixed(1)} KB)`,
      value: cleanName.toUpperCase(),
      url: localUrl,
      fileName: file.name
    };

    setLocalDocs((prev) => [...prev, newDoc]);
    alert(`Tải lên tài liệu "${file.name}" thành công!`);
    e.target.value = "";
  };

  const handleDownload = (doc: typeof localDocs[0]) => {
    // Show preview dialog
    setPreviewDoc({
      name: doc.value,
      desc: doc.label,
      url: doc.url
    });

    // Trigger download
    if (doc.url) {
      const link = document.createElement("a");
      link.href = doc.url;
      link.download = doc.fileName || `${doc.value}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a mock download for default documents
      const mockContent = `%PDF-1.4\n%...\n1 0 obj\n<< /Title (${doc.value}) /Author (Appminis) >>\nendobj\n...`;
      const blob = new Blob([mockContent], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${doc.value}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300">
      <div 
        className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100/70 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div>
          <h3 className="text-xs text-slate-800" style={{ fontWeight: 650 }}>Tài liệu đính kèm</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Chứng từ lấy từ các trường cuối sheet</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : ""}`} />
      </div>

      <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "max-h-0 h-0 p-0 opacity-0" : "p-4 opacity-100"}`}>
        <div className="space-y-2">
          {localDocs.length > 0 ? localDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:bg-slate-100/50 cursor-pointer transition-colors"
              onClick={() => handleDownload(doc)}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-slate-800" style={{ fontWeight: 600 }}>{doc.value}</p>
                <p className="text-[11px] text-slate-400">{doc.label}</p>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => handleDownload(doc)}
                >
                  Tải về
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(doc.id, doc.value)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          )) : (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400">Chưa có chứng từ kèm theo</p>
          )}

          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-xs text-slate-700 hover:bg-slate-50"
              onClick={handleUploadClick}
            >
              <Upload className="h-3.5 w-3.5" />
              Tải tài liệu mới lên
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="application/pdf" 
              style={{ display: "none" }} 
              onChange={handleFileChange} 
            />
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl p-6 bg-white rounded-lg">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h4 className="text-sm font-semibold text-slate-900">{previewDoc.name} - Xem trước PDF</h4>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 flex justify-center items-center min-h-[450px]">
              {previewDoc.url ? (
                <iframe 
                  src={previewDoc.url} 
                  className="w-full h-[500px] border-none rounded-lg bg-white" 
                />
              ) : (
                <div className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-slate-200 w-full max-w-md relative overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] text-slate-100 text-3xl font-extrabold select-none pointer-events-none tracking-widest opacity-70">
                    APPMINIS SYSTEM
                  </div>
                  <div className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>HỆ THỐNG QUẢN LÝ HỢP ĐỒNG</span>
                    <span>TÀI LIỆU PDF CHỨNG TỪ</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">{previewDoc.name}</h3>
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-dashed border-slate-200 mb-4">
                    <strong>Tên tài liệu:</strong> {previewDoc.desc}
                  </div>
                  <div className="space-y-2 mb-8">
                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-100 rounded w-2/3"></div>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-[9px] text-slate-400">
                    <span>Đã xác thực điện tử</span>
                    <span>Trang 1/1</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

export function getCustomerIdForRecord(record: HdmbRecord): string {
  const code = record.values.c2;
  const name = record.values.c3 || record.values.c30;
  const phone = record.values.c12 || record.values.c27;
  
  let found = customers.find((c) => c.id === code || c.id === `C${code?.replace(/\D/g, "")}`);
  if (found) return found.id;
  
  if (phone) {
    found = customers.find((c) => c.phone.replace(/\s/g, "") === phone.replace(/\s/g, ""));
    if (found) return found.id;
  }
  
  if (name) {
    found = customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (found) return found.id;
  }
  
  return customers[0]?.id || "C001";
}

function DetailDrawer({
  record,
  checkResult,
  transferLogs = [],
  onClose,
  onSaveCheck,
  onSaveTransfer,
  onUpdateStatus,
  onEdit,
}: {
  record: HdmbRecord | null;
  checkResult?: CheckResult;
  transferLogs?: TransferLog[];
  onClose: () => void;
  onSaveCheck: (recordId: string, result: CheckResult) => void;
  onSaveTransfer: (recordId: string, overrides: Record<string, string>, log: TransferLog) => void;
  onUpdateStatus: (recordId: string, nextStatus: ContractStatus) => void;
  onEdit: (recordId: string) => void;
}) {
  const [searchParams] = useSearchParams();
  const [detailView, setDetailView] = useState<"block" | "table">("block");
  
  useEffect(() => {
    const openPayment = searchParams.get("openPayment");
    if (openPayment) {
      setDetailView("table");
    }
  }, [searchParams]);

  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [statusInfoDialogOpen, setStatusInfoDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ContractStatus | null>(null);
  const [draftStatus, setDraftStatus] = useState<CheckStatus>(checkResult?.status ?? "failed");
  const [draftReason, setDraftReason] = useState(checkResult?.reason ?? "");
  const [statusInfoDraft, setStatusInfoDraft] = useState({ date: inputDateValue(new Date()), person: "", note: "", fileName: "" });
  const [statusInfoResults, setStatusInfoResults] = useState<Record<string, ContractStatusInfo>>({});
  const [statusInfoCollapsed, setStatusInfoCollapsed] = useState<Record<string, boolean>>({});
  const statusInfoFileInputRef = useRef<HTMLInputElement>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [paymentReminderInfo, setPaymentReminderInfo] = useState<any | null>(null);
  const [paymentReminderOpen, setPaymentReminderOpen] = useState(false);

  if (!record) return null;

  const ownerName = record.values.c3 || record.values.c30 || "Chưa có tên khách hàng";
  const unitCode = record.values.c54 || record.values.c51 || "Chưa có mã căn";
  const signingDate = record.values.c106 || "Chưa có ngày ký";
  const seller = record.values.c154 || "Chưa phân công";
  const price = record.values.c93 || record.values.c87 || "—";
  const paid = record.values.c95 || "—";
  const statusInfo = statusInfoResults[record.id];

  const dummyContract = {
    id: record.id,
    customer: record.values.c3 || record.values.c30 || "—",
    date: record.values.c106 || "—",
    property: record.values.c51 || "—",
    status: record.status || "Đã cọc",
    value: record.values.c93 || record.values.c87 || "—",
    paid: 0,
    total: 0,
    pct: 0,
    salesperson: record.values.c154 || "—",
    type: record.values.c108 || "—",
    address: record.values.c11 || "—",
    phone: record.values.c12 || "—",
    email: record.values.c13 || "—",
    payments: [],
    docs: [],
    rawValues: record.values,
    owner: {
      name: record.values.c3,
      cccd: record.values.c4,
      cccdDate: record.values.c6,
      cccdPlace: record.values.c7,
      dob: record.values.c8,
      phone: record.values.c12,
      email: record.values.c13,
      permanentAddress: record.values.c10,
    },
    coOwners: record.values.c19 && record.values.c19 !== "—" ? [
      {
        name: record.values.c19,
        cccd: record.values.c20,
        cccdDate: record.values.c21,
        cccdPlace: record.values.c22,
        dob: record.values.c23,
        permanentAddress: record.values.c25,
        phone: record.values.c27,
        email: record.values.c28,
      }
    ] : []
  } as unknown as Contract;

  const sections = buildTransferContractDetailSections(dummyContract);

  const openCheckDialog = () => {
    setDraftStatus(checkResult?.status ?? "failed");
    setDraftReason(checkResult?.reason ?? "");
    setCheckDialogOpen(true);
  };

  const saveCheckResult = () => {
    const now = new Date();
    onSaveCheck(record.id, {
      status: draftStatus,
      reason: draftReason.trim() || (draftStatus === "passed" ? "Thông tin khớp hồ sơ HĐMB" : "Cần bổ sung ghi chú kiểm tra"),
      checkedBy: "Nguyễn Thảo Vy",
      checkedAt: now.toLocaleDateString("vi-VN"),
    });
    setCheckDialogOpen(false);
  };

  const saveTransfer = (overrides: Record<string, string>, log: TransferLog) => {
    onSaveTransfer(record.id, overrides, log);
    setTransferDialogOpen(false);
  };

  const openStatusInfoDialog = (status: ContractStatus) => {
    setPendingStatus(status);
    const existing = statusInfoResults[record.id];
    const existingHandover = existing?.handover;
    const existingReturned = existing?.returned;
    setStatusInfoDraft({
      date: status === "Bàn giao" ? existingHandover?.handoverDate || inputDateValue(new Date()) : existingReturned?.returnedDate || inputDateValue(new Date()),
      person: status === "Bàn giao" ? existingHandover?.handoverBy || seller : existingReturned?.receivedBy || "",
      note: status === "Bàn giao" ? existingHandover?.handoverNote || "" : existingReturned?.returnedNote || "",
      fileName: status === "Bàn giao" ? existingHandover?.handoverFileName || "" : existingReturned?.returnedFileName || "",
    });
    setStatusInfoDialogOpen(true);
  };

  const handleStatusSelect = (status: ContractStatus) => {
    if (!canJumpToStatus(record.status || "Đã cọc", status)) return;
    if (status === "Bàn giao" || status === "Đã trả") {
      openStatusInfoDialog(status);
      return;
    }
    onUpdateStatus(record.id, status);
  };

  const handleStatusInfoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatusInfoDraft((prev) => ({ ...prev, fileName: file.name }));
    event.target.value = "";
  };

  const saveStatusInfo = () => {
    if (!pendingStatus) return;
    const isHandover = pendingStatus === "Bàn giao";
    setStatusInfoResults((prev) => ({
      ...prev,
      [record.id]: isHandover
        ? {
            ...(prev[record.id] ?? {}),
            handover: {
              handoverDate: statusInfoDraft.date,
              handoverBy: statusInfoDraft.person.trim() || seller,
              receivedBy: ownerName,
              handoverNote: statusInfoDraft.note.trim() || "—",
              handoverFileName: statusInfoDraft.fileName || "—",
            },
          }
        : {
            ...(prev[record.id] ?? {}),
            returned: {
              returnedDate: statusInfoDraft.date,
              returnedBy: ownerName,
              receivedBy: statusInfoDraft.person.trim() || "Chưa cập nhật",
              returnedNote: statusInfoDraft.note.trim() || "—",
              returnedFileName: statusInfoDraft.fileName || "—",
            },
          },
    }));
    onUpdateStatus(record.id, pendingStatus);
    setStatusInfoDialogOpen(false);
    setPendingStatus(null);
  };

  const downloadStatusInfoFile = (fileName: string) => {
    if (!fileName || fileName === "—") return;
    const mockContent = `%PDF-1.4\n%...\n1 0 obj\n<< /Title (${fileName}) /Author (Appminis) >>\nendobj\n...`;
    const url = URL.createObjectURL(new Blob([mockContent], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderStatusInfoFileLink = (fileName: string) => {
    if (!fileName || fileName === "—") {
      return <span className="text-sm text-slate-900" style={{ fontWeight: 500 }}>—</span>;
    }
    return (
      <button
        type="button"
        className="truncate text-sm text-blue-600 hover:text-blue-700 hover:underline"
        style={{ fontWeight: 500 }}
        onClick={() => downloadStatusInfoFile(fileName)}
      >
        {fileName}
      </button>
    );
  };

  const renderStatusInfoTable = () => {
    if (!statusInfo?.handover && !statusInfo?.returned) return null;

    const tableSections = [
      ...(statusInfo.handover ? [{
        key: "handover",
        marker: "BG",
        title: "THÔNG TIN BÀN GIAO",
        fileLabel: "Tài liệu bàn giao PDF",
        rows: [
          ["Ngày giao", statusInfo.handover.handoverDate ? new Date(`${statusInfo.handover.handoverDate}T00:00:00`).toLocaleDateString("vi-VN") : "—"],
          ["Người giao", statusInfo.handover.handoverBy],
          ["Người nhận", statusInfo.handover.receivedBy],
          ["Ghi chú", statusInfo.handover.handoverNote],
          ["Tài liệu bàn giao PDF", statusInfo.handover.handoverFileName],
        ],
      }] : []),
      ...(statusInfo.returned ? [{
        key: "returned",
        marker: "TH",
        title: "THÔNG TIN TRẢ HỢP ĐỒNG",
        fileLabel: "Tài liệu trả hợp đồng PDF",
        rows: [
          ["Ngày trả", statusInfo.returned.returnedDate ? new Date(`${statusInfo.returned.returnedDate}T00:00:00`).toLocaleDateString("vi-VN") : "—"],
          ["Người trả", statusInfo.returned.returnedBy],
          ["Người nhận", statusInfo.returned.receivedBy],
          ["Ghi chú", statusInfo.returned.returnedNote],
          ["Tài liệu trả hợp đồng PDF", statusInfo.returned.returnedFileName],
        ],
      }] : []),
    ];

    return (
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <tbody>
              {tableSections.flatMap((section) => {
                const isCollapsed = statusInfoCollapsed[section.key];
                return [
                  <tr key={`${section.key}-header`} className="bg-[#F6F8FB]">
                    <td className="w-16 border-b border-r border-[#DDE5F0] px-3 py-2 text-center text-[11px] text-slate-600" style={{ fontWeight: 650 }}>{section.marker}</td>
                    <td className="border-b border-[#DDE5F0] p-0 text-[11px] text-slate-700" style={{ fontWeight: 650 }}>
                      <button
                        type="button"
                        aria-expanded={!isCollapsed}
                        onClick={() => setStatusInfoCollapsed((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] leading-4 text-slate-700 transition-colors hover:bg-[#EEF3F8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-300"
                      >
                        <span className="text-[11px] leading-4">{section.title}</span>
                        <span className="text-lg leading-none text-slate-400">{isCollapsed ? "+" : "−"}</span>
                      </button>
                    </td>
                    <td className="w-40 border-b border-[#DDE5F0] px-3 py-2 text-right text-[11px] text-slate-500">{section.fileLabel}</td>
                  </tr>,
                  ...(isCollapsed ? [] : section.rows.map(([label, value], index) => (
                    <tr key={`${section.key}-${label}`} className="hover:bg-[#F8FAFC]">
                      <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-center text-xs text-slate-400">{index + 1}</td>
                      <td className="border-b border-r border-[#E5EAF3] px-3 py-2 text-xs text-slate-600">{label}</td>
                      <td className="border-b border-[#E5EAF3] px-3 py-2 text-right text-xs text-slate-900" style={{ fontWeight: 600 }}>
                        {label.includes("PDF") ? renderStatusInfoFileLink(value) : value}
                      </td>
                    </tr>
                  ))),
                ];
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  const exportExcel = () => {
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [["Nhóm thông tin", "Trường thông tin", "Giá trị"], ...contractDetailFields.map((field) => [getContractDetailSection(field), field.label, record.values[field.key] || ""])];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `chi-tiet-hop-dong-${record.values.c157 || record.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex h-full flex-col bg-slate-50">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
          <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Chi tiết hợp đồng</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-900" style={{ fontWeight: 500 }}>Mã hợp đồng:</span>
                <span className="text-sm text-blue-600" style={{ fontWeight: 500 }}>{record.values.c157 || unitCode}</span>
                <span className={contractCheckBadgeClass(checkResult?.status)} style={{ fontWeight: 650 }}>{checkResult ? checkStatusLabel[checkResult.status] : "Đang kiểm tra"}</span>
                <span className={contractStatusBadgeClass(record.status)}>
                  {record.status || "Đã cọc"}
                </span>
                {transferLogs.length > 0 && <TransferBadge sequence={transferLogs.length} />}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Ngày tạo: {signingDate} · Mã căn hộ: {unitCode} · Khách hàng chính: {ownerName} · Nhân viên: {seller}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 text-amber-700" onClick={() => setReminderOpen(true)} aria-label="Tạo nhắc hẹn cho hợp đồng" title="Nhắc hẹn"><Bell className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-9 w-9 text-emerald-700" onClick={exportExcel} aria-label="Xuất Excel" title="Xuất Excel"><FileSpreadsheet className="h-4 w-4" /></Button>
              <div className="flex items-center border border-slate-200 bg-slate-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDetailView("block")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    detailView === "block"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Xem dạng block"
                  title="Xem dạng block"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDetailView("table")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    detailView === "table"
                      ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label="Xem dạng table"
                  title="Xem dạng table"
                >
                  <Table2 className="h-4 w-4" />
                </button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className={`${contractDetailCtaClass} gap-2 bg-blue-600 hover:bg-blue-700`}>
                    <CheckCircle2 className="h-4 w-4" />
                    Cập nhật trạng thái <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-72 overflow-y-auto bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                  {CONTRACT_STATUS_FLOW.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                      onClick={() => handleStatusSelect(status)}
                    >
                      <span>{status}</span>
                      {(record.status || "Đã cọc") === status && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={`${contractDetailCtaClass} gap-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50`}>
                    <Settings className="h-4 w-4" />
                    Thao tác <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Thao tác</div>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                    onClick={() => onEdit(record.id)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-400" />
                    Chỉnh sửa hợp đồng
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                    onClick={openCheckDialog}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                    Xác nhận kiểm tra
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                    Chuyển nhượng HĐ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mx-auto max-w-6xl space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  <span>Tiến độ tổng thể</span>
                </div>
                <span className="text-slate-500"><strong className="text-slate-900">40%</strong> · {paid} / {price}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-50">
                <div className="h-full w-2/5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Bắt đầu: {record.values.c96 || "03/2022"}</span>
                <span>Dự kiến hoàn thành: {record.values.c107 || signingDate}</span>
              </div>
            </section>

            {checkResult && (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-xs text-slate-900" style={{ fontWeight: 500 }}>Thông tin kiểm tra dữ liệu</h3>
                  <span className="text-lg leading-none text-slate-400">−</span>
                </div>
                <div className="grid grid-cols-1 gap-x-12 gap-y-5 px-4 py-5 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">Người kiểm tra</p>
                    <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{checkResult.checkedBy}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Ngày kiểm tra</p>
                    <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{checkResult.checkedAt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Trạng thái kiểm tra</p>
                    <p className={`mt-2 text-sm ${checkResult.status === "passed" ? "text-emerald-700" : "text-red-700"}`} style={{ fontWeight: 500 }}>{checkStatusLabel[checkResult.status]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lý do</p>
                    <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{checkResult.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Mã KH</p>
                    <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{record.values.c2 || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Loại KH - Nhóm KH</p>
                    <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{record.values.c108 || "—"}</p>
                  </div>
                </div>
              </section>
            )}

            {detailView === "table" && renderStatusInfoTable()}

            {detailView !== "table" && statusInfo?.handover && (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100/70"
                  aria-expanded={!statusInfoCollapsed.handover}
                  onClick={() => setStatusInfoCollapsed((prev) => ({ ...prev, handover: !prev.handover }))}
                >
                  <h3 className="text-xs text-slate-900" style={{ fontWeight: 500 }}>Thông tin bàn giao</h3>
                  <span className="text-lg leading-none text-slate-400">{statusInfoCollapsed.handover ? "+" : "−"}</span>
                </button>
                {!statusInfoCollapsed.handover && (
                  <div className="grid grid-cols-1 gap-x-12 gap-y-5 px-4 py-5 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Ngày giao</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.handover.handoverDate ? new Date(`${statusInfo.handover.handoverDate}T00:00:00`).toLocaleDateString("vi-VN") : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Người giao</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.handover.handoverBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Người nhận</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.handover.receivedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Ghi chú</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.handover.handoverNote}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Tài liệu bàn giao PDF</p>
                      <div className="mt-2">{renderStatusInfoFileLink(statusInfo.handover.handoverFileName)}</div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {detailView !== "table" && statusInfo?.returned && (
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  className="flex w-full items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100/70"
                  aria-expanded={!statusInfoCollapsed.returned}
                  onClick={() => setStatusInfoCollapsed((prev) => ({ ...prev, returned: !prev.returned }))}
                >
                  <h3 className="text-xs text-slate-900" style={{ fontWeight: 500 }}>Thông tin trả hợp đồng</h3>
                  <span className="text-lg leading-none text-slate-400">{statusInfoCollapsed.returned ? "+" : "−"}</span>
                </button>
                {!statusInfoCollapsed.returned && (
                  <div className="grid grid-cols-1 gap-x-12 gap-y-5 px-4 py-5 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-400">Ngày trả</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.returned.returnedDate ? new Date(`${statusInfo.returned.returnedDate}T00:00:00`).toLocaleDateString("vi-VN") : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Người trả</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.returned.returnedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Người nhận</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.returned.receivedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Ghi chú</p>
                      <p className="mt-2 text-sm text-slate-900" style={{ fontWeight: 500 }}>{statusInfo.returned.returnedNote}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Tài liệu trả hợp đồng PDF</p>
                      <div className="mt-2">{renderStatusInfoFileLink(statusInfo.returned.returnedFileName)}</div>
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{detailView === "block" ? "Xem dạng block" : "Xem dạng table"}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {contractDetailFields.length} trường từ sheet IMPORT DL KÝ HDMB
              </div>
            </div>

            {detailView === "block" ? <>
              {transferLogs.length > 0 && <TransferHistoryBlock logs={transferLogs} />}
              <TransferContractBlockView sections={sections} />
              <PaymentTimelinePreview record={record} />
              <AttachmentPreview record={record} />
            </> : <>
              {transferLogs.length > 0 && <TransferHistoryTable logs={transferLogs} />}
              <TransferContractTableView sections={sections} contract={dummyContract} />
              <PaymentProgressTable
                record={record}
                onAddPaymentReminder={(row) => {
                  setPaymentReminderInfo({
                    customerName: ownerName,
                    contractCode: record.values.c51 || record.values.c54 || record.id,
                    paymentLabel: row.label,
                    dueDate: row.dueDate,
                    amount: row.amount.toLocaleString("vi-VN"),
                    seq: row.seq,
                  });
                  setPaymentReminderOpen(true);
                }}
              />
            </>}
          </div>
        </main>

        <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-3">
          <div className="mx-auto flex max-w-6xl justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClose}>Đóng</Button>
            <Button variant="outline" size="icon" className="h-9 w-9 text-amber-700" onClick={() => setReminderOpen(true)} aria-label="Tạo nhắc hẹn cho hợp đồng" title="Nhắc hẹn"><Bell className="h-4 w-4" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className={`${contractDetailCtaClass} gap-2 bg-blue-600 hover:bg-blue-700`}>
                  <CheckCircle2 className="h-4 w-4" />
                  Cập nhật trạng thái <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56 max-h-72 overflow-y-auto bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                {CONTRACT_STATUS_FLOW.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                    onClick={() => handleStatusSelect(status)}
                  >
                    <span>{status}</span>
                    {(record.status || "Đã cọc") === status && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={`${contractDetailCtaClass} gap-2 border-slate-200 bg-white text-slate-900 hover:bg-slate-50`}>
                  <Settings className="h-4 w-4" />
                  Thao tác <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-52 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Thao tác</div>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                  onClick={() => onEdit(record.id)}
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                  Chỉnh sửa hợp đồng
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                  onClick={openCheckDialog}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                  Xác nhận kiểm tra
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                  onClick={() => setTransferDialogOpen(true)}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                  Chuyển nhượng HĐ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </footer>
      </div>

      {transferDialogOpen && (
        <TransferDialog
          record={record}
          logs={transferLogs}
          onClose={() => setTransferDialogOpen(false)}
          onSave={saveTransfer}
        />
      )}

      {checkDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>Kiểm tra thông tin</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCheckDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6 px-5 py-5">
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <p className="text-sm text-slate-700">Trạng thái</p>
                <div className="flex items-center gap-5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="check-status"
                      checked={draftStatus === "passed"}
                      onChange={() => setDraftStatus("passed")}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Đạt
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="check-status"
                      checked={draftStatus === "failed"}
                      onChange={() => setDraftStatus("failed")}
                      className="h-4 w-4 accent-blue-600"
                    />
                    Không đạt
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-4">
                <p className="pt-2 text-sm text-slate-700">Lý do</p>
                <textarea
                  value={draftReason}
                  onChange={(event) => setDraftReason(event.target.value)}
                  placeholder="Nhập lý do"
                  className="min-h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <Button className="h-10 w-full bg-slate-950 text-sm hover:bg-slate-800" onClick={saveCheckResult}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {statusInfoDialogOpen && pendingStatus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm text-slate-900" style={{ fontWeight: 650 }}>
                {pendingStatus === "Bàn giao" ? "Thông tin bàn giao hợp đồng" : "Thông tin trả hợp đồng"}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStatusInfoDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-6 px-5 py-5">
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <p className="text-sm text-slate-700">{pendingStatus === "Bàn giao" ? "Ngày giao" : "Ngày trả"}</p>
                <input
                  type="date"
                  value={statusInfoDraft.date}
                  onChange={(event) => setStatusInfoDraft((prev) => ({ ...prev, date: event.target.value }))}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <p className="text-sm text-slate-700">{pendingStatus === "Bàn giao" ? "Người giao" : "Người nhận"}</p>
                <input
                  value={statusInfoDraft.person}
                  onChange={(event) => setStatusInfoDraft((prev) => ({ ...prev, person: event.target.value }))}
                  placeholder={pendingStatus === "Bàn giao" ? "Nhập người giao" : "Nhập người nhận"}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-4">
                <p className="pt-2 text-sm text-slate-700">Ghi chú</p>
                <textarea
                  value={statusInfoDraft.note}
                  onChange={(event) => setStatusInfoDraft((prev) => ({ ...prev, note: event.target.value }))}
                  placeholder="Nhập ghi chú"
                  className="min-h-28 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <p className="text-sm text-slate-700">Upload tài liệu PDF</p>
                <div className="flex min-w-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs"
                    onClick={() => statusInfoFileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Chọn PDF
                  </Button>
                  <span className="truncate text-xs text-slate-500">{statusInfoDraft.fileName || "Chưa chọn tài liệu"}</span>
                  <input
                    ref={statusInfoFileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleStatusInfoFileChange}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-4">
              <Button className="h-10 w-full bg-slate-950 text-sm hover:bg-slate-800" onClick={saveStatusInfo}>
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      <ContractReminderDialog
        open={reminderOpen}
        onOpenChange={setReminderOpen}
        customerId={getCustomerIdForRecord(record)}
        contractId={record.id}
        contractStatus={record.status || "Đã cọc"}
      />

      {paymentReminderInfo && (
        <PaymentReminderDialog
          open={paymentReminderOpen}
          onOpenChange={setPaymentReminderOpen}
          customerId={getCustomerIdForRecord(record)}
          contractId={record.id}
          paymentId={`${record.id}-p-${paymentReminderInfo.seq}`}
          customerName={paymentReminderInfo.customerName}
          contractLabel={paymentReminderInfo.contractCode}
          installmentLabel={paymentReminderInfo.paymentLabel}
          amountLabel={`${paymentReminderInfo.amount} VNĐ`}
          dueDateLabel={paymentReminderInfo.dueDate}
        />
      )}
    </div>
  );
}


export function ContractScoreCard({
  icon: Icon,
  label,
  value,
  helper,
  iconClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  iconClass: string;
}) {
  return (
    <CoreMetricCard icon={Icon} label={label} value={value} sub={helper} iconClass={iconClass} />
  );
}

type ContractChartDatum = {
  name: string;
  count: number;
  revenue: number;
  color: string;
};

function useContractTrendControl(defaultGroup: ContractTrendGroup = "month") {
  const range = useMemo(() => defaultContractTrendRange(), []);
  const [group, setGroup] = useState<ContractTrendGroup>(defaultGroup);
  const [from, setFrom] = useState(range.from);
  const [to, setTo] = useState(range.to);
  const factor = useMemo(() => contractTrendFactor(group, from, to), [from, group, to]);

  return { group, setGroup, from, setFrom, to, setTo, factor };
}

function ContractChartTimeControl({
  chartName,
  group,
  from,
  to,
  onGroupChange,
  onFromChange,
  onToChange,
}: {
  chartName: string;
  group: ContractTrendGroup;
  from: string;
  to: string;
  onGroupChange: (value: ContractTrendGroup) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <>
      <Select value={group} onValueChange={(val) => onGroupChange(val as ContractTrendGroup)}>
        <SelectTrigger aria-label={`Thời gian - ${chartName}`} className={cn(contractChartSelectClass, "w-[120px] min-w-0")}>
          <SelectValue placeholder="Thời gian" />
        </SelectTrigger>
        <SelectContent>
          {contractTrendGroupOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {group === "custom" && (
        <>
          <input
            aria-label={`Ngày bắt đầu - ${chartName}`}
            className={cn(contractDateInputClass, "w-[110px]")}
            type="date"
            value={from}
            max={to}
            onChange={(event) => onFromChange(event.target.value)}
          />
          <input
            aria-label={`Ngày kết thúc - ${chartName}`}
            className={cn(contractDateInputClass, "w-[110px]")}
            type="date"
            value={to}
            min={from}
            onChange={(event) => onToChange(event.target.value)}
          />
        </>
      )}
    </>
  );
}

function ContractChartCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="min-w-0 gap-0 rounded-lg border border-[#E5EAF3] bg-white shadow-sm shadow-slate-200/40">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="min-w-0 text-sm leading-5 text-slate-950" style={{ fontWeight: 700 }}>{title}</h2>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ContractTowerStatusCard({ data }: { data: ContractChartDatum[] }) {
  const trend = useContractTrendControl();
  const timedData = useMemo(() => data.map((item) => ({
    ...item,
    count: Math.max(0, Math.round(item.count * trend.factor)),
    revenue: Math.round(item.revenue * trend.factor),
  })), [data, trend.factor]);
  const total = timedData.reduce((sum, item) => sum + item.count, 0);

  return (
    <ContractChartCard
      title="Tình trạng HĐ theo block/tháp"
      action={<ContractChartTimeControl chartName="Tình trạng HĐ theo block/tháp" group={trend.group} from={trend.from} to={trend.to} onGroupChange={trend.setGroup} onFromChange={trend.setFrom} onToChange={trend.setTo} />}
    >
      <div className="mt-4 grid grid-cols-[190px_minmax(0,1fr)] items-center gap-4">
        <div className="relative h-[168px]" aria-label="Biểu đồ donut tình trạng hợp đồng theo block/tháp">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={timedData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                stroke="#ffffff"
                strokeWidth={3}
                isAnimationActive={false}
              >
                {timedData.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl leading-none text-slate-950" style={{ fontWeight: 750 }}>{total}</span>
            <span className="mt-1 text-[11px] leading-none text-slate-500">hợp đồng</span>
          </div>
        </div>

        <div className="space-y-2">
          {timedData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate text-xs text-slate-600">{item.name}</span>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-slate-900" style={{ fontWeight: 650 }}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-100">
        <div className="grid grid-cols-[1fr_72px_72px] bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          <span>Block/Tháp</span>
          <span className="text-right">HĐ</span>
          <span className="text-right">Tỷ trọng</span>
        </div>
        {timedData.map((item) => {
          const percent = total ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.name} className="grid grid-cols-[1fr_72px_72px] border-t border-slate-100 px-3 py-2 text-xs">
              <span className="truncate text-slate-700">{item.name}</span>
              <span className="text-right tabular-nums text-slate-900" style={{ fontWeight: 650 }}>{item.count}</span>
              <span className="text-right tabular-nums text-slate-500">{percent}%</span>
            </div>
          );
        })}
      </div>
    </ContractChartCard>
  );
}

function ContractApartmentTypeCard({ data }: { data: ContractChartDatum[] }) {
  const trend = useContractTrendControl();
  const timedData = useMemo(() => data.map((item) => ({
    ...item,
    count: Math.max(0, Math.round(item.count * trend.factor)),
    revenue: Math.round(item.revenue * trend.factor),
  })), [data, trend.factor]);
  const maxCount = Math.max(...timedData.map((item) => item.count), 1);

  return (
    <ContractChartCard
      title="Số lượng & doanh thu theo loại căn"
      action={<ContractChartTimeControl chartName="Số lượng & doanh thu theo loại căn" group={trend.group} from={trend.from} to={trend.to} onGroupChange={trend.setGroup} onFromChange={trend.setFrom} onToChange={trend.setTo} />}
    >
      <div className="mt-5 space-y-4" aria-label="Biểu đồ thanh ngang số lượng và doanh thu theo loại căn">
        {timedData.map((item) => {
          const width = `${Math.max((item.count / maxCount) * 100, 8)}%`;
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-700" style={{ fontWeight: 650 }}>{item.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.count} hợp đồng</p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-slate-900" style={{ fontWeight: 700 }}>{formatCompactCurrency(item.revenue)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width, backgroundColor: item.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </ContractChartCard>
  );
}

function ContractPipelineFunnelCard({ filteredRecords }: { filteredRecords: HdmbRecord[] }) {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const trend = useContractTrendControl("month");

  const allSteps = useMemo(() => {
    const counts = CONTRACT_STATUS_FLOW.reduce<Record<string, number>>((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    filteredRecords.forEach((record) => {
      const status = record.status || "Đã cọc";
      counts[status] = (counts[status] ?? 0) + 1;
    });

    return CONTRACT_STATUS_FLOW
      .map((status) => ({
        name: status,
        count: Math.max(0, Math.round((counts[status] ?? 0) * trend.factor)),
      }))
      .sort((a, b) => b.count - a.count || CONTRACT_STATUS_FLOW.indexOf(a.name) - CONTRACT_STATUS_FLOW.indexOf(b.name));
  }, [filteredRecords, trend.factor]);

  const timedSteps = useMemo(() => {
    return allSteps.filter((step) => selectedStatus === "all" || step.name === selectedStatus);
  }, [allSteps, selectedStatus]);

  const visibleSteps = timedSteps.filter((step) => step.count > 0);
  const totalContracts = visibleSteps.reduce((sum, step) => sum + step.count, 0);
  const maxCount = Math.max(...visibleSteps.map((step) => step.count), 0);
  
  const bottleneckStep = useMemo(() => {
    const activeAllSteps = allSteps.filter((step) => step.count > 0);
    return activeAllSteps[0]?.name ?? "";
  }, [allSteps]);

  return (
    <Card className="min-h-[292px] gap-0 rounded-lg border border-[#E5EAF3] bg-white shadow-sm shadow-slate-200/40">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm leading-5 text-slate-950" style={{ fontWeight: 700 }}>Phễu xử lý hợp đồng</h2>
            <p className="mt-1 text-xs leading-4 text-slate-500">Theo dõi tiến độ xử lý HĐMB theo từng trạng thái</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger aria-label="Trạng thái - Phễu xử lý hợp đồng" className={cn(contractChartSelectClass, "w-[140px] min-w-0")}>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {CONTRACT_STATUS_FLOW.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ContractChartTimeControl
              chartName="Phễu xử lý hợp đồng"
              group={trend.group}
              from={trend.from}
              to={trend.to}
              onGroupChange={trend.setGroup}
              onFromChange={trend.setFrom}
              onToChange={trend.setTo}
            />
          </div>
        </div>

        <div className="mt-5" aria-label="Biểu đồ thanh ngang phễu xử lý hợp đồng">
          {visibleSteps.length === 0 ? (
            <div className="flex min-h-[172px] items-center justify-center rounded-[10px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
              Không có dữ liệu phù hợp
            </div>
          ) : (
            <div className="space-y-3">
              {visibleSteps.map((step) => {
                const percent = totalContracts > 0 ? Math.round((step.count / totalContracts) * 100) : 0;
                const width = maxCount > 0 ? Math.max((step.count / maxCount) * 100, 6) : 0;
                const isBottleneck = step.name === bottleneckStep;
                const isSelectedStatus = selectedStatus === step.name;

                return (
                  <button
                    key={step.name}
                    type="button"
                    className={`group relative grid w-full grid-cols-[168px_minmax(0,1fr)_104px] items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition hover:border-blue-200 hover:bg-blue-50/40 ${isSelectedStatus ? "border-blue-300 bg-blue-50/60 ring-2 ring-blue-100" : "border-transparent"}`}
                    onClick={() => setSelectedStatus(step.name)}
                    aria-pressed={isSelectedStatus}
                    title={`${step.name}: ${step.count} hợp đồng (${percent}%)`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-xs leading-5 text-slate-700" style={{ fontWeight: 650 }}>{step.name}</span>
                      {isBottleneck && (
                        <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] leading-4 text-blue-700" style={{ fontWeight: 700 }}>
                          Điểm nghẽn
                        </span>
                      )}
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width,background-color] group-hover:bg-blue-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="text-right text-xs tabular-nums text-slate-900" style={{ fontWeight: 700 }}>
                      {step.count} hợp đồng
                    </span>
                    <span className="pointer-events-none absolute left-44 top-[-34px] z-20 hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-700 shadow-lg group-hover:block">
                      <span className="block" style={{ fontWeight: 700 }}>{step.name}</span>
                      <span>{step.count} hợp đồng · {percent}% tổng chart</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {selectedStatus !== "all" && (
            <button
              type="button"
              className="mt-3 text-xs text-slate-500 underline-offset-4 hover:text-blue-700 hover:underline"
              onClick={() => setSelectedStatus("all")}
            >
              Xem tất cả trạng thái
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ContractListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [projectFilter, setProjectFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contractStatusFilter, setContractStatusFilter] = useState("all");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [apartmentFilter, setApartmentFilter] = useState("all");
  const [towerFilter, setTowerFilter] = useState("all");
  const [apartmentTypeFilter, setApartmentTypeFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [salesFilter, setSalesFilter] = useState("all");
  const [salesUnitFilter, setSalesUnitFilter] = useState("all");
  const [showAllColumns, setShowAllColumns] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const [recordOverrides, setRecordOverrides] = useState<Record<string, Record<string, string>>>(() => readLocalState("crm-contract-owner-overrides", {}));
  const [transferLogs, setTransferLogs] = useState<Record<string, TransferLog[]>>(() => readLocalState("crm-contract-transfer-logs", {}));
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ContractStatus>>(() => readLocalState("crm-contract-status-overrides", {}));
  const [importedFileName, setImportedFileName] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createContractOpen, setCreateContractOpen] = useState(false);
  const [editContractId, setEditContractId] = useState<string | null>(null);

  useEffect(() => {
    const query = searchParams.get("search") ?? "";
    if (query) setSearch(query);

    const openContractId = searchParams.get("openContract");
    if (openContractId) {
      setSelectedRecordId(openContractId);
      const next = new URLSearchParams(searchParams);
      next.delete("openContract");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    localStorage.setItem("crm-contract-owner-overrides", JSON.stringify(recordOverrides));
  }, [recordOverrides]);

  useEffect(() => {
    localStorage.setItem("crm-contract-transfer-logs", JSON.stringify(transferLogs));
  }, [transferLogs]);

  useEffect(() => {
    localStorage.setItem("crm-contract-status-overrides", JSON.stringify(statusOverrides));
  }, [statusOverrides]);

  const effectiveRecords = useMemo(() => hdmbImportRecords.map((record) => ({
    ...record,
    status: statusOverrides[record.id] ?? record.status,
    values: { ...record.values, ...(recordOverrides[record.id] ?? {}) },
  })), [recordOverrides, statusOverrides]);

  const selectedRecord = useMemo(() => effectiveRecords.find((record) => record.id === selectedRecordId) ?? null, [effectiveRecords, selectedRecordId]);

  const visibleFields = useMemo(() => {
    const base = showAllColumns
      ? hdmbImportFields
      : hdmbImportFields.filter((field) => defaultVisibleHdmbFieldKeys.includes(field.key));
    return base;
  }, [showAllColumns]);

  const customerOptions = useMemo(() => uniqueValues(effectiveRecords, "c3"), [effectiveRecords]);
  const apartmentOptions = useMemo(() => uniqueValues(effectiveRecords, "c51"), [effectiveRecords]);
  const towerOptions = useMemo(() => uniqueValues(effectiveRecords, "c52"), [effectiveRecords]);
  const apartmentTypeOptions = useMemo(() => uniqueValues(effectiveRecords, "c55"), [effectiveRecords]);
  const customerTypeOptions = useMemo(() => uniqueValues(effectiveRecords, "c108"), [effectiveRecords]);
  const paymentMethodOptions = useMemo(() => uniqueValues(effectiveRecords, "c69"), [effectiveRecords]);
  const salesOptions = useMemo(() => uniqueValues(effectiveRecords, "c154"), [effectiveRecords]);
  const salesUnitOptions = useMemo(() => uniqueValues(effectiveRecords, "c156"), [effectiveRecords]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return effectiveRecords.filter((record) => {
      const matchSearch =
        !q ||
        hdmbImportFields.some((field) => (record.values[field.key] || "").toLowerCase().includes(q));
      const checkStatus = checkResults[record.id]?.status ?? "pending";
      const matchCustomer = customerFilter === "all" || record.values.c3 === customerFilter;
      const matchApartment = apartmentFilter === "all" || record.values.c51 === apartmentFilter;
      const matchTower = towerFilter === "all" || record.values.c52 === towerFilter;
      const matchApartmentType = apartmentTypeFilter === "all" || record.values.c55 === apartmentTypeFilter;
      const matchPaymentMethod = paymentMethodFilter === "all" || record.values.c69 === paymentMethodFilter;
      const matchSales = salesFilter === "all" || record.values.c154 === salesFilter;
      const matchSalesUnit = salesUnitFilter === "all" || record.values.c156 === salesUnitFilter;
      const matchCustomerType = customerTypeFilter === "all" || record.values.c108 === customerTypeFilter;
      const matchTime = timeFilter === "all" || (record.values.c106 || record.values.c107 || "").includes(timeFilter);
      const matchStatus = statusFilter === "all" || checkStatus === statusFilter;
      const matchContractStatus = contractStatusFilter === "all" || (record.status || "Đã cọc") === contractStatusFilter;
      return matchSearch && matchCustomer && matchApartment && matchTower && matchApartmentType && matchPaymentMethod && matchSales && matchSalesUnit && matchCustomerType && matchTime && matchStatus && matchContractStatus;
    });
  }, [apartmentFilter, apartmentTypeFilter, checkResults, contractStatusFilter, customerFilter, customerTypeFilter, effectiveRecords, paymentMethodFilter, salesFilter, salesUnitFilter, search, statusFilter, timeFilter, towerFilter]);

  const towerChartData = useMemo<ContractChartDatum[]>(() => {
    const grouped = filteredRecords.reduce<Record<string, { count: number; revenue: number }>>((acc, record) => {
      const rawTower = (record.values.c52 || "").toLowerCase();
      const name = rawTower.includes("vitalis") ? "Vitalis" : "Harmonie";
      const revenue = parseCurrencyValue(record.values.c93 || record.values.c87);
      acc[name] = acc[name] || { count: 0, revenue: 0 };
      acc[name].count += 1;
      acc[name].revenue += revenue;
      return acc;
    }, {});

    return contractTowerChartCategories.map((name, index) => ({
      name,
      count: grouped[name]?.count ?? 0,
      revenue: grouped[name]?.revenue ?? 0,
      color: contractChartColors[index % contractChartColors.length],
    }));
  }, [filteredRecords]);

  const apartmentTypeChartData = useMemo<ContractChartDatum[]>(() => {
    const grouped = filteredRecords.reduce<Record<string, { count: number; revenue: number }>>((acc, record) => {
      const idNum = parseInt(record.id.replace(/\D/g, ""), 10) || 0;
      const name = contractApartmentTypeChartCategories[idNum % contractApartmentTypeChartCategories.length];
      const revenue = parseCurrencyValue(record.values.c93 || record.values.c87);
      acc[name] = acc[name] || { count: 0, revenue: 0 };
      acc[name].count += 1;
      acc[name].revenue += revenue;
      return acc;
    }, {});

    return contractApartmentTypeChartCategories.map((name, index) => ({
      name,
      count: grouped[name]?.count ?? 0,
      revenue: grouped[name]?.revenue ?? 0,
      color: contractChartColors[(index + 1) % contractChartColors.length],
    }));
  }, [filteredRecords]);

  // KPI Card metrics
  const totalValue = useMemo(() => {
    return filteredRecords.reduce((sum, record) => sum + parseCurrencyValue(record.values.c93 || record.values.c87), 0);
  }, [filteredRecords]);

  const averageValue = useMemo(() => {
    return filteredRecords.length > 0 ? Math.round(totalValue / filteredRecords.length) : 0;
  }, [filteredRecords, totalValue]);

  const uncheckedCount = useMemo(() => {
    return filteredRecords.filter((record) => (checkResults[record.id]?.status ?? "pending") === "pending").length;
  }, [filteredRecords, checkResults]);

  const passedCount = useMemo(() => {
    return filteredRecords.filter((record) => checkResults[record.id]?.status === "passed").length;
  }, [filteredRecords, checkResults]);

  const failedCount = useMemo(() => {
    return filteredRecords.filter((record) => checkResults[record.id]?.status === "failed").length;
  }, [filteredRecords, checkResults]);

  const passRate = useMemo(() => {
    return filteredRecords.length > 0 ? Math.round((passedCount / filteredRecords.length) * 100) : 0;
  }, [filteredRecords, passedCount]);

  const failRate = useMemo(() => {
    return filteredRecords.length > 0 ? Math.round((failedCount / filteredRecords.length) * 100) : 0;
  }, [filteredRecords, failedCount]);

  const totalDueValue = useMemo(() => {
    return filteredRecords.reduce((sum, record) => {
      const price = parseCurrencyValue(record.values.c93 || record.values.c87);
      const pct = parseFloat(record.values.c105 || "0") / 100;
      return sum + (price * pct);
    }, 0);
  }, [filteredRecords]);

  const dueContractsCount = useMemo(() => {
    return filteredRecords.filter((record) => parseFloat(record.values.c105 || "0") > 0).length;
  }, [filteredRecords]);

  useEffect(() => {
    setCurrentPage(1);
  }, [apartmentFilter, apartmentTypeFilter, contractStatusFilter, customerFilter, customerTypeFilter, paymentMethodFilter, projectFilter, salesFilter, salesUnitFilter, search, statusFilter, timeFilter, towerFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / contractTablePageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pageStartIndex = filteredRecords.length === 0 ? 0 : (safeCurrentPage - 1) * contractTablePageSize;
  const pageEndIndex = Math.min(pageStartIndex + contractTablePageSize, filteredRecords.length);
  const paginatedRecords = filteredRecords.slice(pageStartIndex, pageEndIndex);
  const currentPageSelected = paginatedRecords.length > 0 && paginatedRecords.every((record) => selectedRecordIds.has(record.id));
  const toggleSelectedRecord = (recordId: string) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  };
  const toggleCurrentPageSelection = () => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      const shouldSelect = !currentPageSelected;
      paginatedRecords.forEach((record) => {
        if (shouldSelect) {
          next.add(record.id);
        } else {
          next.delete(record.id);
        }
      });
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setProjectFilter("all");
    setTimeFilter("all");
    setStatusFilter("all");
    setCustomerTypeFilter("all");
    setCustomerFilter("all");
    setApartmentFilter("all");
    setTowerFilter("all");
    setApartmentTypeFilter("all");
    setPaymentMethodFilter("all");
    setSalesFilter("all");
    setSalesUnitFilter("all");
    setContractStatusFilter("all");
  };

  const hasActiveFilters = search || [projectFilter, timeFilter, statusFilter, contractStatusFilter, customerTypeFilter, customerFilter, apartmentFilter, towerFilter, apartmentTypeFilter, paymentMethodFilter, salesFilter, salesUnitFilter].some((value) => value !== "all");
  const activeFilterCount = [projectFilter, timeFilter, statusFilter, contractStatusFilter, customerTypeFilter, apartmentFilter, towerFilter, apartmentTypeFilter, paymentMethodFilter, salesFilter, salesUnitFilter].filter((value) => value !== "all").length;

  const exportContractList = () => {
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = [
      visibleFields.map((field) => field.label),
      ...filteredRecords.map((record) => visibleFields.map((field) => record.values[field.key] || "")),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(",")).join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "danh-sach-hop-dong.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openGmailDraft = () => {
    const subject = encodeURIComponent("Danh sách hợp đồng");
    const body = encodeURIComponent("Danh sách theo dõi và quản lý hợp đồng.");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportedFileName(file.name);
    event.target.value = "";
  };

  return (
    <div className="min-h-full space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-slate-950" style={{ fontWeight: 750 }}>Quản lý hợp đồng</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-500">Danh sách theo dõi và quản lý hợp đồng</p>
            {importedFileName && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                Đã chọn: {importedFileName}
              </span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <Button
            variant="outline"
            size="icon"
            className="hidden h-10 w-10 border-slate-200 bg-white shadow-sm hover:bg-emerald-50 sm:inline-flex"
            onClick={exportContractList}
            aria-label="Xuất Excel"
            title="Xuất Excel"
          >
            <FileSpreadsheet className="size-5 text-emerald-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-10 w-10 border-slate-200 bg-white shadow-sm hover:bg-red-50 sm:inline-flex"
            onClick={() => window.print()}
            aria-label="Xuất PDF"
            title="Xuất PDF"
          >
            <FileText className="size-5 text-red-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden h-10 w-10 border-slate-200 bg-white shadow-sm hover:bg-blue-50 sm:inline-flex"
            onClick={openGmailDraft}
            aria-label="Gửi qua Gmail"
            title="Gửi qua Gmail"
          >
            <Mail className="size-5 text-blue-500" />
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            aria-label="Chọn file Excel để import"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-10 flex-1 gap-2 border-slate-200 bg-white px-3 shadow-sm sm:flex-none sm:px-4"
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 text-slate-500" />
            Import Excel
          </Button>
          <Button size="sm" className="h-10 flex-1 gap-2 whitespace-nowrap bg-slate-950 px-3 hover:bg-slate-800 sm:flex-none sm:px-4" onClick={() => { setEditContractId(null); setCreateContractOpen(true); }}>
            <Plus className="h-4 w-4" />
            Tạo hợp đồng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ContractScoreCard
          icon={FileSpreadsheet}
          label="Tổng giá trị hợp đồng"
          value={`${formatCompactCurrency(totalValue)} VNĐ`}
          helper={`Giá trị HĐTB: ${averageValue.toLocaleString("vi-VN")} VNĐ`}
          iconClass="bg-blue-50"
        />
        <ContractScoreCard
          icon={FileText}
          label="Tổng số hợp đồng"
          value={`${filteredRecords.length} hợp đồng`}
          helper={`HĐ chưa kiểm tra: ${uncheckedCount}`}
          iconClass="bg-slate-100"
        />
        <ContractScoreCard
          icon={CheckCircle2}
          label="Tỷ lệ kiểm tra đạt"
          value={`${passRate}% · ${passedCount} hợp đồng`}
          helper={`Không đạt: ${failRate}% (${failedCount} hợp đồng)`}
          iconClass="bg-emerald-50"
        />
        <ContractScoreCard
          icon={AlertCircle}
          label="Tổng giá trị phải thu"
          value={`${formatCompactCurrency(totalDueValue)} VNĐ`}
          helper={`Số hợp đồng phải thu: ${dueContractsCount}`}
          iconClass="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ContractTowerStatusCard data={towerChartData} />
        <ContractApartmentTypeCard data={apartmentTypeChartData} />
      </div>

      <ContractPipelineFunnelCard filteredRecords={filteredRecords} />

      <Card className={contractPanelClass}>
        <div className={contractPanelHeaderClass}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách hợp đồng</h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {filteredRecords.length} hợp đồng phù hợp · {selectedRecordIds.size} đang chọn · {visibleFields.length} cột đang hiển thị
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={contractPanelMetaClass}>{filteredRecords.length} kết quả</span>
              {selectedRecordIds.size > 0 && (
                <span className={`${contractPanelMetaClass} border-blue-200 bg-blue-50 text-blue-700`}>
                  {selectedRecordIds.size} đang chọn
                </span>
              )}
              <span className={contractPanelMetaClass}>{visibleFields.length} cột</span>
              <span className="hidden text-xs text-slate-500 xl:inline">Bấm vào dòng để xem chi tiết hợp đồng</span>
            </div>
          </div>
        </div>

        <div className={contractPanelToolbarClass}>
          <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm trong danh sách hợp đồng"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger aria-label="Lọc theo dự án" className={`${compactFilterTriggerClass} w-32 flex-shrink-0`}><SelectValue placeholder="Dự án" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Dự án</SelectItem><SelectItem value="iki-village">Iki village</SelectItem></SelectContent>
            </Select>
            <Select value={towerFilter} onValueChange={setTowerFilter}>
              <SelectTrigger aria-label="Lọc theo block" className={`${compactFilterTriggerClass} w-24 flex-shrink-0`}><SelectValue placeholder="Block" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Block</SelectItem>{towerOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger aria-label="Lọc theo thời gian" className={`${compactFilterTriggerClass} w-32 flex-shrink-0`}><SelectValue placeholder="Thời gian" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Thời gian</SelectItem><SelectItem value="2025">2025</SelectItem><SelectItem value="2026">2026</SelectItem></SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger aria-label="Lọc theo trạng thái kiểm tra" className={`${compactFilterTriggerClass} w-40 flex-shrink-0`}><SelectValue placeholder="Kiểm tra hồ sơ" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Kiểm tra hồ sơ</SelectItem><SelectItem value="pending">Chờ kiểm tra</SelectItem><SelectItem value="passed">Đạt</SelectItem><SelectItem value="failed">Không đạt</SelectItem></SelectContent>
            </Select>
            <Select value={contractStatusFilter} onValueChange={setContractStatusFilter}>
              <SelectTrigger aria-label="Lọc theo trạng thái hợp đồng" className={`${compactFilterTriggerClass} w-48 flex-shrink-0`}><SelectValue placeholder="Trạng thái hợp đồng" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Trạng thái hợp đồng</SelectItem>
                {CONTRACT_STATUS_FLOW.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={customerTypeFilter} onValueChange={setCustomerTypeFilter}>
              <SelectTrigger aria-label="Lọc theo loại khách hàng" className={`${compactFilterTriggerClass} w-28 flex-shrink-0`}><SelectValue placeholder="MQH" /></SelectTrigger>
              <SelectContent><SelectItem value="all">MQH</SelectItem>{customerTypeOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger aria-label="Lọc theo phụ trách" className={`${compactFilterTriggerClass} w-32 flex-shrink-0`}><SelectValue placeholder="Phụ trách" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Phụ trách</SelectItem>{salesOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
            </Select>

            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button type="button" aria-expanded={filtersOpen} variant="outline" className="h-9 w-32 rounded-[8px] border-[#E5EAF3] bg-white px-2 text-xs text-slate-700 shadow-none">
                  <Filter className="h-3.5 w-3.5 text-slate-500" />
                  Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[520px] max-w-[calc(100vw-32px)] rounded-xl border border-[#E5EAF3] bg-white p-4 shadow-xl whitespace-normal" align="end" side="top" sideOffset={8}>
                <div className="mb-4 flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-slate-900">Bộ lọc</p><p className="text-xs text-slate-500">Bổ sung điều kiện lọc chi tiết</p></div>
                  {hasActiveFilters && <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500" onClick={clearFilters}>Xóa lọc</Button>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select value={customerFilter} onValueChange={setCustomerFilter}>
                    <SelectTrigger className={detailFilterTriggerClass}><SelectValue placeholder="Khách hàng" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tất cả khách hàng</SelectItem>{customerOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                    <SelectTrigger className={detailFilterTriggerClass}><SelectValue placeholder="Mã căn hộ" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tất cả mã căn hộ</SelectItem>{apartmentOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={apartmentTypeFilter} onValueChange={setApartmentTypeFilter}>
                    <SelectTrigger className={detailFilterTriggerClass}><SelectValue placeholder="Loại căn hộ" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tất cả loại căn hộ</SelectItem>{apartmentTypeOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger className={detailFilterTriggerClass}><SelectValue placeholder="PTTT" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tất cả PTTT</SelectItem>{paymentMethodOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={salesUnitFilter} onValueChange={setSalesUnitFilter}>
                    <SelectTrigger className={detailFilterTriggerClass}><SelectValue placeholder="Đơn vị bán hàng" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Mọi đơn vị bán hàng</SelectItem>{salesUnitOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={showAllColumns ? "all" : "default"} onValueChange={(value) => setShowAllColumns(value === "all")}>
              <SelectTrigger aria-label="Chọn chế độ hiển thị" className={`${compactFilterTriggerClass} w-32 flex-shrink-0`}><SelectValue placeholder="Hiển thị" /></SelectTrigger>
              <SelectContent><SelectItem value="default">Hiển thị</SelectItem><SelectItem value="all">Tất cả cột</SelectItem></SelectContent>
            </Select>

          </div>
        </div>

        <div className="max-h-[calc(100dvh-320px)] min-h-[420px] max-w-full overflow-auto bg-white">
          <Table className="min-w-max table-fixed border-separate border-spacing-0 text-sm">
            <TableHeader className="sticky top-0 z-20">
              <TableRow>
                <TableHead className="sticky left-0 z-40 w-12 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-2 py-2 text-center text-[11px] text-slate-600 shadow-[6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>
                  <button
                    type="button"
                    aria-label="Chọn tất cả dòng trong trang"
                    aria-pressed={currentPageSelected}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${currentPageSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-transparent hover:border-slate-500"}`}
                    onClick={toggleCurrentPageSelection}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                {visibleFields.map((field) => (
                  <TableHead key={field.key} className={`${contractTableHeaderClass} w-52`}>
                    <p className="line-clamp-2" title={`Cột ${field.column}: ${field.label}`} style={{ fontWeight: 650 }}>
                      {field.label}
                    </p>
                  </TableHead>
                ))}
                <TableHead className={`${contractTableHeaderClass} w-44`} style={{ fontWeight: 650 }}>Trạng thái kiểm tra</TableHead>
                <TableHead className={`${contractTableHeaderClass} w-40`} style={{ fontWeight: 650 }}>Người kiểm tra</TableHead>
                <TableHead className={`${contractTableHeaderClass} w-40`} style={{ fontWeight: 650 }}>Trạng thái</TableHead>
                <TableHead className="sticky right-0 z-40 h-10 w-14 border-b border-l border-[#DDE5F0] bg-[#F6F8FB] px-0 py-2 text-center text-[11px] text-slate-600 shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.45)]" style={{ fontWeight: 650 }}>...</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((record, index) => {
                const checkResult = checkResults[record.id];
                const checkLabel = checkResult?.status === "passed"
                  ? "Đã kiểm tra - Đạt"
                  : checkResult?.status === "failed"
                    ? "Đã kiểm tra - Chưa đạt"
                    : "Chưa kiểm tra";
                const checker = checkResult?.checkedBy || record.values.c154 || "Lâm Trà My";
                const isSelected = selectedRecordIds.has(record.id);
                return (
                <TableRow
                  key={record.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Mở chi tiết hợp đồng ${record.values.c2 || pageStartIndex + index + 1}`}
                  data-state={isSelected ? "selected" : undefined}
                  className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300"
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest(".td-actions") || target.closest(".td-select")) {
                      return;
                    }
                    setSelectedRecordId(record.id);
                  }}
                  onKeyDown={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest(".td-actions") || target.closest(".td-select")) {
                      return;
                    }
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRecordId(record.id);
                    }
                  }}
                >
                  <TableCell className={`td-select sticky left-0 z-10 h-11 w-12 border-b border-r border-[#E5EAF3] px-2 py-1.5 text-center shadow-[6px_0_12px_-12px_rgba(15,23,42,0.45)] ${contractStickyCellClass}`}>
                    <button
                      type="button"
                      className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                      title="Chọn dòng"
                      aria-label={`Chọn dòng ${pageStartIndex + index + 1}`}
                      aria-pressed={isSelected}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleSelectedRecord(record.id);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                  {visibleFields.map((field) => {
                    const value = record.values[field.key];
                    const isPrimary = ["c2", "c3", "c30", "c51", "c54", "c106"].includes(field.key);
                    return (
                      <TableCell key={field.key} className={`${contractTableCellClass} w-52`}>
                        <p className={`line-clamp-2 text-xs leading-5 ${value ? (isPrimary ? "text-slate-900" : "text-slate-700") : "text-slate-300"}`} style={{ fontWeight: isPrimary && value ? 600 : 400 }} title={compactValue(value)}>
                          {compactValue(value)}
                        </p>
                      </TableCell>
                    );
                  })}
                  <TableCell className={`${contractTableCellClass} w-44`}>
                    <Badge variant="outline" className={contractCheckBadgeClass(checkResult?.status)} style={{ fontWeight: 650 }}>{checkLabel}</Badge>
                  </TableCell>
                  <TableCell className={`${contractTableCellClass} w-40`}>
                    <p className="truncate text-xs leading-5 text-slate-800" style={{ fontWeight: 600 }}>{checker}</p>
                  </TableCell>
                  <TableCell className={`${contractTableCellClass} w-40`}>
                    <Badge variant="outline" className={contractStatusBadgeClass(record.status)}>
                      {record.status || "Đã cọc"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`td-actions sticky right-0 z-10 h-11 w-14 border-b border-l border-[#E5EAF3] px-0 py-1.5 text-center shadow-[-6px_0_12px_-12px_rgba(15,23,42,0.45)] ${contractStickyCellClass}`}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label={`Mở menu bản ghi ${pageStartIndex + index + 1}`} className="h-8 w-8 rounded-md p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300" onClick={(event) => event.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRecordId(record.id);
                          }}
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          Xem
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditContractId(record.id);
                            setCreateContractOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
                            Đổi trạng thái
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-56 max-h-72 overflow-y-auto bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                              {CONTRACT_STATUS_FLOW.map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (canJumpToStatus(record.status || "Đã cọc", status)) {
                                      onUpdateStatus(record.id, status);
                                    }
                                  }}
                                >
                                  <span>{status}</span>
                                  {(record.status || "Đã cọc") === status && <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                );
              })}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleFields.length + 5} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-1">
                      <p className="text-sm font-medium text-slate-700">Không tìm thấy dữ liệu phù hợp</p>
                      <p className="text-xs text-slate-400">Thử đổi từ khóa tìm kiếm hoặc điều kiện lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className={contractPanelFooterClass}>
          <div className="text-slate-500">10 dòng/trang</div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filteredRecords.length === 0 ? "0-0" : `${pageStartIndex + 1}-${pageEndIndex}`} / {filteredRecords.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>‹</Button>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={safeCurrentPage >= pageCount} onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <DetailDrawer
        record={selectedRecord}
        checkResult={selectedRecord ? checkResults[selectedRecord.id] : undefined}
        transferLogs={selectedRecord ? transferLogs[selectedRecord.id] ?? [] : []}
        onClose={() => setSelectedRecordId(null)}
        onSaveCheck={(recordId, result) => setCheckResults((prev) => ({ ...prev, [recordId]: result }))}
        onSaveTransfer={(recordId, overrides, log) => {
          setRecordOverrides((prev) => ({ ...prev, [recordId]: { ...(prev[recordId] ?? {}), ...overrides } }));
          setTransferLogs((prev) => ({ ...prev, [recordId]: [...(prev[recordId] ?? []), log] }));
        }}
        onUpdateStatus={(recordId, nextStatus) => {
          setStatusOverrides((prev) => ({ ...prev, [recordId]: nextStatus }));
        }}
        onEdit={(recordId) => {
          setEditContractId(recordId);
          setCreateContractOpen(true);
        }}
      />

      <Dialog open={createContractOpen} onOpenChange={(open) => { if (!open) { setCreateContractOpen(false); setEditContractId(null); } }}>
        <DialogContent className="!h-[calc(100vh-48px)] !w-[calc(100vw-48px)] !max-w-none !max-h-[calc(100vh-48px)] gap-0 overflow-hidden rounded-xl border-none bg-slate-50 p-0">
          <div className="relative h-full overflow-y-auto">
            <ContractCreatePage
              editId={editContractId || undefined}
              onClose={() => {
                setCreateContractOpen(false);
                setEditContractId(null);
              }}
              onSaved={() => {
                setCreateContractOpen(false);
                setEditContractId(null);
                const overrides = localStorage.getItem("crm-contract-owner-overrides");
                if (overrides) {
                  try {
                    setRecordOverrides(JSON.parse(overrides));
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
