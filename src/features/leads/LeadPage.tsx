import { useEffect, useState, useMemo } from "react";
import {
  Search, Users, User, MoreHorizontal, Eye, Trash2, Plus, Upload, SlidersHorizontal, CheckSquare, CheckCircle2, Pencil
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "@/components/ui/dropdown-menu";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";
import { getStoredLeads, saveStoredLeads } from "./mockDataLeads";
import { LeadCreateDialog } from "./LeadCreateDialog";
import { LeadDetailSheet } from "./LeadDetailSheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Lead, LeadStatus } from "./leadTypes";

const pipelineStatuses: LeadStatus[] = [
  "Lead mới",
  "Đã tiếp nhận",
  "Đang tư vấn",
  "Đã gửi báo giá",
  "Đã tham quan",
  "Giữ chỗ",
  "Đặt chỗ",
  "Đặt cọc",
  "Ký HĐMB",
  "Converted",
  "Không thành công"
];

const sourceFilters = [
  { value: "all", label: "Tất cả nguồn" },
  { value: "Facebook", label: "Facebook" },
  { value: "Website", label: "Website" },
  { value: "Hotline", label: "Hotline" },
  { value: "Walk-in", label: "Walk-in" },
  { value: "Giới thiệu", label: "Giới thiệu" },
];

const statusFilters = [
  { value: "all", label: "Tất cả trạng thái" },
  ...pipelineStatuses.map((s) => ({ value: s, label: s }))
];

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";
const leadPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const leadPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const leadPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const leadPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const leadPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";
const leadTableHeaderClass = "h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600";
const leadTableCellClass = "h-11 border-b border-r border-[#E5EAF3] bg-white px-3 py-1.5 align-middle transition-colors group-hover:bg-[#F8FAFC] group-data-[state=selected]:bg-blue-50/50";
const leadBadgeClass = "inline-flex h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1";

const statusConfig: Record<LeadStatus, string> = {
  "Lead mới": "bg-slate-50 text-slate-700 ring-slate-200 border-slate-200",
  "Đã tiếp nhận": "bg-blue-50 text-blue-700 ring-blue-200 border-blue-200",
  "Đang tư vấn": "bg-indigo-50 text-indigo-700 ring-indigo-200 border-indigo-200",
  "Đã gửi báo giá": "bg-amber-50 text-amber-700 ring-amber-200 border-amber-200",
  "Đã tham quan": "bg-purple-50 text-purple-700 ring-purple-200 border-purple-200",
  "Giữ chỗ": "bg-cyan-50 text-cyan-700 ring-cyan-200 border-cyan-200",
  "Đặt chỗ": "bg-sky-50 text-sky-700 ring-sky-200 border-sky-200",
  "Đặt cọc": "bg-teal-50 text-teal-700 ring-teal-200 border-teal-200",
  "Ký HĐMB": "bg-emerald-50 text-emerald-700 ring-emerald-200 border-emerald-200",
  Converted: "bg-green-50 text-green-700 ring-green-200 border-green-200",
  "Không thành công": "bg-red-50 text-red-700 ring-red-200 border-red-200",
};

const customerSourceClass: Record<string, string> = {
  Facebook: "bg-blue-50 text-blue-700 ring-blue-200",
  Zalo: "bg-sky-50 text-sky-700 ring-sky-200",
  Website: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Hotline: "bg-slate-50 text-slate-700 ring-slate-200",
  Email: "bg-orange-50 text-orange-700 ring-orange-200",
  Offline: "bg-slate-50 text-slate-700 ring-slate-200",
  "Giới thiệu": "bg-violet-50 text-violet-700 ring-violet-200",
  Referral: "bg-violet-50 text-violet-700 ring-violet-200",
  Khác: "bg-slate-50 text-slate-700 ring-slate-200",
};

export function LeadPage() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leadList, setLeadList] = useState<Lead[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ lead: Lead; newStatus: LeadStatus } | null>(null);
  const [statusLogContent, setStatusLogContent] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [page, setPage] = useState(1);

  // Load from localStorage
  useEffect(() => {
    setLeadList(getStoredLeads());
  }, []);

  useEffect(() => {
    const openEditDialog = (e: Event) => {
      const customEvent = e as CustomEvent<Lead>;
      const targetLead = customEvent.detail || selectedLead;
      setSheetOpen(false);
      setLeadToEdit(targetLead);
      setCreateOpen(true);
    };
    window.addEventListener("lead-edit-requested", openEditDialog);
    return () => window.removeEventListener("lead-edit-requested", openEditDialog);
  }, [selectedLead]);

  const handleCreateLead = (leadData: Lead) => {
    let updated;
    const exists = leadList.some((l) => l.id === leadData.id);
    if (exists) {
      updated = leadList.map((l) => (l.id === leadData.id ? leadData : l));
      if (selectedLead?.id === leadData.id) {
        setSelectedLead(leadData);
      }
    } else {
      updated = [leadData, ...leadList];
    }
    setLeadList(updated);
    saveStoredLeads(updated);
    setCreateOpen(false);
    setLeadToEdit(null);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    const updated = leadList.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeadList(updated);
    saveStoredLeads(updated);
    setSelectedLead(updatedLead);
  };

  const handleImportExcel = () => {
    // Mock Import Function
    const mockExcelLeads: Lead[] = [
      {
        id: "LEAD-IMPORT-01",
        name: "Hoàng Văn Thái",
        phone: "0909000111",
        email: "thai.hoang@gmail.com",
        gender: "Nam",
        dob: "20/10/1988",
        address: "12 Võ Văn Kiệt, Quận 5",
        job: "Nhà đầu tư tự do",
        source: "Excel Import",
        salesperson: "Nguyễn Văn A",
        status: "Lead mới",
        createDate: new Date().toLocaleDateString("vi-VN"),
        careNote: "Khách quan tâm giỏ hàng The Sun Avenue mua sỉ đầu tư căn hộ.",
        timeline: [{ date: `10:00 ${new Date().toLocaleDateString("vi-VN")}`, type: "Excel", content: "Import danh sách Excel" }],
        chats: [],
        files: [],
        proposals: [],
        tasks: []
      }
    ];

    const updated = [...mockExcelLeads, ...leadList];
    setLeadList(updated);
    saveStoredLeads(updated);
    alert("Đã import thành công 1 khách hàng tiềm năng từ Excel mẫu!");
  };

  const handleConvertLead = (lead: Lead) => {
    // 1. Create a Customer record
    const newCustomer = {
      id: `CUST-${lead.id.split("-")[1] || Math.floor(Math.random() * 9000) + 1000}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      gender: lead.gender,
      dob: lead.dob,
      job: lead.job,
      source: lead.source,
      lifestyle: "Chưa cập nhật",
      customerGroup: "VIP",
      hobbies: "Chưa cập nhật",
      wellnessStyle: "Chưa cập nhật",
      housingNeed: lead.careNote || "Chưa cập nhật",
      careNote: lead.careNote,
      joinDate: new Date().toLocaleDateString("vi-VN"),
      note: `Được chuyển đổi từ Lead ${lead.id}`
    };

    // 2. Read current customers from localStorage
    const savedCust = localStorage.getItem("crm_customers");
    let currentCustomers = [];
    if (savedCust) {
      try {
        currentCustomers = JSON.parse(savedCust);
      } catch {
        currentCustomers = [];
      }
    } else {
      // Import baseline mock data
      const baseCustomers = [
        {
          id: "CUST-001",
          name: "Lê Hoàng Nam",
          phone: "0912345678",
          email: "nam.le@gmail.com",
          address: "72 Nguyễn Huệ, Quận 1, TP.HCM",
          gender: "Nam",
          dob: "12/04/1990",
          job: "Kinh doanh tự do",
          source: "Website",
          lifestyle: "Chưa cập nhật",
          customerGroup: "VIP",
          hobbies: "Chưa cập nhật",
          wellnessStyle: "Chưa cập nhật",
          housingNeed: "Chưa cập nhật",
          careNote: "Chưa cập nhật",
          joinDate: "01/06/2026",
          note: ""
        }
      ];
      currentCustomers = baseCustomers;
    }

    if (!currentCustomers.some((c: any) => c.phone === lead.phone)) {
      currentCustomers.unshift(newCustomer);
      localStorage.setItem("crm_customers", JSON.stringify(currentCustomers));
    }

    // 3. Mark Lead as Converted
    const updated = leadList.map((l) => (l.id === lead.id ? { ...l, status: "Converted" as LeadStatus } : l));
    setLeadList(updated);
    saveStoredLeads(updated);

    setSelectedLead((prev) => (prev?.id === lead.id ? { ...prev, status: "Converted" as LeadStatus } : prev));
    setSheetOpen(false);

    alert(`Đã chuyển đổi Lead "${lead.name}" thành Khách hàng thành công!\nHệ thống đang điều hướng sang danh sách Khách hàng.`);
    window.location.href = "/customers";
  };

  const filteredLeads = useMemo(() => {
    return leadList.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        l.id.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === "all" || l.source === sourceFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchSource && matchStatus;
    });
  }, [leadList, search, sourceFilter, statusFilter]);

  const totalLeads = leadList.length;
  const newLeadCount = leadList.filter((l) => l.status === "Lead mới").length;
  const consultingCount = leadList.filter((l) => l.status === "Đang tư vấn").length;
  const convertedCount = leadList.filter((l) => l.status === "Converted").length;

  const perPage = Number(rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const visibleLeads = filteredLeads.slice(startIndex, startIndex + perPage);

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((current) => {
      const next = new Set(current);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === visibleLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(visibleLeads.map((l) => l.id)));
    }
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa Lead này?")) {
      const updated = leadList.filter((l) => l.id !== leadId);
      setLeadList(updated);
      saveStoredLeads(updated);
      setSelectedLeadIds((current) => {
        const next = new Set(current);
        next.delete(leadId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-full space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-slate-950" style={{ fontWeight: 750 }}>Quản lý khách hàng tiềm năng (Lead)</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalLeads} Leads đang theo dõi · {convertedCount} đã chuyển đổi thành công
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <Button size="sm" onClick={handleImportExcel} variant="outline" className="h-10 flex-1 gap-2 border-slate-200 bg-white px-3 shadow-sm sm:flex-none sm:px-4">
            <Upload className="w-4 h-4 text-slate-500" />
            Import Excel
          </Button>
          <Button size="sm" onClick={() => { setLeadToEdit(null); setCreateOpen(true); }} className="h-10 flex-1 gap-2 whitespace-nowrap bg-slate-950 px-3 hover:bg-slate-800 sm:flex-none sm:px-4">
            <Plus className="w-4 h-4" />
            Thêm Lead
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CoreMetricCard icon={Users} label="Tổng số Lead" value={String(totalLeads)} sub="Đã tiếp nhận" iconClass="bg-blue-50" />
        <CoreMetricCard icon={User} label="Lead mới" value={String(newLeadCount)} sub="Chờ tiếp nhận" iconClass="bg-blue-50" />
        <CoreMetricCard icon={SlidersHorizontal} label="Đang tư vấn" value={String(consultingCount)} sub="Trong Pipeline" iconClass="bg-orange-50" />
        <CoreMetricCard icon={CheckSquare} label="Đã chuyển đổi" value={String(convertedCount)} sub="Converted" iconClass="bg-green-50" />
      </div>

      {/* Main Panel */}
      <Card className={leadPanelClass}>
        {/* Panel header */}
        <div className={leadPanelHeaderClass}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách Lead</h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {filteredLeads.length} Lead phù hợp · {selectedLeadIds.size} đang chọn
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={leadPanelMetaClass}>{filteredLeads.length} kết quả</span>
              {selectedLeadIds.size > 0 && (
                <span className={`${leadPanelMetaClass} border-blue-200 bg-blue-50 text-blue-700`}>
                  {selectedLeadIds.size} đang chọn
                </span>
              )}
              <span className="hidden text-xs text-slate-500 lg:inline">Bấm vào dòng để xem chi tiết Lead</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className={leadPanelToolbarClass}>
          <div className="flex max-w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap">
            <div className="relative min-w-[180px] flex-1 flex-shrink-0 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search"
                aria-label="Tìm kiếm Lead theo tên, điện thoại hoặc mã"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
            <Select value={sourceFilter} onValueChange={(val) => { setSourceFilter(val); setPage(1); }}>
              <SelectTrigger aria-label="Lọc theo nguồn" className={`${compactFilterTriggerClass} w-36 flex-shrink-0`}>
                <SelectValue placeholder="Nguồn" />
              </SelectTrigger>
              <SelectContent>
                {sourceFilters.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger aria-label="Lọc theo trạng thái" className={`${compactFilterTriggerClass} w-44 flex-shrink-0`}>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px] border-separate border-spacing-0 text-sm">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 w-12 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-2 py-2 text-center align-middle text-[11px] text-slate-600" style={{ fontWeight: 650 }}>
                  <button
                    type="button"
                    aria-label="Chọn tất cả Lead đang hiển thị"
                    aria-pressed={selectedLeadIds.size > 0 && selectedLeadIds.size === visibleLeads.length}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${selectedLeadIds.size > 0 && selectedLeadIds.size === visibleLeads.length ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                    onClick={toggleSelectAll}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className={`${leadTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>ID Lead</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-44`} style={{ fontWeight: 650 }}>Họ và tên</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-36`} style={{ fontWeight: 650 }}>Số điện thoại</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-44`} style={{ fontWeight: 650 }}>Email</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Nguồn</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-32`} style={{ fontWeight: 650 }}>Ngày tạo</TableHead>
                <TableHead className={`${leadTableHeaderClass} w-40`} style={{ fontWeight: 650 }}>Trạng thái</TableHead>
                <TableHead className="h-10 w-14 border-b border-[#DDE5F0] bg-[#F6F8FB] px-0 py-2 text-center align-middle text-[11px] leading-4 text-slate-600" style={{ fontWeight: 650 }}>...</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleLeads.map((l) => {
                const isSelected = selectedLeadIds.has(l.id);
                return (
                  <TableRow
                    key={l.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mở chi tiết Lead ${l.name}`}
                    data-state={isSelected ? "selected" : undefined}
                    className="group h-11 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) return;
                      setSelectedLead(l);
                      setSheetOpen(true);
                    }}
                    onKeyDown={(event) => {
                      const target = event.target as HTMLElement;
                      if (target.closest(".td-actions") || target.closest(".td-select")) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedLead(l);
                        setSheetOpen(true);
                      }
                    }}
                  >
                    <TableCell className="td-select h-11 border-b border-r border-[#E5EAF3] bg-white px-2 py-1.5 text-center align-middle">
                      <button
                        type="button"
                        className={`mx-auto flex h-5 w-5 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-1 ${isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-[#DDE5F0] bg-white text-transparent hover:border-slate-500"}`}
                        title="Chọn dòng"
                        aria-label={`Chọn Lead ${l.name}`}
                        aria-pressed={isSelected}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSelectLead(l.id);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                    <TableCell className={`${leadTableCellClass} font-semibold text-blue-600`}>{l.id}</TableCell>
                    <TableCell className={`${leadTableCellClass} font-semibold text-slate-800`}>{l.name}</TableCell>
                    <TableCell className={leadTableCellClass}>{l.phone}</TableCell>
                    <TableCell className={leadTableCellClass}>{l.email || "—"}</TableCell>
                    <TableCell className={leadTableCellClass}>
                      <Badge variant="outline" className={`${leadBadgeClass} ${customerSourceClass[l.source] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`} style={{ fontWeight: 650 }}>
                        {l.source}
                      </Badge>
                    </TableCell>
                    <TableCell className={leadTableCellClass}>{l.createDate}</TableCell>
                    <TableCell className="td-status h-11 border-b border-r border-[#E5EAF3] px-3 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={l.status}
                        onValueChange={(val) => {
                          setPendingStatusChange({ lead: l, newStatus: val as LeadStatus });
                          setStatusLogContent(`Chuyển trạng thái từ "${l.status}" sang "${val}"`);
                        }}
                      >
                        <SelectTrigger className={`h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 w-fit gap-1 shadow-none focus:ring-0 [&_svg]:size-3 ${statusConfig[l.status]}`} style={{ fontWeight: 650 }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                          <SelectItem value="Lead mới">Lead mới</SelectItem>
                          <SelectItem value="Đã tiếp nhận">Đã tiếp nhận</SelectItem>
                          <SelectItem value="Đang tư vấn">Đang tư vấn</SelectItem>
                          <SelectItem value="Đã gửi báo giá">Đã gửi báo giá</SelectItem>
                          <SelectItem value="Đã tham quan">Đã tham quan</SelectItem>
                          <SelectItem value="Giữ chỗ">Giữ chỗ</SelectItem>
                          <SelectItem value="Đặt chỗ">Đặt chỗ</SelectItem>
                          <SelectItem value="Đặt cọc">Đặt cọc</SelectItem>
                          <SelectItem value="Ký HĐMB">Ký HĐMB</SelectItem>
                          <SelectItem value="Không thành công">Không thành công</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="td-actions h-11 border-b border-[#E5EAF3] bg-white px-0 py-1.5 text-center align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" aria-label={`Mở menu Lead ${l.name}`} className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700" onClick={(event) => event.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              setLeadToEdit(l);
                              setCreateOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLead(l);
                              setSheetOpen(true);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            Xem
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer focus:bg-red-50 focus:text-red-700 focus:outline-none"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteLead(l.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            Xoá
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibleLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-1">
                      <p className="text-sm font-medium text-slate-700">Không tìm thấy Lead nào phù hợp</p>
                      <p className="text-xs text-slate-400">Thử đổi từ khóa tìm kiếm hoặc điều kiện lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className={leadPanelFooterClass}>
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <Select
              value={rowsPerPage}
              onValueChange={(val) => { setRowsPerPage(val); setPage(1); }}
            >
              <SelectTrigger className="h-8 w-[72px] rounded-[8px] border-[#E5EAF3] bg-white px-2 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>dòng · Tổng {filteredLeads.length} bản ghi</span>
          </div>

          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {filteredLeads.length === 0 ? "0-0" : `${startIndex + 1}-${Math.min(startIndex + perPage, filteredLeads.length)}`} of {filteredLeads.length}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage <= 1} onClick={() => setPage((c) => Math.max(1, c - 1))}>‹</Button>
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <PaginationItem key={pNum}>
                  <Button
                    variant={pNum === currentPage ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 rounded-[8px] p-0 text-xs ${pNum === currentPage ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                    onClick={() => setPage(pNum)}
                  >
                    {pNum}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled={currentPage >= totalPages} onClick={() => setPage((c) => Math.min(totalPages, c + 1))}>›</Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      <LeadCreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreateLead} leadToEdit={leadToEdit} />
      <LeadDetailSheet lead={selectedLead} open={sheetOpen} onOpenChange={setSheetOpen} onUpdateLead={handleUpdateLead} onConvert={handleConvertLead} />

      <Dialog open={!!pendingStatusChange} onOpenChange={(open) => { if (!open) setPendingStatusChange(null); }}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-2xl">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-900">Cập nhật trạng thái Lead</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Nhập ghi chú lý do cập nhật trạng thái của Lead <strong>{pendingStatusChange?.lead.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-slate-500">Trạng thái mới:</span>
              <Badge variant="outline" className={`${leadBadgeClass} ${statusConfig[pendingStatusChange?.newStatus || "Lead mới"]}`}>
                {pendingStatusChange?.newStatus}
              </Badge>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Nội dung nhật ký</span>
              <Textarea
                autoFocus
                value={statusLogContent}
                onChange={(e) => setStatusLogContent(e.target.value)}
                placeholder="Nhập ghi chú..."
                className="min-h-[100px] text-xs resize-none"
              />
            </label>
          </div>
          <DialogFooter className="border-t border-slate-100 bg-slate-50 px-6 py-4 gap-2">
            <Button variant="outline" onClick={() => setPendingStatusChange(null)} className="h-9 text-xs">
              Hủy
            </Button>
            <Button 
              onClick={() => {
                if (pendingStatusChange) {
                  const now = new Date();
                  const formattedTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
                  const content = statusLogContent.trim() || `Chuyển trạng thái sang "${pendingStatusChange.newStatus}"`;
                  const updatedLead = {
                    ...pendingStatusChange.lead,
                    status: pendingStatusChange.newStatus,
                    timeline: [
                      {
                        date: formattedTime,
                        type: "Cập nhật trạng thái",
                        content: content
                      },
                      ...pendingStatusChange.lead.timeline
                    ]
                  };
                  handleUpdateLead(updatedLead);
                  setPendingStatusChange(null);
                  setStatusLogContent("");
                }
              }}
              className="h-9 text-xs bg-slate-950 hover:bg-slate-800 text-white px-4"
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
