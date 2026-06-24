import { useState } from "react";
import {
  CheckCircle2, XCircle,
  Eye, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ContractDetailSheet } from "../contracts/ContractDetailSheet";
import type { Customer, Contract } from "@/data/mockDataHopDong";

const statusConfig: Record<string, string> = {
  "Đang ký":   "bg-blue-100 text-blue-700 border-blue-200",
  "Đã ký":     "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Công chứng":"bg-indigo-100 text-indigo-700 border-indigo-200",
  "Đã hủy":   "bg-red-100 text-red-700 border-red-200",
};

type CustomerDetailTab =
  | "extraInfo"
  | "interactionHistory"
  | "journey"
  | "debt"
  | "pointHistory"
  | "bookingHistory"
  | "ticket";

const customerDetailTabs: Array<{ value: CustomerDetailTab; label: string }> = [
  { value: "extraInfo", label: "Thông tin thêm" },
  { value: "interactionHistory", label: "Lịch sử trao đổi" },
  { value: "journey", label: "Hành trình khách hàng" },
  { value: "debt", label: "Công nợ" },
  { value: "pointHistory", label: "Lịch sử tích đổi điểm" },
  { value: "bookingHistory", label: "Lịch sử booking" },
  { value: "ticket", label: "Ticket" },
];

interface CustomerDetailSheetProps {
  customer: Customer | null;
  contracts: Contract[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CustomerDetailStats = {
  totalValue: number;
  totalPaid: number;
  outstanding: number;
  activeCount: number;
  cancelCount: number;
  overallPct: number;
};

type CustomerDetailPageProps = {
  customer: Customer;
  contracts: Contract[];
  stats: CustomerDetailStats;
  onOpenContract: (contract: Contract) => void;
};

export function CustomerDetailSheet({ customer, contracts, open, onOpenChange }: CustomerDetailSheetProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [contractSheetOpen, setContractSheetOpen] = useState(false);

  if (!customer) return null;

  const totalValue   = contracts.reduce((s, c) => s + c.total, 0);
  const totalPaid    = contracts.reduce((s, c) => s + c.paid, 0);
  const outstanding  = totalValue - totalPaid;
  const activeCount  = contracts.filter((c) => c.status !== "Đã hủy").length;
  const cancelCount  = contracts.filter((c) => c.status === "Đã hủy").length;
  const overallPct   = totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0;

  const openContract = (c: Contract) => {
    setSelectedContract(c);
    setContractSheetOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="top"
          className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1440px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1440px]"
          aria-describedby={undefined}
        >
          <CustomerDetailPage customer={customer} contracts={contracts} stats={{ totalValue, totalPaid, outstanding, activeCount, cancelCount, overallPct }} onOpenContract={openContract} />
        </SheetContent>
      </Sheet>

      {/* Nested Contract Detail Sheet */}
      <ContractDetailSheet
        contract={selectedContract}
        open={contractSheetOpen}
        onOpenChange={setContractSheetOpen}
      />
    </>
  );
}

function CustomerDetailPage({ customer, contracts, stats, onOpenContract }: CustomerDetailPageProps) {
  const [activeTab, setActiveTab] = useState<CustomerDetailTab>("extraInfo");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SheetTitle className="sr-only">Hồ sơ khách hàng {customer.name}</SheetTitle>
      <CustomerDetailHeader />
      <CustomerSummaryCard customer={customer} stats={stats} />
      <CustomerDetailBody
        customer={customer}
        contracts={contracts}
        stats={stats}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenContract={onOpenContract}
      />
    </div>
  );
}

function CustomerDetailHeader() {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
      <h2 className="text-base text-slate-950" style={{ fontWeight: 700 }}>Chi tiết khách hàng</h2>
    </div>
  );
}

