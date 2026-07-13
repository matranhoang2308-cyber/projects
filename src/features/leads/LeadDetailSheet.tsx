import { useState, useMemo, useRef } from "react";
import {
  X, CheckCircle2, Eye, Search, Plus, MessageSquare, Clock, FileText, BriefcaseBusiness, Check, CircleAlert, CalendarDays, Download, UploadCloud
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { Lead, LeadStatus, LeadTimeline, LeadChat, LeadFile, LeadProposal, LeadTask } from "./leadTypes";

type LeadDetailTab =
  | "overview"
  | "chat"
  | "tasks"
  | "files"
  | "notes"
  | "timeline";

const leadDetailTabs: Array<{ value: LeadDetailTab; label: string }> = [
  { value: "overview", label: "Tổng quan" },
  { value: "chat", label: "Lịch sử chat" },
  { value: "tasks", label: "Công việc" },
  { value: "files", label: "File" },
  { value: "notes", label: "Ghi chú" },
  { value: "timeline", label: "Nhật ký & Timeline" },
];

const statusConfig: Record<LeadStatus, string> = {
  "Lead mới": "bg-slate-100 text-slate-700 border-slate-200",
  "Đã tiếp nhận": "bg-blue-100 text-blue-700 border-blue-200",
  "Đang tư vấn": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Đã gửi báo giá": "bg-amber-100 text-amber-700 border-amber-200",
  "Đã tham quan": "bg-purple-100 text-purple-700 border-purple-200",
  "Giữ chỗ": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Đặt chỗ": "bg-sky-100 text-sky-700 border-sky-200",
  "Đặt cọc": "bg-teal-100 text-teal-700 border-teal-200",
  "Ký HĐMB": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Converted: "bg-green-100 text-green-700 border-green-200",
  "Không thành công": "bg-red-100 text-red-700 border-red-200",
};

const leadBadgeClass = "inline-flex h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1";

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

const pipelineSteps: LeadStatus[] = [
  "Lead mới",
  "Đã tiếp nhận",
  "Đang tư vấn",
  "Đã gửi báo giá",
  "Đã tham quan",
  "Giữ chỗ",
  "Đặt chỗ",
  "Đặt cọc",
  "Ký HĐMB",
];

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadDetailSheet({ lead, open, onOpenChange, onUpdateLead, onConvert }: LeadDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<LeadDetailTab>("overview");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const empty = "Chưa cập nhật";

  if (!lead) return null;

  const copyToClipboard = async (label: string, value: string) => {
    if (!value || value === empty) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(label);
      window.setTimeout(() => setCopiedField((current) => (current === label ? null : current)), 1600);
    } catch {
      setCopiedField(null);
    }
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      timeline: [
        {
          date: `${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${new Date().toLocaleDateString("vi-VN")}`,
          type: "Cập nhật trạng thái",
          content: `Chuyển trạng thái sang "${newStatus}"`
        },
        ...lead.timeline
      ]
    };
    onUpdateLead(updatedLead);
  };

  const sidebarRows = [
    { label: "Họ và tên", value: lead.name || empty },
    { label: "Email", value: lead.email || empty, copyable: Boolean(lead.email) },
    { label: "Số điện thoại", value: lead.phone || empty, copyable: Boolean(lead.phone) },
    { label: "Ngày sinh", value: lead.dob || empty },
    { label: "Giới tính", value: lead.gender || empty },
    { label: "Nghề nghiệp", value: lead.job || empty },
    { label: "Địa chỉ", value: lead.address || empty },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="inset-x-auto left-1/2 top-1/2 h-[92vh] w-[calc(100vw-48px)] max-w-[1440px] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-slate-200 p-0 shadow-2xl sm:max-w-[1440px]"
        aria-describedby={undefined}
      >
        <SheetClose className="absolute right-4 top-4 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 p-1.5 z-50">
          <X className="h-4 w-4" />
        </SheetClose>

        <div className="flex h-full min-h-0 flex-col">
          <SheetTitle className="sr-only">Hồ sơ Lead {lead.name}</SheetTitle>
          
          {/* Header */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-base text-slate-950 font-bold" style={{ fontWeight: 700 }}>Chi tiết khách hàng tiềm năng (Lead)</h2>
          </div>

          {/* Profile overview card (Summary Card) */}
          <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[26px] leading-8 text-slate-950 font-extrabold" style={{ fontWeight: 750 }}>{lead.name}</h3>
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" />
              <span className="text-sm text-slate-600">Khách hàng tiềm năng</span>
              <Badge variant="outline" className={`ml-2 h-6 text-xs font-semibold ${statusConfig[lead.status]}`}>
                {lead.status}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span>ID Lead: <span className="text-slate-800" style={{ fontWeight: 650 }}>{lead.id}</span></span>
              <span className="text-slate-300">•</span>
              <span>Ngày tham gia: <span className="text-slate-800" style={{ fontWeight: 650 }}>{lead.createDate}</span></span>
              <span className="text-slate-300">•</span>
              <span>Cập nhật lần cuối: <span className="text-slate-800" style={{ fontWeight: 650 }}>{lead.createDate}</span></span>
            </div>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1 overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <aside className="w-[300px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-5">
              <div className="aspect-[1.04] w-full overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80"
                  alt={`Ảnh đại diện ${lead.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {sidebarRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.1fr)] items-center gap-3 py-2.5 text-sm">
                    <p className="text-slate-500">{row.label}</p>
                    <div className="flex min-w-0 items-center justify-end gap-2">
                      <p className="min-w-0 truncate text-right text-slate-950 font-normal">
                        {row.value}
                      </p>
                      {row.copyable && (
                        <button
                          type="button"
                          className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            copiedField === row.label
                              ? "bg-emerald-50 text-emerald-600"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          aria-label={`${copiedField === row.label ? "Đã sao chép" : "Sao chép"} ${row.label.toLowerCase()}`}
                          title={`${copiedField === row.label ? "Đã sao chép" : "Sao chép"} ${row.label.toLowerCase()}`}
                          onClick={() => copyToClipboard(row.label, row.value)}
                        >
                          {copiedField === row.label ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span aria-hidden="true" className="relative block h-4 w-4">
                              <span className="absolute left-1 top-0 h-3 w-3 rounded-[2px] border border-current bg-white" />
                              <span className="absolute left-0 top-1 h-3 w-3 rounded-[2px] border border-current bg-white" />
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Content panel */}
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
              {/* Tab Navigation */}
              <div className="border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex h-10 w-full items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
                  {leadDetailTabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        className={`h-8 shrink-0 rounded-md px-3.5 text-sm transition-colors ${
                          isActive ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                        }`}
                        onClick={() => setActiveTab(tab.value)}
                        style={{ fontWeight: isActive ? 650 : 500 }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="min-h-0 flex-1 overflow-y-auto">
                <LeadTabContent activeTab={activeTab} lead={lead} onUpdateLead={onUpdateLead} />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-6">
            <SheetClose asChild>
              <Button variant="outline" className="h-9 rounded-lg border-slate-200 px-4 text-sm text-slate-700 shadow-sm">
                Đóng
              </Button>
            </SheetClose>
            <Button
              className="h-9 rounded-lg bg-black px-4 text-sm text-white hover:bg-slate-800"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("lead-edit-requested", { detail: lead }));
              }}
            >
              Chỉnh sửa
            </Button>
            {lead.status === "Ký HĐMB" && (
              <Button
                onClick={() => onConvert(lead)}
                className="h-9 rounded-lg bg-emerald-600 text-sm text-white hover:bg-emerald-700 px-4 font-bold shadow-sm"
              >
                Chuyển thành Khách hàng
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LeadTabContent({ activeTab, lead, onUpdateLead }: { activeTab: LeadDetailTab; lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  switch (activeTab) {
    case "overview":
      return <LeadOverviewTab lead={lead} />;
    case "chat":
      return <LeadChatTab lead={lead} onUpdateLead={onUpdateLead} />;
    case "tasks":
      return <LeadTasksTab lead={lead} onUpdateLead={onUpdateLead} />;
    case "files":
      return <LeadFilesTab lead={lead} onUpdateLead={onUpdateLead} />;
    case "notes":
      return <LeadNotesTab lead={lead} onUpdateLead={onUpdateLead} />;
    case "timeline":
      return <LeadTimelineTab lead={lead} onUpdateLead={onUpdateLead} />;
    default:
      return null;
  }
}

function LeadOverviewTab({ lead }: { lead: Lead }) {
  const empty = "Chưa cập nhật";
  const rows = [
    { label: "Trạng thái Pipeline", value: lead.status || empty },
    { label: "Nguồn đăng ký", value: lead.source || empty },
    { label: "Giới tính", value: lead.gender || empty },
    { label: "Ngày sinh", value: lead.dob || empty },
    { label: "Nghề nghiệp", value: lead.job || empty },
    { label: "Nhân viên phụ trách", value: lead.salesperson || empty },
    { label: "Địa chỉ", value: lead.address || empty },
    { label: "Ghi chú ban đầu", value: lead.careNote || empty },
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

function SendChatDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
}) {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!msg.trim()) {
      setError("Vui lòng nhập nội dung tin nhắn");
      return;
    }
    onSave(msg.trim());
    setMsg("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Gửi tin nhắn</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">Gửi tin nhắn tư vấn mới đến khách hàng tiềm năng</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nội dung tin nhắn <span className="text-red-500">*</span></label>
            <Input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="VD: Tiến độ bàn giao căn hộ..."
              className="h-9 text-xs"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Gửi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadChatTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddChatOpen, setIsAddChatOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const data = useMemo(() => {
    return lead.chats.map((c, i) => {
      const source = c.sender === "Khách" ? (i % 2 === 0 ? "Facebook" : "Zalo") : (i % 2 === 0 ? "Zalo" : "Website");
      const time = `10:${i < 10 ? `0${i}` : i} 01/06/2026`;
      return {
        time,
        source,
        content: c.message
      };
    });
  }, [lead.chats]);

  const baselineDate = new Date(2026, 5, 25, 23, 59, 59);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchesSearch =
          item.content.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query) ||
          item.time.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      const itemDate = parseDateString(item.time);
      if (timeFilter === "7") {
        const sevenDaysAgo = new Date(baselineDate);
        sevenDaysAgo.setDate(baselineDate.getDate() - 7);
        if (itemDate < sevenDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "30") {
        const thirtyDaysAgo = new Date(baselineDate);
        thirtyDaysAgo.setDate(baselineDate.getDate() - 30);
        if (itemDate < thirtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "60") {
        const sixtyDaysAgo = new Date(baselineDate);
        sixtyDaysAgo.setDate(baselineDate.getDate() - 60);
        if (itemDate < sixtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "custom" && dateRange?.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.to ? new Date(dateRange.to) : new Date(start);
        end.setHours(23, 59, 59, 999);
        if (itemDate < start || itemDate > end) return false;
      }

      if (sourceFilter !== "all" && item.source !== sourceFilter) {
        return false;
      }
      return true;
    });
  }, [search, timeFilter, dateRange, sourceFilter, data]);

  const handleSendChat = (message: string) => {
    const newChat: LeadChat = {
      sender: "Nhân viên",
      message: message
    };
    onUpdateLead({
      ...lead,
      chats: [...lead.chats, newChat]
    });
    setIsAddChatOpen(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3">
          <div className="grid min-w-0 grid-cols-[1fr_130px_120px] items-center gap-2">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm kiếm lịch sử chat"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Popover open={isCalendarOpen} onOpenChange={(open) => {
              setIsCalendarOpen(open);
              if (!open && timeFilter === "custom" && !dateRange) {
                setTimeFilter("all");
              }
            }}>
              <PopoverTrigger asChild>
                <div className="w-full">
                  <Select
                    value={timeFilter}
                    onValueChange={(val) => {
                      setTimeFilter(val);
                      if (val === "custom") {
                        setTempRange(dateRange);
                        setIsCalendarOpen(true);
                      } else {
                        setDateRange(undefined);
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo thời gian" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full truncate">
                      <SelectValue placeholder="Thời gian">
                        {timeFilter === "7" ? "7 ngày" :
                         timeFilter === "30" ? "30 ngày" :
                         timeFilter === "60" ? "60 ngày" :
                         timeFilter === "custom" && dateRange?.from ? 
                           `${format(dateRange.from, "dd/MM")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM")}` : ""}` :
                           "Thời gian"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Thời gian</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="30">30 ngày</SelectItem>
                      <SelectItem value="60">60 ngày</SelectItem>
                      <SelectItem value="custom">Khoảng thời gian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(2026, 5)}
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-white">
                  <span className="text-xs text-slate-500 font-medium">
                    {tempRange?.from ? format(tempRange.from, "MM/dd/yyyy") : ""}
                    {tempRange?.to ? ` - ${format(tempRange.to, "MM/dd/yyyy")}` : ""}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" className="h-7 text-xs px-2.5" onClick={() => {
                      setIsCalendarOpen(false);
                      if (!dateRange) setTimeFilter("all");
                    }}>Cancel</Button>
                    <Button className="h-7 text-xs px-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium rounded-md" onClick={() => {
                      setDateRange(tempRange);
                      setIsCalendarOpen(false);
                    }}>Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger aria-label="Lọc theo nguồn" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full">
                <SelectValue placeholder="Nguồn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Nguồn</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="Zalo">Zalo</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Hotline">Hotline</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 w-[260px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Thời gian</th>
                <th className="h-10 w-[180px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Nguồn</th>
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Nội dung</th>
                <th className="h-10 w-[120px] border-b border-[#E5EAF3] px-3 py-2 text-center align-middle text-xs font-bold text-slate-800">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-bold">{item.time}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-medium">
                    <Badge variant="outline" className={`${leadBadgeClass} ${customerSourceClass[item.source] ?? "bg-slate-50 text-slate-700 ring-slate-200"}`} style={{ fontWeight: 650 }}>
                      {item.source}
                    </Badge>
                  </td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-750 font-semibold max-w-[400px] truncate">{item.content}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-center align-middle">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            onClick={() => setIsChatOpen(true)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Xem lịch sử chat</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-400">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="flex h-12 items-center justify-between border-t border-[#E5EAF3] bg-white px-4 text-xs text-slate-500">
          <div>Hiển thị {filteredData.length} / {data.length} dòng</div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {filteredData.length > 0 ? `1–${filteredData.length}` : "0–0"} of {filteredData.length > 0 ? data.length : 0}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-slate-50">
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200 bg-white">
            <DialogTitle className="text-base font-bold text-slate-900">
              Chi tiết hội thoại
            </DialogTitle>
          </DialogHeader>
          <div className="p-5 h-[350px] overflow-y-auto space-y-4">
            {lead.chats.map((c, i) => {
              const isStaff = c.sender === "Nhân viên";
              return (
                <div key={i} className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${isStaff ? "text-blue-500" : "text-slate-400"}`}>
                    {c.sender}
                  </span>
                  <div className={`rounded-lg px-3 py-2 text-xs shadow-sm max-w-[80%] ${isStaff ? "bg-blue-600 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                    {c.message}
                  </div>
                </div>
              );
            })}
            {lead.chats.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">Chưa có cuộc trò chuyện nào.</div>
            )}
          </div>
          <div className="border-t border-slate-200 bg-white px-6 py-4 flex justify-end">
            <Button variant="outline" onClick={() => setIsChatOpen(false)} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SendChatDialog open={isAddChatOpen} onClose={() => setIsAddChatOpen(false)} onSave={handleSendChat} />
    </div>
  );
}

function AddLeadTaskDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, dueDate: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!title.trim() || !dueDate) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSave(title.trim(), dueDate);
    setTitle("");
    setDueDate("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Thêm công việc</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">Giao công việc chăm sóc khách hàng tiềm năng mới</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nội dung công việc <span className="text-red-500">*</span></label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Gửi tài liệu hợp đồng..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Hạn hoàn thành <span className="text-red-500">*</span></label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-xs bg-white" />
          </div>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadTasksTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddTask = (title: string, dueDate: string) => {
    const newTask: LeadTask = {
      id: `task-${Date.now()}`,
      title: title,
      dueDate: dueDate.split("-").reverse().join("/"),
      status: "Chưa hoàn thành"
    };
    onUpdateLead({
      ...lead,
      tasks: [...lead.tasks, newTask]
    });
    setIsAddOpen(false);
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = lead.tasks.map((t) =>
      t.id === taskId ? { ...t, status: (t.status === "Hoàn thành" ? "Chưa hoàn thành" : "Hoàn thành") as "Hoàn thành" | "Chưa hoàn thành" } : t
    );
    onUpdateLead({ ...lead, tasks: updatedTasks });
  };

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Action Panel / Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">Danh sách công việc</div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 gap-1.5 bg-black text-white hover:bg-slate-800 text-xs px-3 rounded-lg font-medium shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm công việc
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Công việc</th>
                <th className="h-10 w-32 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Hạn chót</th>
                <th className="h-10 w-36 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {lead.tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-bold">{t.title}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{t.dueDate}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2">
                    <Select
                      value={t.status}
                      onValueChange={(val) => {
                        const updatedTasks = lead.tasks.map((task) =>
                          task.id === t.id ? { ...task, status: val as "Hoàn thành" | "Chưa hoàn thành" } : task
                        );
                        onUpdateLead({ ...lead, tasks: updatedTasks });
                      }}
                    >
                      <SelectTrigger className={`h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 w-fit gap-1 shadow-none focus:ring-0 [&_svg]:size-3 ${
                        t.status === "Hoàn thành" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`} style={{ fontWeight: 650 }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chưa hoàn thành">Chưa hoàn thành</SelectItem>
                        <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {lead.tasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-400">Không có công việc nào cần xử lý.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadTaskDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddTask} />
    </div>
  );
}

function AddLeadProposalDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (productName: string, price: string) => void;
}) {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!productName.trim() || !price) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSave(productName.trim(), price);
    setProductName("");
    setPrice("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Thêm đề xuất</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">Đề xuất sản phẩm/căn hộ bán hàng mới</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Sản phẩm đề xuất <span className="text-red-500">*</span></label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="VD: Căn hộ The Sun Avenue A1.12" className="h-9 text-xs" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Giá chào (VNĐ) <span className="text-red-500">*</span></label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="VD: 4.500.000.000" className="h-9 text-xs" />
          </div>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadProposalsTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddProp = (productName: string, price: string) => {
    const newProp: LeadProposal = {
      productName: productName,
      price: price.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ",
      date: new Date().toLocaleDateString("vi-VN")
    };
    onUpdateLead({
      ...lead,
      proposals: [...lead.proposals, newProp]
    });
    setIsAddOpen(false);
  };

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Action Panel / Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">Danh sách sản phẩm chào bán</div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 gap-1.5 bg-black text-white hover:bg-slate-800 text-xs px-3 rounded-lg font-medium shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm đề xuất
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Sản phẩm</th>
                <th className="h-10 w-36 border-b border-r border-[#E5EAF3] px-3 py-2 text-right align-middle text-xs font-bold text-slate-800">Giá đề xuất</th>
                <th className="h-10 w-32 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {lead.proposals.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 font-bold text-slate-800">{p.productName}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-right font-bold text-slate-900">{p.price}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{p.date}</td>
                </tr>
              ))}
              {lead.proposals.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">Chưa có đề xuất sản phẩm nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadProposalDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddProp} />
    </div>
  );
}

function AddLeadFileDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (fileName: string, fileSize: string) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setDisplayName(file.name);
      setError("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setDisplayName(file.name);
      setError("");
    }
  };

  const handleSave = () => {
    if (!selectedFile) {
      setError("Vui lòng chọn hoặc kéo thả tài liệu để tải lên");
      return;
    }
    const name = displayName.trim() || selectedFile.name;
    const sizeKB = `${Math.round(selectedFile.size / 1024)} KB`;
    onSave(name, sizeKB);
    setSelectedFile(null);
    setDisplayName("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Tải lên tài liệu</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">Đính kèm file tài liệu, hồ sơ mới từ máy tính của bạn</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5 ${
              dragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-400 bg-slate-50/50"
            }`}
          >
            <UploadCloud className={`h-8 w-8 ${dragActive ? "text-blue-500" : "text-slate-400"}`} />
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-900 max-w-[300px] truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-500">{Math.round(selectedFile.size / 1024)} KB</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">Nhấp để chọn file hoặc kéo thả vào đây</p>
                <p className="text-[10px] text-slate-400">Hỗ trợ PDF, DOCX, PNG, JPG... tối đa 25MB</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Tên hiển thị tài liệu <span className="text-red-500">*</span></label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="VD: CCCD_mat_truoc"
                className="h-9 text-xs"
              />
            </div>
          )}
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Tải lên</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadFilesTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddFile = (fileName: string, fileSize: string) => {
    const newFile: LeadFile = {
      name: fileName.endsWith(".pdf") || fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".docx") ? fileName : `${fileName}.pdf`,
      size: fileSize,
      date: new Date().toLocaleDateString("vi-VN")
    };
    onUpdateLead({
      ...lead,
      files: [...lead.files, newFile]
    });
    setIsAddOpen(false);
  };

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Action Panel / Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">Tài liệu, hồ sơ liên quan</div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 gap-1.5 bg-black text-white hover:bg-slate-800 text-xs px-3 rounded-lg font-medium shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tải lên tài liệu
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Tên file</th>
                <th className="h-10 w-28 border-b border-r border-[#E5EAF3] px-3 py-2 text-right align-middle text-xs font-bold text-slate-800">Dung lượng</th>
                <th className="h-10 w-36 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Người upload</th>
                <th className="h-10 w-32 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Ngày upload</th>
                <th className="h-10 w-24 border-b border-[#E5EAF3] px-3 py-2 text-center align-middle text-xs font-bold text-slate-800">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lead.files.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    {f.name}
                  </td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-right text-slate-850 font-bold">{f.size}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{lead.salesperson}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-500 font-semibold">{f.date}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-center align-middle">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-md"
                      onClick={() => alert(`Đang tải xuống tài liệu: ${f.name}`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {lead.files.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">Không có tài liệu đính kèm.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadFileDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddFile} />
    </div>
  );
}

function AddLeadNoteDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung ghi chú");
      return;
    }
    onSave(content.trim());
    setContent("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200">
          <DialogTitle className="text-base font-bold text-slate-900">Thêm ghi chú</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">Lưu trữ nhật ký, kết quả chăm sóc mới</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Nội dung ghi chú chăm sóc <span className="text-red-500">*</span></label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="VD: Khách hàng đồng ý hẹn gặp tham quan sa bàn..."
              className="min-h-24 text-xs resize-none"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">Hủy</Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadNotesTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [notesList, setNotesList] = useState<Array<{ content: string; author: string; date: string }>>(() => {
    return [
      { content: lead.careNote || "Chưa có ghi chú chăm sóc", author: lead.salesperson, date: lead.createDate }
    ];
  });

  const handleAddNote = (content: string) => {
    const item = {
      content: content,
      author: lead.salesperson,
      date: new Date().toLocaleDateString("vi-VN")
    };
    const updatedNotes = [item, ...notesList];
    setNotesList(updatedNotes);
    onUpdateLead({
      ...lead,
      careNote: content
    });
    setIsAddOpen(false);
  };

  return (
    <div className="p-5">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Action Panel / Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">Lịch sử ghi chú chăm sóc</div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 gap-1.5 bg-black text-white hover:bg-slate-800 text-xs px-3 rounded-lg font-medium shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm ghi chú
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Nội dung ghi chú</th>
                <th className="h-10 w-44 border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Người tạo</th>
                <th className="h-10 w-36 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {notesList.map((n, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-700 font-semibold">{n.content}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{n.author}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-500 font-semibold">{n.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadNoteDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddNote} />
    </div>
  );
}

const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split(" ");
  const dateParts = parts[1].split("/");
  const day = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const year = parseInt(dateParts[2], 10);
  const timeParts = parts[0].split(":");
  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);
  return new Date(year, month, day, hour, minute);
};

function AddTimelineDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (dateTime: string, note: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("09:00");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [isCalendarPopoverOpen, setIsCalendarPopoverOpen] = useState(false);

  const handleSave = () => {
    if (!selectedDate || !note.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    const formattedDate = format(selectedDate, "dd/MM/yyyy");
    const formattedDateTime = `${time} ${formattedDate}`;

    onSave(formattedDateTime, note);
    setSelectedDate(undefined);
    setTime("09:00");
    setNote("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl bg-white">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-200/80">
          <DialogTitle className="text-base font-bold text-slate-900">
            Thêm nhật ký
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Ghi nhận thủ công hoạt động mới của khách hàng tiềm năng
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-600 font-medium">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Ngày <span className="text-red-500">*</span>
              </label>
              
              <Popover open={isCalendarPopoverOpen} onOpenChange={setIsCalendarPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white px-3 py-1.5 text-xs text-slate-800 justify-between items-center outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <span className={selectedDate ? "text-slate-800" : "text-slate-400"}>
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
                    </span>
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 animate-in fade-in zoom-in-95 duration-100" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                      setIsCalendarPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Giờ <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:00"
                  className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white pl-3 pr-8 text-xs text-slate-800 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
                <Clock className="absolute right-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Ghi chú <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Gọi điện tư vấn, Gửi báo giá..."
              className="min-h-24 text-xs resize-none"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-9 rounded-lg border-slate-200 text-sm text-slate-700 shadow-sm w-20">
            Hủy
          </Button>
          <Button onClick={handleSave} className="h-9 rounded-lg bg-black text-sm text-white hover:bg-slate-800 shadow-sm px-4">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeadTimelineTab({ lead, onUpdateLead }: { lead: Lead; onUpdateLead: (updated: Lead) => void }) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const baselineDate = new Date(2026, 5, 25, 23, 59, 59);

  const filteredData = useMemo(() => {
    return lead.timeline.filter((item) => {
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const matchesSearch =
          item.content.toLowerCase().includes(query) ||
          item.date.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      const itemDate = parseDateString(item.date);
      if (timeFilter === "7") {
        const sevenDaysAgo = new Date(baselineDate);
        sevenDaysAgo.setDate(baselineDate.getDate() - 7);
        if (itemDate < sevenDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "30") {
        const thirtyDaysAgo = new Date(baselineDate);
        thirtyDaysAgo.setDate(baselineDate.getDate() - 30);
        if (itemDate < thirtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "60") {
        const sixtyDaysAgo = new Date(baselineDate);
        sixtyDaysAgo.setDate(baselineDate.getDate() - 60);
        if (itemDate < sixtyDaysAgo || itemDate > baselineDate) return false;
      } else if (timeFilter === "custom" && dateRange?.from) {
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = dateRange.to ? new Date(dateRange.to) : new Date(start);
        end.setHours(23, 59, 59, 999);
        if (itemDate < start || itemDate > end) return false;
      }

      return true;
    });
  }, [search, timeFilter, dateRange, lead.timeline]);

  const handleAddTimeline = (dateTime: string, note: string) => {
    const newEntry: LeadTimeline = {
      date: dateTime,
      type: "Nhật ký",
      content: note
    };
    onUpdateLead({
      ...lead,
      timeline: [newEntry, ...lead.timeline]
    });
    setIsAddOpen(false);
  };

  return (
    <div className="p-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-[#E5EAF3] bg-white px-3 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-1 min-w-0 items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                aria-label="Tìm kiếm nhật ký khách hàng tiềm năng"
                className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <Popover open={isCalendarOpen} onOpenChange={(open) => {
              setIsCalendarOpen(open);
              if (!open && timeFilter === "custom" && !dateRange) {
                setTimeFilter("all");
              }
            }}>
              <PopoverTrigger asChild>
                <div className="w-[150px] shrink-0">
                  <Select
                    value={timeFilter}
                    onValueChange={(val) => {
                      setTimeFilter(val);
                      if (val === "custom") {
                        setTempRange(dateRange);
                        setIsCalendarOpen(true);
                      } else {
                        setDateRange(undefined);
                      }
                    }}
                  >
                    <SelectTrigger aria-label="Lọc theo thời gian" className="h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none w-full truncate">
                      <SelectValue placeholder="Thời gian">
                        {timeFilter === "7" ? "7 ngày" :
                         timeFilter === "30" ? "30 ngày" :
                         timeFilter === "60" ? "60 ngày" :
                         timeFilter === "custom" && dateRange?.from ? 
                           `${format(dateRange.from, "dd/MM")}${dateRange.to ? ` - ${format(dateRange.to, "dd/MM")}` : ""}` :
                           "Thời gian"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Thời gian</SelectItem>
                      <SelectItem value="7">7 ngày</SelectItem>
                      <SelectItem value="30">30 ngày</SelectItem>
                      <SelectItem value="60">60 ngày</SelectItem>
                      <SelectItem value="custom">Khoảng thời gian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={new Date(2026, 5)}
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t border-slate-100 p-3 bg-white">
                  <span className="text-xs text-slate-500 font-medium">
                    {tempRange?.from ? format(tempRange.from, "MM/dd/yyyy") : ""}
                    {tempRange?.to ? ` - ${format(tempRange.to, "MM/dd/yyyy")}` : ""}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" className="h-7 text-xs px-2.5" onClick={() => {
                      setIsCalendarOpen(false);
                      if (!dateRange) setTimeFilter("all");
                    }}>Cancel</Button>
                    <Button className="h-7 text-xs px-2.5 bg-[#0f62fe] hover:bg-[#0353e9] text-white font-medium rounded-md" onClick={() => {
                      setDateRange(tempRange);
                      setIsCalendarOpen(false);
                    }}>Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-9 gap-1.5 bg-black text-white hover:bg-slate-800 text-xs px-3 rounded-lg font-medium shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Thêm nhật ký
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="h-10 w-[180px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Thời gian</th>
                <th className="h-10 w-[180px] border-b border-r border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Người thực hiện</th>
                <th className="h-10 border-b border-[#E5EAF3] px-3 py-2 text-left align-middle text-xs font-bold text-slate-800">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-800 font-bold">{item.date}</td>
                  <td className="h-11 border-b border-r border-[#E5EAF3] px-3 py-2 text-slate-600 font-semibold">{item.type === "Hệ thống" ? "Hệ thống" : lead.salesperson}</td>
                  <td className="h-11 border-b border-[#E5EAF3] px-3 py-2 text-slate-700 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{item.content}</span>
                      {item.type === "Nhật ký" && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100 shadow-sm leading-4">
                          Manual
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination */}
        <div className="flex h-12 items-center justify-between border-t border-[#E5EAF3] bg-white px-4 text-xs text-slate-500">
          <div>Hiển thị {filteredData.length} / {lead.timeline.length} dòng</div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              {filteredData.length > 0 ? `1–${filteredData.length}` : "0–0"} of {filteredData.length > 0 ? lead.timeline.length : 0}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>‹</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40" disabled>›</Button>
            </div>
          </div>
        </div>
      </div>

      <AddTimelineDialog open={isAddOpen} onClose={() => setIsAddOpen(false)} onSave={handleAddTimeline} />
    </div>
  );
}
