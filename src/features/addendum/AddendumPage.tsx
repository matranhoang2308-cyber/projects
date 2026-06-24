import { useState, useMemo } from "react";
import {
  Plus, FileText, Clock, CheckCircle2, AlertCircle, Edit3, Eye,
  Download, Upload, RefreshCw, Layers, RotateCcw, Send,
  ChevronLeft, ChevronRight, X, Check,
  Banknote, Calendar, UserCheck, Scale, FileX, BookOpen,
  AlertTriangle, ReceiptText, Search, Tag, BadgePercent,
  UserMinus, Landmark, Shield, ArrowLeftRight, StickyNote,
  ThumbsUp, ThumbsDown, MessageSquare,
  ArrowUpRight, ArrowDownLeft, User, Building2, Hash,
  Pencil, CornerDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils";

// ─── Template definitions ─────────────────────────────────────────────────────
const templates = [
  // Tài chính
  { id: "T01", name: "Điều chỉnh giá",          desc: "Điều chỉnh giá trị HĐ do biến động thị trường",    category: "Tài chính", icon: Banknote,      color: "text-emerald-600", bg: "bg-emerald-50", usages: 42 },
  { id: "T04", name: "Điều chỉnh thanh toán",   desc: "Thay đổi phương thức và lịch thanh toán",           category: "Tài chính", icon: ReceiptText,   color: "text-violet-600",  bg: "bg-violet-50",  usages: 27 },
  { id: "T07", name: "Điều chỉnh chiết khấu",   desc: "Cập nhật tỷ lệ chiết khấu theo chính sách mới",    category: "Tài chính", icon: BadgePercent,  color: "text-teal-600",    bg: "bg-teal-50",    usages: 19 },
  { id: "T08", name: "Hoàn tiền đặt cọc",       desc: "Thủ tục hoàn trả tiền đặt cọc khi hủy HĐ",         category: "Tài chính", icon: Banknote,      color: "text-orange-600",  bg: "bg-orange-50",  usages: 8  },
  { id: "T09", name: "Điều chỉnh phí bảo trì",  desc: "Cập nhật mức phí bảo trì/quản lý căn hộ",          category: "Tài chính", icon: Landmark,      color: "text-cyan-600",    bg: "bg-cyan-50",    usages: 11 },
  // Thời hạn
  { id: "T02", name: "Gia hạn thời gian",        desc: "Gia hạn bàn giao hoặc thời hạn thực hiện HĐ",     category: "Thời hạn",  icon: Calendar,      color: "text-blue-600",    bg: "bg-blue-50",    usages: 31 },
  { id: "T10", name: "Rút ngắn bàn giao",        desc: "Điều chỉnh ngày bàn giao sớm hơn kế hoạch",       category: "Thời hạn",  icon: ChevronLeft,   color: "text-sky-600",     bg: "bg-sky-50",     usages: 5  },
  { id: "T11", name: "Gia hạn đợt thanh toán",   desc: "Gia hạn ngày đến hạn của một đợt thanh toán cụ thể", category: "Thời hạn", icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50",   usages: 23 },
  // Thông tin
  { id: "T03", name: "Thay đổi bên mua",         desc: "Chuyển nhượng hoặc thay đổi thông tin bên mua",   category: "Thông tin", icon: UserCheck,     color: "text-indigo-600",  bg: "bg-indigo-50",  usages: 18 },
  { id: "T12", name: "Cập nhật thông tin CĐT",   desc: "Sửa CCCD, địa chỉ, thông tin liên hệ khách hàng", category: "Thông tin", icon: User,          color: "text-pink-600",    bg: "bg-pink-50",    usages: 14 },
  { id: "T13", name: "Thêm đồng sở hữu",         desc: "Bổ sung người đồng sở hữu vào hợp đồng",          category: "Thông tin", icon: UserMinus,     color: "text-fuchsia-600", bg: "bg-fuchsia-50", usages: 7  },
  // Pháp lý
  { id: "T05", name: "Chấm dứt hợp đồng",        desc: "Thỏa thuận chấm dứt và giải quyết tranh chấp",    category: "Pháp lý",   icon: FileX,         color: "text-red-600",     bg: "bg-red-50",     usages: 9  },
  { id: "T06", name: "Bổ sung điều khoản",        desc: "Bổ sung các điều khoản mới theo thỏa thuận",      category: "Pháp lý",   icon: BookOpen,      color: "text-slate-600",   bg: "bg-slate-50",   usages: 15 },
  { id: "T14", name: "Giải quyết tranh chấp",     desc: "Điều chỉnh phương thức giải quyết tranh chấp",    category: "Pháp lý",   icon: Scale,         color: "text-rose-600",    bg: "bg-rose-50",    usages: 4  },
  { id: "T15", name: "Chuyển nhượng HĐ",          desc: "Chuyển nhượng toàn bộ quyền và nghĩa vụ HĐ",      category: "Pháp lý",   icon: ArrowLeftRight,color: "text-purple-600",  bg: "bg-purple-50",  usages: 12 },
  { id: "T16", name: "Cam kết bổ sung",            desc: "Ghi nhận các cam kết phát sinh ngoài HĐ gốc",     category: "Pháp lý",   icon: Shield,        color: "text-lime-600",    bg: "bg-lime-50",    usages: 6  },
  // Khác
  { id: "T17", name: "Ghi chú & bổ sung",          desc: "Bổ sung ghi chú, thông tin tham chiếu cho HĐ",   category: "Khác",      icon: StickyNote,    color: "text-stone-600",   bg: "bg-stone-50",   usages: 3  },
  { id: "T18", name: "Tag / Phân loại HĐ",          desc: "Gắn nhãn phân loại để theo dõi theo nhóm",       category: "Khác",      icon: Tag,           color: "text-gray-600",    bg: "bg-gray-50",    usages: 22 },
];

const contractOptions = [
  { value: "HĐ-2026-148", label: "HĐ-2026-148", customer: "Nguyễn Văn Bình",   property: "Căn hộ A1-0812",    value_str: "2,400,000,000đ", status: "Đang ký"    },
  { value: "HĐ-2026-147", label: "HĐ-2026-147", customer: "Lê Thị Cẩm",       property: "Biệt thự B2-05",    value_str: "8,100,000,000đ", status: "Đã ký"      },
  { value: "HĐ-2026-146", label: "HĐ-2026-146", customer: "Trần Hữu Dũng",     property: "Shophouse C-11",    value_str: "3,600,000,000đ", status: "Công chứng" },
  { value: "HĐ-2026-145", label: "HĐ-2026-145", customer: "Phan Thị Giang",    property: "Căn hộ A2-1104",   value_str: "1,900,000,000đ", status: "Đã ký"      },
  { value: "HĐ-2026-143", label: "HĐ-2026-143", customer: "Đỗ Thị Hồng",      property: "Studio B1-0203",    value_str: "420,000,000đ",   status: "Đang ký"    },
  { value: "HĐ-2026-141", label: "HĐ-2026-141", customer: "Võ Minh Tuấn",      property: "Căn hộ A3-2201",   value_str: "2,950,000,000đ", status: "Đã ký"      },
  { value: "HĐ-2026-139", label: "HĐ-2026-139", customer: "Hoàng Thị Lan",     property: "Biệt thự B1-02",    value_str: "9,500,000,000đ", status: "Công chứng" },
  { value: "HĐ-2026-137", label: "HĐ-2026-137", customer: "Phạm Quốc Hùng",    property: "Shophouse D-04",    value_str: "4,200,000,000đ", status: "Đang ký"    },
  { value: "HĐ-2026-135", label: "HĐ-2026-135", customer: "Nguyễn Thị Mai",    property: "Căn hộ C2-0905",   value_str: "1,750,000,000đ", status: "Đã ký"      },
  { value: "HĐ-2026-132", label: "HĐ-2026-132", customer: "Bùi Đức Thắng",     property: "Penthouse A-3801",  value_str: "15,600,000,000đ",status: "Công chứng" },
  { value: "HĐ-2026-129", label: "HĐ-2026-129", customer: "Trịnh Thanh Hà",    property: "Căn hộ B3-1407",   value_str: "2,100,000,000đ", status: "Đang ký"    },
  { value: "HĐ-2026-126", label: "HĐ-2026-126", customer: "Lý Văn Thành",      property: "Studio A1-0401",    value_str: "650,000,000đ",   status: "Đã ký"      },
  { value: "HĐ-2025-118", label: "HĐ-2025-118", customer: "Dương Thị Ngọc",    property: "Biệt thự C3-07",    value_str: "7,800,000,000đ", status: "Công chứng" },
  { value: "HĐ-2025-112", label: "HĐ-2025-112", customer: "Cao Minh Đức",      property: "Căn hộ D1-1602",   value_str: "2,280,000,000đ", status: "Đã ký"      },
  { value: "HĐ-2025-105", label: "HĐ-2025-105", customer: "Phan Hoàng Anh",    property: "Shophouse B-08",    value_str: "3,900,000,000đ", status: "Đã ký"      },
];

// ─── Audit log (page-level) ───────────────────────────────────────────────────
const auditLog = [
  { id: 1, user: "Trần Minh Khoa",   avatar: "TK", action: "Tạo phụ lục",  detail: "PL-01 Điều chỉnh giá: 2,400,000,000 → 2,520,000,000 VNĐ",       contract: "HĐ-2026-148", time: "14/04/2026 · 09:32", type: "create"  },
  { id: 2, user: "Nguyễn Thị Hương", avatar: "NH", action: "Phê duyệt",    detail: "Đã phê duyệt PL-01 Điều chỉnh giá",                              contract: "HĐ-2026-148", time: "14/04/2026 · 10:15", type: "approve" },
  { id: 3, user: "Hệ thống",         avatar: "SY", action: "Đồng bộ",      detail: "Tự động đồng bộ dữ liệu sang module Công nợ & Thanh toán",        contract: "HĐ-2026-148", time: "14/04/2026 · 10:16", type: "sync"    },
  { id: 4, user: "Lê Đức Anh",       avatar: "LA", action: "Tạo phụ lục",  detail: "PL-01 Gia hạn bàn giao: 30/06/2026 → 31/08/2026",               contract: "HĐ-2026-146", time: "12/04/2026 · 14:45", type: "create"  },
  { id: 5, user: "Phạm Thị Lan",     avatar: "PL", action: "Chỉnh sửa",    detail: "Cập nhật PL-02 – Thông tin bên mua",                             contract: "HĐ-2026-145", time: "11/04/2026 · 11:20", type: "edit"    },
  { id: 6, user: "Hệ thống",         avatar: "SY", action: "Đồng bộ",      detail: "Tự động đồng bộ dữ liệu sang module Công nợ & Thanh toán",        contract: "HĐ-2026-146", time: "12/04/2026 · 14:46", type: "sync"    },
  { id: 7, user: "Nguyễn Thị Hương", avatar: "NH", action: "Yêu cầu sửa", detail: "Yêu cầu bổ sung điều khoản phạt vi phạm vào PL-01",              contract: "HĐ-2026-146", time: "12/04/2026 · 16:00", type: "request" },
];

const actionCfg: Record<string, { color: string; bg: string }> = {
  create:  { color: "text-blue-700",    bg: "bg-blue-100"    },
  approve: { color: "text-emerald-700", bg: "bg-emerald-100" },
  sync:    { color: "text-indigo-700",  bg: "bg-indigo-100"  },
  edit:    { color: "text-amber-700",   bg: "bg-amber-100"   },
  request: { color: "text-orange-700",  bg: "bg-orange-100"  },
};

// ─── Addendum detail type + data ──────────────────────────────────────────────
type Approver = {
  name: string; avatar: string; role: string;
  status: "approved" | "pending" | "rejected" | "waiting";
  time?: string; comment?: string;
};
type AddendumItem = {
  id: string; contract: string; customer: string; property: string;
  contractValue: string; type: string; templateId: string; status: string;
  created: string; effectiveDate: string; by: string; byAvatar: string; byRole: string;
  changes: { label: string; before: string; after: string }[];
  approvers: Approver[];
  docs: { name: string; size: string; date: string }[];
  activity: { user: string; avatar: string; action: string; detail: string; time: string; type: string }[];
};

const addendumDetails: AddendumItem[] = [
  {
    id: "PL-148-01", contract: "HĐ-2026-148", customer: "Nguyễn Văn Bình",
    property: "Căn hộ A1-0812 – Vinhomes Ocean Park", contractValue: "2,400,000,000",
    type: "Điều chỉnh giá", templateId: "T01", status: "Chờ ký",
    created: "14/04/2026", effectiveDate: "20/04/2026",
    by: "Trần Minh Khoa", byAvatar: "TK", byRole: "Sales Executive",
    changes: [
      { label: "Giá trị hợp đồng", before: "2,400,000,000 VNĐ",  after: "2,520,000,000 VNĐ" },
      { label: "Lý do điều chỉnh", before: "—", after: "Biến động CPI Q1/2026 theo QĐ 15/2026/BXD" },
      { label: "Chênh lệch",       before: "—", after: "+120,000,000 VNĐ (+5%)" },
    ],
    approvers: [
      { name: "Nguyễn Thị Hương", avatar: "NH", role: "Trưởng phòng Legal",      status: "approved", time: "14/04/2026 · 10:15", comment: "Đã xác minh căn cứ pháp lý. Hợp lệ theo điều khoản điều chỉnh giá HĐ." },
      { name: "Lê Văn Tùng",      avatar: "LT", role: "Giám đốc Kinh doanh",    status: "pending"  },
      { name: "Nguyễn Văn Bình",  avatar: "NB", role: "Khách hàng (Bên B)",     status: "waiting"  },
    ],
    docs: [
      { name: "Phu-luc-01-dieu-chinh-gia.pdf",   size: "2.4 MB", date: "14/04/2026" },
      { name: "Bien-ban-thoa-thuan-gia.docx",    size: "0.8 MB", date: "14/04/2026" },
      { name: "QD-15-2026-BXD-tham-chieu.pdf",   size: "1.1 MB", date: "14/04/2026" },
    ],
    activity: [
      { user: "Trần Minh Khoa",   avatar: "TK", action: "Tạo phụ lục",   detail: "Khởi tạo phụ lục điều chỉnh giá từ mẫu T01",               time: "14/04/2026 · 09:32", type: "create"  },
      { user: "Trần Minh Khoa",   avatar: "TK", action: "Tải tài liệu",  detail: "Đính kèm 3 file tài liệu liên quan",                        time: "14/04/2026 · 09:45", type: "upload"  },
      { user: "Nguyễn Thị Hương", avatar: "NH", action: "Phê duyệt",     detail: "Đã phê duyệt – Xác minh căn cứ pháp lý hợp lệ",            time: "14/04/2026 · 10:15", type: "approve" },
      { user: "Hệ thống",         avatar: "SY", action: "Gửi thông báo", detail: "Gửi email thông báo cho GĐ Kinh doanh & Khách hàng",        time: "14/04/2026 · 10:16", type: "notify"  },
    ],
  },
  {
    id: "PL-146-01", contract: "HĐ-2026-146", customer: "Trần Hữu Dũng",
    property: "Shophouse C-11 – Grand Park", contractValue: "3,600,000,000",
    type: "Gia hạn thời gian", templateId: "T02", status: "Chờ phê duyệt",
    created: "12/04/2026", effectiveDate: "15/04/2026",
    by: "Lê Đức Anh", byAvatar: "LA", byRole: "Sales Senior",
    changes: [
      { label: "Ngày bàn giao cũ", before: "30/06/2026", after: "31/08/2026" },
      { label: "Số ngày gia hạn",  before: "—",           after: "62 ngày" },
      { label: "Lý do",            before: "—",           after: "Chậm tiến độ thi công do thời tiết & thiếu vật liệu" },
      { label: "Bồi thường",       before: "—",           after: "Hỗ trợ 5 triệu/tháng chi phí thuê nhà tạm" },
    ],
    approvers: [
      { name: "Nguyễn Thị Hương", avatar: "NH", role: "Trưởng phòng Legal",  status: "pending" },
      { name: "Trần Hữu Dũng",    avatar: "TD", role: "Khách hàng (Bên B)",  status: "waiting" },
    ],
    docs: [
      { name: "Phu-luc-01-gia-han.pdf",             size: "1.8 MB", date: "12/04/2026" },
      { name: "Bien-ban-hien-truong-thi-cong.pdf",  size: "3.2 MB", date: "10/04/2026" },
    ],
    activity: [
      { user: "Lê Đức Anh",       avatar: "LA", action: "Tạo phụ lục",   detail: "Khởi tạo phụ lục gia hạn thời gian từ mẫu T02",               time: "12/04/2026 · 14:45", type: "create"  },
      { user: "Nguyễn Thị Hương", avatar: "NH", action: "Yêu cầu sửa",  detail: "Cần bổ sung điều khoản phạt vi phạm tiến độ vào nội dung",    time: "12/04/2026 · 16:00", type: "request" },
      { user: "Lê Đức Anh",       avatar: "LA", action: "Cập nhật",      detail: "Đã bổ sung điều khoản phạt theo yêu cầu của Legal",           time: "13/04/2026 · 09:20", type: "edit"    },
    ],
  },
  {
    id: "PL-145-02", contract: "HĐ-2026-145", customer: "Phan Thị Giang",
    property: "Căn hộ A2-1104 – Masteri", contractValue: "1,900,000,000",
    type: "Thay đổi bên mua", templateId: "T03", status: "Đã ký",
    created: "11/04/2026", effectiveDate: "11/04/2026",
    by: "Phạm Thị Lan", byAvatar: "PL", byRole: "Sales Junior",
    changes: [
      { label: "Bên mua cũ",  before: "Phan Thị Giang – CCCD: 012345678901", after: "—" },
      { label: "Bên mua mới", before: "—",  after: "Ngô Minh Tuấn – CCCD: 038097001234" },
      { label: "SĐT mới",     before: "—",  after: "0918 765 432" },
      { label: "Lý do",       before: "—",  after: "Chuyển nhượng quyền mua cho người thân theo thỏa thuận gia đình" },
    ],
    approvers: [
      { name: "Nguyễn Thị Hương", avatar: "NH", role: "Trưởng phòng Legal",     status: "approved", time: "11/04/2026 · 14:30", comment: "Hồ sơ đầy đủ, pháp lý hợp lệ." },
      { name: "Lê Văn Tùng",      avatar: "LT", role: "Giám đốc Kinh doanh",   status: "approved", time: "11/04/2026 · 15:00", comment: "Đồng ý." },
      { name: "Phan Thị Giang",   avatar: "PG", role: "Bên mua cũ (Bên B)",    status: "approved", time: "11/04/2026 · 15:45" },
      { name: "Ngô Minh Tuấn",    avatar: "NT", role: "Bên mua mới (Bên B')",  status: "approved", time: "11/04/2026 · 16:00" },
    ],
    docs: [
      { name: "Phu-luc-02-doi-ben-mua.pdf",          size: "2.1 MB", date: "11/04/2026" },
      { name: "CCCD-Ngo-Minh-Tuan.pdf",              size: "0.5 MB", date: "11/04/2026" },
      { name: "Giay-uy-quyen-chuyen-nhuong.pdf",     size: "1.3 MB", date: "11/04/2026" },
    ],
    activity: [
      { user: "Phạm Thị Lan",     avatar: "PL", action: "Tạo phụ lục", detail: "Khởi tạo phụ lục thay đổi bên mua từ mẫu T03",     time: "11/04/2026 · 10:00", type: "create"  },
      { user: "Nguyễn Thị Hương", avatar: "NH", action: "Phê duyệt",   detail: "Legal xác nhận hồ sơ hợp lệ",                      time: "11/04/2026 · 14:30", type: "approve" },
      { user: "Lê Văn Tùng",      avatar: "LT", action: "Phê duyệt",   detail: "GĐ Kinh doanh ký duyệt",                           time: "11/04/2026 · 15:00", type: "approve" },
      { user: "Hệ thống",         avatar: "SY", action: "Đồng bộ",     detail: "Cập nhật thông tin bên mua trong hệ thống CRM",     time: "11/04/2026 · 16:05", type: "sync"    },
    ],
  },
];

// ─── Static list for table (derived from detail data) ────────────────────────
const pendingAddendums = addendumDetails.map(({ id, contract, type, status, created, by }) => ({
  id, contract, type, status, created, by,
}));

const pendingStatusCfg: Record<string, string> = {
  "Chờ ký":          "bg-amber-100 text-amber-700 border-amber-200",
  "Chờ phê duyệt":   "bg-blue-100 text-blue-700 border-blue-200",
  "Đã ký":           "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const contractStatusCfg: Record<string, string> = {
  "Đang ký":    "bg-blue-100 text-blue-700 border-blue-200",
  "Đã ký":      "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Công chứng": "bg-indigo-100 text-indigo-700 border-indigo-200",
};

// ─── Dialog stepper steps ─────────────────────────────────────────────────────
const dialogSteps = [
  { id: 1, label: "Chọn HĐ & Mẫu",       desc: "Xác định hợp đồng và loại phụ lục" },
  { id: 2, label: "Nội dung thay đổi",    desc: "Điền chi tiết điều chỉnh" },
  { id: 3, label: "Xác nhận & Gửi",       desc: "Kiểm tra và gửi phê duyệt" },
];

// ─── FF helper ────────────────────────────────────────────────────────────────
function FF({ label, required, children, className }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Template-specific dynamic fields ────────────────────────────────────────
function TemplateFields({ templateId, fields, onChange }: {
  templateId: string;
  fields: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  switch (templateId) {
    case "T01": return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FF label="Giá cũ (VNĐ)" required>
            <Input placeholder="2,400,000,000" value={fields.oldPrice || ""} onChange={e => onChange("oldPrice", e.target.value)} className="text-sm" />
          </FF>
          <FF label="Giá mới (VNĐ)" required>
            <Input placeholder="2,520,000,000" value={fields.newPrice || ""} onChange={e => onChange("newPrice", e.target.value)} className="text-sm" />
          </FF>
          <FF label="Chênh lệch" className="col-span-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {fields.oldPrice && fields.newPrice ? (() => {
                const diff = (parseFloat(fields.newPrice.replace(/\D/g, "")) || 0) - (parseFloat(fields.oldPrice.replace(/\D/g, "")) || 0);
                return <span className={diff >= 0 ? "text-emerald-600" : "text-red-600"}>{diff >= 0 ? "+" : ""}{diff.toLocaleString("vi")} VNĐ ({diff >= 0 ? "tăng" : "giảm"})</span>;
              })() : <span className="text-slate-400">Nhập giá cũ và giá mới để tính tự động</span>}
            </div>
          </FF>
        </div>
        <FF label="Lý do điều chỉnh giá" required>
          <Textarea placeholder="Ví dụ: Biến động chi phí vật liệu xây dựng Q1/2026..." value={fields.reason || ""} onChange={e => onChange("reason", e.target.value)} className="text-sm resize-none" rows={3} />
        </FF>
        <FF label="Cơ sở pháp lý">
          <Textarea placeholder="Biên bản thỏa thuận ngày 10/04/2026, điều 7 khoản 2 HĐ gốc..." value={fields.legal || ""} onChange={e => onChange("legal", e.target.value)} className="text-sm resize-none" rows={2} />
        </FF>
      </div>
    );
    case "T02": return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FF label="Ngày bàn giao cũ" required>
            <Input type="date" value={fields.oldDate || ""} onChange={e => onChange("oldDate", e.target.value)} className="text-sm" />
          </FF>
          <FF label="Ngày bàn giao mới" required>
            <Input type="date" value={fields.newDate || ""} onChange={e => onChange("newDate", e.target.value)} className="text-sm" />
          </FF>
          <FF label="Số ngày gia hạn" className="col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
              {fields.oldDate && fields.newDate ? (() => {
                const diff = Math.ceil((new Date(fields.newDate).getTime() - new Date(fields.oldDate).getTime()) / 86400000);
                return <span className="text-blue-700">{diff > 0 ? `Gia hạn thêm ${diff} ngày` : `Rút ngắn ${Math.abs(diff)} ngày`}</span>;
              })() : <span className="text-slate-400">Chọn ngày để tính tự động</span>}
            </div>
          </FF>
        </div>
        <FF label="Lý do gia hạn" required>
          <Textarea placeholder="Chậm tiến độ thi công do điều kiện thời tiết bất thường..." value={fields.reason || ""} onChange={e => onChange("reason", e.target.value)} className="text-sm resize-none" rows={3} />
        </FF>
        <FF label="Cam kết bồi thường (nếu có)">
          <Input placeholder="Bên bán sẽ hỗ trợ 5 triệu/tháng chi phí thuê nhà tạm..." value={fields.compensation || ""} onChange={e => onChange("compensation", e.target.value)} className="text-sm" />
        </FF>
      </div>
    );
    case "T03": return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">Chuyển nhượng quyền mua cần xác minh pháp lý từ bộ phận Legal.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Họ tên bên mua cũ"><Input placeholder="Nguyễn Văn A" value={fields.oldBuyer || ""} onChange={e => onChange("oldBuyer", e.target.value)} className="text-sm" /></FF>
          <FF label="CCCD bên mua cũ"><Input placeholder="012345678901" value={fields.oldId || ""} onChange={e => onChange("oldId", e.target.value)} className="text-sm" /></FF>
          <FF label="Họ tên bên mua mới" required><Input placeholder="Trần Thị B" value={fields.newBuyer || ""} onChange={e => onChange("newBuyer", e.target.value)} className="text-sm" /></FF>
          <FF label="CCCD bên mua mới" required><Input placeholder="098765432100" value={fields.newId || ""} onChange={e => onChange("newId", e.target.value)} className="text-sm" /></FF>
          <FF label="SĐT bên mua mới" required><Input placeholder="0987 654 321" value={fields.newPhone || ""} onChange={e => onChange("newPhone", e.target.value)} className="text-sm" /></FF>
          <FF label="Email bên mua mới"><Input placeholder="email@example.com" value={fields.newEmail || ""} onChange={e => onChange("newEmail", e.target.value)} className="text-sm" /></FF>
        </div>
        <FF label="Lý do chuyển nhượng" required>
          <Textarea placeholder="Lý do thay đổi bên mua..." value={fields.reason || ""} onChange={e => onChange("reason", e.target.value)} className="text-sm resize-none" rows={2} />
        </FF>
      </div>
    );
    case "T04": return (
      <div className="space-y-4">
        <FF label="Thay đổi phương thức">
          <div className="grid grid-cols-2 gap-2">
            {["Trả góp theo đợt", "Thanh toán 1 lần", "Vay ngân hàng", "Kết hợp vay + TT"].map((m) => (
              <button key={m} type="button" onClick={() => onChange("method", m)}
                className={cn("text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                  fields.method === m ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                {m}
              </button>
            ))}
          </div>
        </FF>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Ngân hàng mới (nếu vay)"><Input placeholder="Vietcombank" value={fields.bank || ""} onChange={e => onChange("bank", e.target.value)} className="text-sm" /></FF>
          <FF label="Tỷ lệ vay (%)"><Input placeholder="70" value={fields.loanPct || ""} onChange={e => onChange("loanPct", e.target.value)} className="text-sm" /></FF>
        </div>
        <FF label="Mô tả thay đổi lịch thanh toán" required>
          <Textarea placeholder="Đổi từ 3 đợt → 6 đợt, mỗi đợt cách nhau 2 tháng..." value={fields.scheduleDesc || ""} onChange={e => onChange("scheduleDesc", e.target.value)} className="text-sm resize-none" rows={3} />
        </FF>
      </div>
    );
    case "T05": return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">Phụ lục chấm dứt HĐ cần phê duyệt từ <strong>GĐ Kinh doanh</strong> và bộ phận <strong>Legal</strong>.</p>
        </div>
        <FF label="Lý do chấm dứt" required>
          <Select value={fields.reason || ""} onValueChange={v => onChange("reason", v)}>
            <SelectTrigger className="text-sm"><SelectValue placeholder="Chọn lý do" /></SelectTrigger>
            <SelectContent>
              {["Bên mua đơn phương hủy", "Bên bán vi phạm cam kết", "Thỏa thuận đồng thuận", "BĐS không đủ điều kiện pháp lý", "Lý do khác"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FF>
        <div className="grid grid-cols-2 gap-4">
          <FF label="Phạt vi phạm (VNĐ)"><Input placeholder="0" value={fields.penalty || ""} onChange={e => onChange("penalty", e.target.value)} className="text-sm" /></FF>
          <FF label="Hoàn tiền đặt cọc (VNĐ)"><Input placeholder="240,000,000" value={fields.refund || ""} onChange={e => onChange("refund", e.target.value)} className="text-sm" /></FF>
        </div>
        <FF label="Điều kiện chấm dứt chi tiết" required>
          <Textarea placeholder="Mô tả đầy đủ các điều kiện, nghĩa vụ của mỗi bên..." value={fields.detail || ""} onChange={e => onChange("detail", e.target.value)} className="text-sm resize-none" rows={4} />
        </FF>
      </div>
    );
    case "T06": return (
      <div className="space-y-4">
        <FF label="Tên điều khoản mới" required>
          <Input placeholder="Điều 12 – Quyền sử dụng khu vực chung" value={fields.clauseName || ""} onChange={e => onChange("clauseName", e.target.value)} className="text-sm" />
        </FF>
        <FF label="Nội dung điều khoản" required>
          <Textarea placeholder="Điền toàn bộ nội dung điều khoản bổ sung..." value={fields.clauseContent || ""} onChange={e => onChange("clauseContent", e.target.value)} className="text-sm resize-none" rows={5} />
        </FF>
        <FF label="Điều khoản HĐ gốc cần sửa đổi">
          <Input placeholder="Điều 8, khoản 3" value={fields.refClause || ""} onChange={e => onChange("refClause", e.target.value)} className="text-sm" />
        </FF>
        <FF label="Căn cứ pháp lý">
          <Textarea placeholder="Căn cứ nghị định, thông tư..." value={fields.legal || ""} onChange={e => onChange("legal", e.target.value)} className="text-sm resize-none" rows={2} />
        </FF>
      </div>
    );
    default: return null;
  }
}

// ─── Create Dialog ────────────────────────────────────────────────────────────
function AddendumDialog({ open, onClose, onSuccess }: {
  open: boolean; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("2026-04-15");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [attachedFile, setAttachedFile] = useState(false);
  const [approvers, setApprovers] = useState({ legal: true, manager: false });

  // Step 1 search/filter state
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatusFilter, setContractStatusFilter] = useState("Tất cả");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateCategory, setTemplateCategory] = useState("Tất cả");

  const contractStatuses = ["Tất cả", "Đang ký", "Đã ký", "Công chứng"];
  const templateCategories = ["Tất cả", ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredContracts = useMemo(() => {
    return contractOptions.filter((c) => {
      const matchStatus = contractStatusFilter === "Tất cả" || c.status === contractStatusFilter;
      const q = contractSearch.toLowerCase();
      const matchSearch = !q || c.label.toLowerCase().includes(q) ||
        c.customer.toLowerCase().includes(q) || c.property.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [contractSearch, contractStatusFilter]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCat = templateCategory === "Tất cả" || t.category === templateCategory;
      const q = templateSearch.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templateSearch, templateCategory]);

  const template = templates.find(t => t.id === selectedTemplate);
  const contract = contractOptions.find(c => c.value === selectedContract);
  const canStep1 = selectedTemplate && selectedContract;

  const handleClose = () => {
    setStep(1); setSelectedTemplate(""); setSelectedContract("");
    setFields({}); setAttachedFile(false);
    setContractSearch(""); setContractStatusFilter("Tất cả");
    setTemplateSearch(""); setTemplateCategory("Tất cả");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col" aria-describedby={undefined}>
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <DialogTitle className="text-slate-900 mb-3">Tạo phụ lục mới</DialogTitle>
          <div className="flex items-center gap-0">
            {dialogSteps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 border-2 transition-all",
                    step > s.id ? "bg-emerald-500 border-emerald-500 text-white" :
                    step === s.id ? "bg-slate-900 border-slate-900 text-white" :
                    "bg-white border-slate-200 text-slate-400"
                  )} style={{ fontWeight: 700 }}>
                    {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="hidden sm:block pr-1">
                    <p className={cn("text-xs whitespace-nowrap",
                      step === s.id ? "text-slate-900" : step > s.id ? "text-emerald-600" : "text-slate-400"
                    )} style={{ fontWeight: 500 }}>{s.label}</p>
                  </div>
                </div>
                {idx < dialogSteps.length - 1 && (
                  <div className={cn("flex-1 h-px mx-2", step > s.id ? "bg-emerald-300" : "bg-slate-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === 1 && (
            <div className="space-y-6">

              {/* ── Chọn hợp đồng gốc ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                  CHỌN HỢP ĐỒNG GỐC
                </p>

                {/* Search + status filter */}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo mã HĐ, khách hàng, căn..."
                      value={contractSearch}
                      onChange={e => setContractSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {contractStatuses.map((s) => (
                      <button key={s} type="button" onClick={() => setContractStatusFilter(s)}
                        className={cn("px-2.5 py-0.5 rounded-full text-xs border transition-all",
                          contractStatusFilter === s
                            ? "bg-slate-800 border-slate-800 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                        {s}
                        {s !== "Tất cả" && (
                          <span className="ml-1 opacity-60">
                            {contractOptions.filter(c => c.status === s).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contract list */}
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
                  {filteredContracts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">Không tìm thấy hợp đồng phù hợp</div>
                  ) : filteredContracts.map((c) => (
                    <button key={c.value} type="button" onClick={() => setSelectedContract(c.value)}
                      className={cn("w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all",
                        selectedContract === c.value
                          ? "border-slate-900 bg-slate-50"
                          : "border-transparent hover:border-slate-100 hover:bg-slate-50")}>
                      <div className={cn("w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedContract === c.value ? "border-slate-900 bg-slate-900" : "border-slate-300")}
                        style={{ width: 18, height: 18 }}>
                        {selectedContract === c.value && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-indigo-600" style={{ fontWeight: 600 }}>{c.label}</span>
                          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded border text-xs", contractStatusCfg[c.status] || "")} style={{ fontWeight: 500 }}>{c.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{c.customer} · {c.property}</p>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0 tabular-nums" style={{ fontWeight: 500 }}>{c.value_str}</span>
                    </button>
                  ))}
                </div>
                {filteredContracts.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1.5">{filteredContracts.length} hợp đồng</p>
                )}
              </div>

              {/* ── Chọn loại phụ lục ── */}
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>
                  CHỌN MẪU PHỤ LỤC
                </p>

                {/* Search + category tabs */}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm mẫu phụ lục..."
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {templateCategories.map((cat) => (
                      <button key={cat} type="button" onClick={() => setTemplateCategory(cat)}
                        className={cn("px-2.5 py-0.5 rounded-full text-xs border transition-all",
                          templateCategory === cat
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                        {cat}
                        {cat !== "Tất cả" && (
                          <span className="ml-1 opacity-70">
                            {templates.filter(t => t.category === cat).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template grid */}
                <div className="max-h-64 overflow-y-auto pr-0.5">
                  {filteredTemplates.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">Không tìm thấy mẫu phù hợp</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {filteredTemplates.map((t) => {
                        const Icon = t.icon;
                        const active = selectedTemplate === t.id;
                        return (
                          <button key={t.id} type="button" onClick={() => setSelectedTemplate(t.id)}
                            className={cn("text-left p-3 rounded-xl border-2 transition-all group",
                              active ? "border-slate-900 bg-slate-900" : "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40")}>
                            <div className="flex items-start justify-between mb-2">
                              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", active ? "bg-white/15" : t.bg)}>
                                <Icon className={cn("w-3.5 h-3.5", active ? "text-white" : t.color)} />
                              </div>
                              {active && <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />}
                            </div>
                            <p className={cn("text-xs leading-snug", active ? "text-white" : "text-slate-800")} style={{ fontWeight: 600 }}>{t.name}</p>
                            <p className={cn("text-xs mt-1 leading-snug", active ? "text-white/55" : "text-slate-400")} style={{ fontSize: 10 }}>{t.desc}</p>
                            <div className={cn("flex items-center gap-1 mt-2", active ? "text-white/50" : "text-slate-400")}>
                              <CornerDownRight className="w-3 h-3" />
                              <span style={{ fontSize: 10 }}>{t.usages} lần dùng</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {filteredTemplates.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1.5">{filteredTemplates.length} mẫu</p>
                )}
              </div>

              {/* ── Ngày hiệu lực (chỉ hiện khi đã chọn cả hai) ── */}
              {selectedTemplate && selectedContract && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-emerald-800" style={{ fontWeight: 600 }}>NGÀY HIỆU LỰC PHỤ LỤC</p>
                  <div className="flex items-center gap-3">
                    <Input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} className="text-sm w-44 bg-white" />
                    <p className="text-xs text-emerald-700">Phụ lục có hiệu lực từ ngày này</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {template && contract && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", template.bg)}>
                    <template.icon className={cn("w-4 h-4", template.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800" style={{ fontWeight: 600 }}>{template.name}</p>
                    <p className="text-xs text-slate-500">{contract.label} · {contract.customer}</p>
                  </div>
                  <span className="text-xs text-slate-400">HiL: {effectiveDate}</span>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>NỘI DUNG THAY ĐỔI</p>
                <TemplateFields templateId={selectedTemplate} fields={fields} onChange={(k, v) => setFields(prev => ({ ...prev, [k]: v }))} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>TÀI LIỆU ĐÍNH KÈM</p>
                <div onClick={() => setAttachedFile(true)}
                  className={cn("border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                    attachedFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50")}>
                  {attachedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm text-emerald-700" style={{ fontWeight: 500 }}>phu-luc-01.pdf (2.4 MB)</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500">Kéo thả hoặc click để tải lên tài liệu</p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX (tối đa 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {template && <template.icon className="w-4 h-4 text-white/70" />}
                    <p className="text-sm text-white" style={{ fontWeight: 600 }}>{template?.name || "Phụ lục"} – {contract?.label}</p>
                  </div>
                  <Badge variant="outline" className="text-white border-white/30 text-xs">Bản nháp</Badge>
                </div>
                <div className="p-4 bg-white space-y-3 text-xs text-slate-600">
                  <div className="grid grid-cols-2 gap-y-2">
                    <div><span className="text-slate-400">Hợp đồng gốc:</span> <span className="text-slate-800 font-medium">{contract?.label}</span></div>
                    <div><span className="text-slate-400">Khách hàng:</span> <span className="text-slate-800 font-medium">{contract?.customer}</span></div>
                    <div><span className="text-slate-400">Bất động sản:</span> <span className="text-slate-800">{contract?.property}</span></div>
                    <div><span className="text-slate-400">Ngày hiệu lực:</span> <span className="text-slate-800">{effectiveDate}</span></div>
                    <div><span className="text-slate-400">Loại phụ lục:</span> <span className="text-slate-800">{template?.name}</span></div>
                    <div><span className="text-slate-400">Tài liệu:</span> <span className={attachedFile ? "text-emerald-600" : "text-amber-600"}>{attachedFile ? "Đã đính kèm" : "Chưa có"}</span></div>
                  </div>
                  {Object.keys(fields).length > 0 && (
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                      <p className="text-xs text-slate-500 font-medium mb-2">Chi tiết thay đổi:</p>
                      {Object.entries(fields).filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex gap-2"><span className="text-slate-400 capitalize shrink-0">{k}:</span><span className="text-slate-700 truncate">{v}</span></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-3 pb-2 border-b border-slate-100" style={{ fontWeight: 600 }}>LUỒNG PHÊ DUYỆT</p>
                <div className="space-y-2">
                  {[
                    { key: "legal",   label: "Bộ phận Legal",          desc: "Kiểm tra pháp lý & rủi ro",                       required: true,                      avatar: "LG" },
                    { key: "manager", label: "Giám đốc kinh doanh",    desc: "Phê duyệt nếu thay đổi > 5% giá trị HĐ",          required: selectedTemplate === "T05", avatar: "GD" },
                  ].map((ap) => (
                    <div key={ap.key} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0" style={{ fontWeight: 600 }}>{ap.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{ap.label}</p>
                          {ap.required && <Badge variant="outline" className="text-xs text-red-600 border-red-200">Bắt buộc</Badge>}
                        </div>
                        <p className="text-xs text-slate-400">{ap.desc}</p>
                      </div>
                      <button type="button"
                        onClick={() => setApprovers(p => ({ ...p, [ap.key]: !p[ap.key as keyof typeof p] }))}
                        className={cn("w-10 h-5 rounded-full transition-all relative shrink-0", approvers[ap.key as keyof typeof approvers] ? "bg-slate-900" : "bg-slate-200")}>
                        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                          style={{ left: approvers[ap.key as keyof typeof approvers] ? "calc(100% - 18px)" : "2px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Alert className="border-indigo-200 bg-indigo-50 py-3">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <AlertDescription className="text-indigo-700 text-xs">
                  Sau khi được phê duyệt, phụ lục sẽ <strong>tự động đồng bộ</strong> sang module <strong>Công nợ</strong> và <strong>Lịch thanh toán</strong>.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between gap-3 shrink-0 bg-white">
          <Button variant="outline" onClick={step === 1 ? handleClose : () => setStep(s => s - 1)} className="gap-2 text-sm">
            {step === 1 ? <X className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {step === 1 ? "Đóng" : "Quay lại"}
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && !canStep1} className="gap-2 text-sm">
                Tiếp theo <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="outline" className="gap-2 text-sm" onClick={handleClose}>
                  <Download className="w-4 h-4" />Lưu nháp
                </Button>
                <Button className="gap-2 text-sm bg-emerald-600 hover:bg-emerald-700" onClick={() => { onSuccess(); handleClose(); }}>
                  <Send className="w-4 h-4" />Gửi phê duyệt
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Approver status config ───────────────────────────────────────────────────
const approverStatusCfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved: { label: "Đã phê duyệt", color: "text-emerald-700", bg: "bg-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending:  { label: "Đang xem xét", color: "text-blue-700",    bg: "bg-blue-100",    icon: <Clock className="w-3.5 h-3.5" />        },
  rejected: { label: "Từ chối",       color: "text-red-700",     bg: "bg-red-100",     icon: <X className="w-3.5 h-3.5" />            },
  waiting:  { label: "Chờ đến lượt",  color: "text-slate-500",   bg: "bg-slate-100",   icon: <Clock className="w-3.5 h-3.5" />        },
};

const detailActivityCfg: Record<string, { color: string; bg: string }> = {
  create:  { color: "text-blue-700",    bg: "bg-blue-100"    },
  approve: { color: "text-emerald-700", bg: "bg-emerald-100" },
  reject:  { color: "text-red-700",     bg: "bg-red-100"     },
  edit:    { color: "text-amber-700",   bg: "bg-amber-100"   },
  upload:  { color: "text-indigo-700",  bg: "bg-indigo-100"  },
  request: { color: "text-orange-700",  bg: "bg-orange-100"  },
  notify:  { color: "text-slate-600",   bg: "bg-slate-100"   },
  sync:    { color: "text-indigo-700",  bg: "bg-indigo-100"  },
};

// ─── Detail Sheet ─────────────────────────────────────────────────────────────
function AddendumDetailSheet({ item, open, onClose }: {
  item: AddendumItem | null; open: boolean; onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [actionDone, setActionDone] = useState<string | null>(null);

  if (!item) return null;

  const template = templates.find(t => t.id === item.templateId);
  const Icon = template?.icon ?? FileText;

  const handleAction = (action: string) => {
    setActionDone(action);
    setTimeout(() => { setActionDone(null); onClose(); }, 1400);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Chi tiết phụ lục {item.id}</SheetTitle>

        {/* ── HEADER ── */}
        <div className="shrink-0 border-b border-slate-200">
          {/* Top bar */}
          <div className="flex items-start gap-3 px-5 pt-5 pb-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5", template?.bg ?? "bg-slate-100")}>
              <Icon className={cn("w-5 h-5", template?.color ?? "text-slate-500")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-indigo-600" style={{ fontWeight: 700 }}>{item.id}</p>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs", pendingStatusCfg[item.status])} style={{ fontWeight: 500 }}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-slate-900 mt-0.5">{item.type}</h3>
              <p className="text-xs text-slate-500 mt-0.5">HĐ {item.contract} · {item.customer}</p>
            </div>
          </div>
          {/* Meta strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 text-center">
            {[
              { label: "Tạo bởi",  value: item.by },
              { label: "Ngày tạo", value: item.created },
              { label: "Hiệu lực", value: item.effectiveDate },
            ].map((m) => (
              <div key={m.label} className="py-2 px-3">
                <p className="text-xs text-slate-400">{m.label}</p>
                <p className="text-xs text-slate-800 mt-0.5 truncate" style={{ fontWeight: 500 }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Contract info */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>HỢP ĐỒNG GỐC</p>
            <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-y-2.5">
              {[
                { icon: Hash,      label: "Mã HĐ",        value: item.contract },
                { icon: User,      label: "Khách hàng",   value: item.customer },
                { icon: Building2, label: "Bất động sản", value: item.property },
                { icon: Banknote,  label: "Giá trị HĐ",   value: `${item.contractValue} VNĐ` },
              ].map(({ icon: I, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <I className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <p className="text-xs text-slate-700 truncate" style={{ fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Changes – before / after */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>NỘI DUNG THAY ĐỔI</p>
            <div className="space-y-2.5">
              {item.changes.map((c, i) => (
                <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200">
                    <p className="text-xs text-slate-500" style={{ fontWeight: 600 }}>{c.label}</p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowDownLeft className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-slate-400">Trước</span>
                      </div>
                      <p className={cn("text-xs break-words", c.before === "—" ? "text-slate-300" : "text-red-600 line-through")}>{c.before}</p>
                    </div>
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-xs text-slate-400">Sau</span>
                      </div>
                      <p className={cn("text-xs break-words", c.after === "—" ? "text-slate-300" : "text-emerald-700")} style={{ fontWeight: c.after !== "—" ? 500 : 400 }}>{c.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval flow */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>
              LUỒNG PHÊ DUYỆT · {item.approvers.filter(a => a.status === "approved").length}/{item.approvers.length} đã duyệt
            </p>
            <div className="space-y-2">
              {item.approvers.map((ap, i) => {
                const cfg = approverStatusCfg[ap.status];
                return (
                  <div key={i} className={cn("rounded-xl border p-3 transition-all",
                    ap.status === "approved" ? "border-emerald-200 bg-emerald-50/50" :
                    ap.status === "pending"  ? "border-blue-200 bg-blue-50/50" :
                    ap.status === "rejected" ? "border-red-200 bg-red-50/50" :
                    "border-slate-200 bg-white opacity-60"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5",
                        ap.status === "approved" ? "bg-emerald-500 text-white" :
                        ap.status === "pending"  ? "bg-blue-500 text-white" :
                        "bg-slate-200 text-slate-500"
                      )} style={{ fontWeight: 700 }}>{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-xs text-slate-800" style={{ fontWeight: 500 }}>{ap.name}</p>
                            <p className="text-xs text-slate-400">{ap.role}</p>
                          </div>
                          <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", cfg.bg, cfg.color)} style={{ fontWeight: 500 }}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        {ap.time && <p className="text-xs text-slate-400 mt-1">{ap.time}</p>}
                        {ap.comment && (
                          <div className="mt-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex gap-1.5">
                            <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 italic">{ap.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400" style={{ fontWeight: 600 }}>TÀI LIỆU ĐÍNH KÈM ({item.docs.length})</p>
              <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-slate-500 hover:text-slate-700 px-2">
                <Upload className="w-3 h-3" />Tải lên
              </Button>
            </div>
            <div className="space-y-2">
              {item.docs.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 truncate" style={{ fontWeight: 500 }}>{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.size} · {doc.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" aria-label={`Tải xuống ${doc.name}`} className="h-9 w-9 p-0 shrink-0">
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="px-5 py-4">
            <p className="text-xs text-slate-400 mb-3" style={{ fontWeight: 600 }}>LỊCH SỬ HOẠT ĐỘNG</p>
            <div className="relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
              <div className="space-y-3">
                {item.activity.map((act, i) => {
                  const cfg = detailActivityCfg[act.type] ?? detailActivityCfg.notify;
                  return (
                    <div key={i} className="flex gap-3 relative">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white text-xs", cfg.bg, cfg.color)} style={{ fontWeight: 700 }}>
                        {act.avatar}
                      </div>
                      <div className="flex-1 pb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-slate-800" style={{ fontWeight: 600 }}>{act.user}</span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded border", cfg.bg, cfg.color)} style={{ fontWeight: 500 }}>{act.action}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-4">{act.detail}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Comment box */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2" style={{ fontWeight: 600 }}>THÊM GHI CHÚ</p>
              <Textarea
                placeholder="Nhập ghi chú hoặc yêu cầu chỉnh sửa..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="text-sm resize-none"
                rows={2}
              />
              <Button variant="outline" size="sm" className="mt-2 gap-1.5 text-xs" disabled={!comment}>
                <MessageSquare className="w-3.5 h-3.5" />Gửi ghi chú
              </Button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4">
          {actionDone ? (
            <div className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm", actionDone === "approve" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")} style={{ fontWeight: 500 }}>
              <CheckCircle2 className="w-4 h-4" />
              {actionDone === "approve" ? "Đã phê duyệt thành công!" : "Đã từ chối phụ lục."}
            </div>
          ) : item.status === "Chờ phê duyệt" ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button className="flex-1 gap-2 text-sm bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction("approve")}>
                  <ThumbsUp className="w-4 h-4" />Phê duyệt
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-sm border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleAction("reject")}>
                  <ThumbsDown className="w-4 h-4" />Từ chối
                </Button>
              </div>
              <Button variant="outline" className="w-full gap-2 text-sm text-amber-600 border-amber-200 hover:bg-amber-50">
                <MessageSquare className="w-4 h-4" />Yêu cầu chỉnh sửa
              </Button>
            </div>
          ) : item.status === "Chờ ký" ? (
            <div className="flex gap-2">
              <Button className="flex-1 gap-2 text-sm" onClick={() => handleAction("approve")}>
                <Pencil className="w-4 h-4" />Ký xác nhận
              </Button>
              <Button variant="outline" className="gap-2 text-sm">
                <Download className="w-4 h-4" />Tải PDF
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 text-sm">
                <Download className="w-4 h-4" />Tải bản ký
              </Button>
              <Button variant="outline" className="flex-1 gap-2 text-sm">
                <RefreshCw className="w-4 h-4" />Kiểm tra đồng bộ
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AddendumPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [pendingList, setPendingList] = useState(pendingAddendums);
  const [selectedDetail, setSelectedDetail] = useState<AddendumItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openDetail = (id: string) => {
    const found = addendumDetails.find(a => a.id === id) ?? null;
    setSelectedDetail(found);
    setSheetOpen(true);
  };

  const handleSuccess = () => {
    setSuccessAlert(true);
    const newItem = {
      id: `PL-148-0${pendingList.length + 1}`,
      contract: "HĐ-2026-148",
      type: "Điều chỉnh giá",
      status: "Chờ phê duyệt",
      created: "15/04/2026",
      by: "Nguyễn Văn A",
    };
    setPendingList(prev => [newItem, ...prev]);
    setTimeout(() => setSuccessAlert(false), 4000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
        <div>
          <h1 className="text-slate-900">Quản lý phụ lục</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tạo, theo dõi và quản lý phụ lục hợp đồng</p>
        </div>
        <Button size="sm" className="h-10 gap-2 bg-slate-950 text-sm hover:bg-slate-800" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />Phụ lục mới
        </Button>
      </div>

      {/* Success toast */}
      {successAlert && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-emerald-800" style={{ fontWeight: 500 }}>Phụ lục đã được gửi phê duyệt.</p>
            <p className="text-xs text-emerald-600 mt-0.5">Bộ phận Legal sẽ xem xét trong vòng 24 giờ làm việc.</p>
          </div>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setSuccessAlert(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sync Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-900 text-sm">Đồng bộ tự động đang hoạt động</AlertTitle>
        <AlertDescription className="text-blue-800 text-xs mt-0.5">
          <p>
            Mọi thay đổi tại phụ lục <strong>sẽ tự động đồng bộ</strong> sang module <strong>Công nợ</strong> và{" "}
            <strong>Lịch thanh toán</strong> trong vòng vài giây. Lần đồng bộ cuối: <strong>14/04/2026 · 10:16</strong>
          </p>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left */}
        <div className="xl:col-span-2 space-y-5">
          {/* Template grid */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-slate-900">Thư viện mẫu phụ lục</CardTitle>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setDialogOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />Tạo ngay
                </Button>
              </div>
              <CardDescription className="text-xs">6 loại phụ lục chuẩn · Click để tạo mới</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {templates.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} type="button" onClick={() => setDialogOpen(true)}
                      className="group rounded-lg border border-slate-200 p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2.5", t.bg)}>
                        <Icon className={cn("w-4 h-4", t.color)} />
                      </div>
                      <p className="text-sm text-slate-800 group-hover:text-slate-900 transition-colors" style={{ fontWeight: 600 }}>{t.name}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-4">{t.desc}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded border", t.bg, t.color)} style={{ fontWeight: 500 }}>{t.category}</span>
                        <span className="text-xs text-slate-400">{t.usages} lần</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pending table */}
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <CardTitle className="text-slate-900">Phụ lục đang xử lý</CardTitle>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                  {pendingList.filter(p => p.status !== "Đã ký").length} chờ xử lý
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Mã PL", "Loại", "Nhân viên", "Trạng thái", ""].map((h, i) => (
                      <th key={i} className={cn("text-left px-4 py-2.5 text-xs text-slate-500", i === 2 && "hidden sm:table-cell")} style={{ fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pendingList.map((p) => (
                    <tr
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Mở chi tiết phụ lục ${p.id}`}
                      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-400"
                      onClick={() => openDetail(p.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openDetail(p.id);
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-indigo-600" style={{ fontWeight: 600 }}>{p.id}</span>
                        <p className="text-xs text-slate-400">{p.contract}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-700">{p.type}</span>
                        <p className="text-xs text-slate-400">{p.created}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-slate-600">{p.by}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${pendingStatusCfg[p.status]}`} style={{ fontWeight: 500 }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost" size="sm" aria-label={`Xem phụ lục ${p.id}`} className="h-9 w-9 p-0"
                          onClick={(e) => { e.stopPropagation(); openDetail(p.id); }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right: Timeline */}
        <div>
          <Card className="border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-slate-900">Nhật ký thay đổi</CardTitle>
              </div>
              <CardDescription className="text-xs">Lịch sử chỉnh sửa & phê duyệt</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative">
                <div className="absolute left-3.5 top-4 bottom-4 w-px bg-slate-200" />
                <div className="space-y-4">
                  {auditLog.map((log) => {
                    const cfg = actionCfg[log.type] ?? actionCfg.create;
                    return (
                      <div key={log.id} className="flex gap-3 relative">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-white text-xs", cfg.bg, cfg.color)} style={{ fontWeight: 700 }}>
                          {log.avatar}
                        </div>
                        <div className="flex-1 pb-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-800" style={{ fontWeight: 600 }}>{log.user}</span>
                            <span className={cn("text-xs px-1.5 py-0.5 rounded border", cfg.bg, cfg.color)} style={{ fontWeight: 500 }}>{log.action}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-4">{log.detail}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{log.time}</span>
                            <span className="text-xs text-indigo-500" style={{ fontWeight: 500 }}>{log.contract}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 text-xs gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />Tải thêm lịch sử
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddendumDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSuccess={handleSuccess} />
      <AddendumDetailSheet item={selectedDetail} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