function CustomerSummaryCard({ customer, stats }: { customer: Customer; stats: CustomerDetailStats }) {
  const isVip = customer.customerGroup === "VIP" || customer.note?.toLowerCase().includes("vip");
  const isActive = stats.activeCount > 0;

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white">
      <div className="min-w-0 px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-[26px] leading-8 text-slate-950" style={{ fontWeight: 750 }}>{customer.name}</h3>
          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden="true" />
          <span className="text-sm text-slate-600">{isActive ? "Đang hoạt động" : "Chưa hoạt động"}</span>
          {isVip && (
            <span className="inline-flex rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-700" style={{ fontWeight: 650 }}>
              VIP
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>ID khách hàng: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.id}</span></span>
          <span className="text-slate-300">•</span>
          <span>Ngày tham gia: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.joinDate || "Chưa cập nhật"}</span></span>
          <span className="text-slate-300">•</span>
          <span>Cập nhật lần cuối: <span className="text-slate-800" style={{ fontWeight: 650 }}>{customer.joinDate || "Chưa cập nhật"}</span></span>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailBody({
  customer,
  contracts,
  stats,
  activeTab,
  onTabChange,
  onOpenContract,
}: {
  customer: Customer;
  contracts: Contract[];
  stats: CustomerDetailStats;
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CustomerProfileSidebar customer={customer} stats={stats} />
        <CustomerMainPanel
          customer={customer}
          contracts={contracts}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenContract={onOpenContract}
        />
      </div>
      <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6">
        <SheetClose asChild>
          <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
            Đóng
          </Button>
        </SheetClose>
        <Button
          className="h-9 rounded-lg bg-black px-4 text-sm text-white hover:bg-slate-800"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("customer-edit-requested"));
          }}
        >
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
}

function CustomerProfileSidebar({ customer }: { customer: Customer; stats: CustomerDetailStats }) {
  const empty = "Chưa cập nhật";
  const rows = [
    { label: "Họ và tên", value: customer.name || empty },
    { label: "Email", value: customer.email || empty, copyable: Boolean(customer.email) },
    { label: "Số điện thoại", value: customer.phone || empty, copyable: Boolean(customer.phone) },
    { label: "Ngày sinh", value: customer.dob || empty },
    { label: "Giới tính", value: customer.gender || empty },
    { label: "Quốc gia", value: customer.country || empty, prefix: customer.country ? <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] text-yellow-200">★</span> : undefined },
    { label: "CCCD/HC", value: customer.cccd || empty },
    { label: "Địa chỉ", value: customer.address || empty },
    { label: "Nghề nghiệp", value: customer.job || empty },
  ];

  return (
    <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-5">
      <div className="aspect-[1.04] w-full overflow-hidden rounded-lg bg-slate-100 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80"
          alt={`Ảnh đại diện ${customer.name}`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.1fr)] items-center gap-3 py-2.5 text-sm">
            <p className="text-slate-500">{row.label}</p>
            <div className="flex min-w-0 items-center justify-end gap-2">
              {row.prefix}
              <p className={`min-w-0 truncate text-right text-slate-950 ${row.valueClass ?? ""}`} style={{ fontWeight: row.valueClass ? 500 : 400 }}>
                {row.value}
              </p>
              {row.copyable && (
                <button type="button" className="relative h-4 w-4 shrink-0 text-slate-400" aria-label={`Sao chép ${row.label.toLowerCase()}`}>
                  <span className="absolute left-1 top-0 h-3 w-3 rounded-[2px] border border-current bg-white" />
                  <span className="absolute left-0 top-1 h-3 w-3 rounded-[2px] border border-current bg-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function CustomerMainPanel({
  customer,
  contracts,
  activeTab,
  onTabChange,
  onOpenContract,
}: {
  customer: Customer;
  contracts: Contract[];
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
  onOpenContract: (contract: Contract) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <CustomerTabsNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <CustomerTabContent
          activeTab={activeTab}
          customer={customer}
          contracts={contracts}
          onOpenContract={onOpenContract}
        />
      </div>
    </div>
  );
}

function CustomerTabsNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: CustomerDetailTab;
  onTabChange: (tab: CustomerDetailTab) => void;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex h-10 w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
        {customerDetailTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              className={`h-8 shrink-0 rounded-md px-3.5 text-sm transition-colors ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
              style={{ fontWeight: isActive ? 650 : 500 }}
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CustomerTabContent({
  activeTab,
  customer,
  contracts,
  onOpenContract,
}: {
  activeTab: CustomerDetailTab;
  customer: Customer;
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
}) {
  switch (activeTab) {
    case "extraInfo":
      return <CustomerExtraInfoTab customer={customer} />;
    case "debt":
      return <CustomerDebtTab contracts={contracts} onOpenContract={onOpenContract} />;
    case "interactionHistory":
      return <CustomerPlaceholderTab title="Lịch sử trao đổi" />;
    case "journey":
      return <CustomerPlaceholderTab title="Hành trình khách hàng" />;
    case "pointHistory":
      return <CustomerPlaceholderTab title="Lịch sử tích đổi điểm" />;
    case "bookingHistory":
      return <CustomerPlaceholderTab title="Lịch sử booking" />;
    case "ticket":
      return <CustomerPlaceholderTab title="Ticket" />;
    default:
      return <CustomerExtraInfoTab customer={customer} />;
  }
}

function CustomerDebtTab({
  contracts,
  onOpenContract,
}: {
  contracts: Contract[];
  onOpenContract: (contract: Contract) => void;
}) {
  return (
    <div className="space-y-3 px-5 py-4">
      {contracts.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          Khách hàng chưa có hợp đồng nào
        </div>
      ) : (
        contracts.map((c) => {
          const hasOverdue = c.payments.some((p) => p.status === "overdue");
          return (
            <div
              key={c.id}
              className={`border rounded-xl p-4 transition-all cursor-pointer hover:shadow-sm hover:border-indigo-200 group ${
                hasOverdue ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-white"
              }`}
              onClick={() => onOpenContract(c)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-xs text-indigo-600" style={{ fontWeight: 700 }}>{c.id}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-xs ${statusConfig[c.status]}`} style={{ fontWeight: 500 }}>
                      {c.status}
                    </span>
                    {hasOverdue && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600" style={{ fontWeight: 500 }}>
                        <XCircle className="w-3 h-3" /> Quá hạn TT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 truncate" style={{ fontWeight: 500 }}>{c.property}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.type} · Ký {c.date} · NV: {c.salesperson}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-1 transition-colors" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${c.pct === 100 ? "bg-emerald-500" : hasOverdue ? "bg-red-400" : "bg-blue-500"}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 shrink-0 w-8 text-right">{c.pct}%</span>
                <span className="text-xs text-slate-700 shrink-0" style={{ fontWeight: 600 }}>{c.value} đ</span>
              </div>

              <div className="flex gap-2 mt-2.5 flex-wrap">
                {c.payments.some((p) => p.status === "on-time") && (
                  <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    {c.payments.filter((p) => p.status === "on-time").length} đúng hạn
                  </span>
                )}
                {c.payments.some((p) => p.status === "overdue") && (
                  <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-100 rounded-full px-2 py-0.5">
                    <XCircle className="w-3 h-3" />
                    {c.payments.filter((p) => p.status === "overdue").length} quá hạn
                  </span>
                )}
                {c.payments.some((p) => p.status === "pending") && (
                  <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                    {c.payments.filter((p) => p.status === "pending").length} chờ thanh toán
                  </span>
                )}
                {c.payments.length === 0 && (
                  <span className="text-xs text-slate-400">Không có lịch thanh toán</span>
                )}
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onOpenContract(c); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem chi tiết HĐ
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function CustomerExtraInfoTab({ customer }: { customer: Customer }) {
  const empty = "Chưa cập nhật";
  const rows = [
    { label: "Gu sống", value: customer.lifestyle || empty },
    { label: "Nhóm khách hàng", value: customer.customerGroup || empty },
    { label: "Sở thích", value: customer.hobbies || empty },
    { label: "Wellness / Living Style", value: customer.wellnessStyle || empty },
    { label: "Nhu cầu đầu tư / an cư", value: customer.housingNeed || empty },
    { label: "Ghi chú", value: customer.careNote || customer.note || empty },
  ];

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[minmax(170px,0.38fr)_1fr] gap-7 py-5 first:pt-0 last:pb-0">
              <p className="text-[15px] text-slate-500">{row.label}</p>
              <p className="max-w-[760px] text-[15px] leading-6 text-slate-950" style={{ fontWeight: 650 }}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerPlaceholderTab({ title }: { title: string }) {
  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="text-sm text-slate-600" style={{ fontWeight: 600 }}>{title}</p>
        <p className="mt-1 text-xs text-slate-400">Nội dung sẽ được triển khai trong phase riêng.</p>
      </div>
    </div>
  );
}
