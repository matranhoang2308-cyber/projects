import {
  Banknote, Calendar, UserCheck, Scale, FileX, BookOpen,
  ReceiptText, Tag, BadgePercent, UserMinus, Landmark, Shield,
  ArrowLeftRight, StickyNote, Home, type LucideIcon,
} from "lucide-react";

// ─── Template library (reused inside Step 1 of the create modal) ─────────────
export interface AddendumTemplate {
  id: string;
  name: string;
  desc: string;
  category: "Tài chính" | "Thời hạn" | "Thông tin" | "Pháp lý" | "Khác";
  icon: LucideIcon;
  color: string;
  bg: string;
  usages: number;
}

export const templates: AddendumTemplate[] = [
  // Tài chính
  { id: "T01", name: "Điều chỉnh giá",          desc: "Điều chỉnh giá trị HĐ do biến động thị trường",    category: "Tài chính", icon: Banknote,      color: "text-emerald-600", bg: "bg-emerald-50", usages: 42 },
  { id: "T04", name: "Điều chỉnh thanh toán",   desc: "Thay đổi phương thức và lịch thanh toán",           category: "Tài chính", icon: ReceiptText,   color: "text-violet-600",  bg: "bg-violet-50",  usages: 27 },
  { id: "T07", name: "Điều chỉnh chiết khấu",   desc: "Cập nhật tỷ lệ chiết khấu theo chính sách mới",    category: "Tài chính", icon: BadgePercent,  color: "text-teal-600",    bg: "bg-teal-50",    usages: 19 },
  { id: "T08", name: "Hoàn tiền đặt cọc",       desc: "Thủ tục hoàn trả tiền đặt cọc khi hủy HĐ",         category: "Tài chính", icon: Banknote,      color: "text-orange-600",  bg: "bg-orange-50",  usages: 8  },
  { id: "T09", name: "Điều chỉnh phí bảo trì",  desc: "Cập nhật mức phí bảo trì/quản lý căn hộ",          category: "Tài chính", icon: Landmark,      color: "text-cyan-600",    bg: "bg-cyan-50",    usages: 11 },
  // Thời hạn
  { id: "T02", name: "Gia hạn thời gian",        desc: "Gia hạn bàn giao hoặc thời hạn thực hiện HĐ",     category: "Thời hạn",  icon: Calendar,      color: "text-blue-600",    bg: "bg-blue-50",    usages: 31 },
  { id: "T10", name: "Rút ngắn bàn giao",        desc: "Điều chỉnh ngày bàn giao sớm hơn kế hoạch",       category: "Thời hạn",  icon: Calendar,      color: "text-sky-600",     bg: "bg-sky-50",     usages: 5  },
  { id: "T11", name: "Gia hạn đợt thanh toán",   desc: "Gia hạn ngày đến hạn của một đợt thanh toán cụ thể", category: "Thời hạn", icon: Calendar,      color: "text-amber-600",   bg: "bg-amber-50",   usages: 23 },
  // Thông tin
  { id: "T03", name: "Thay đổi TT khách hàng",   desc: "Chuyển nhượng hoặc thay đổi thông tin bên mua",   category: "Thông tin", icon: UserCheck,     color: "text-indigo-600",  bg: "bg-indigo-50",  usages: 18 },
  { id: "T12", name: "Cập nhật thông tin CĐT",   desc: "Sửa CCCD, địa chỉ, thông tin liên hệ khách hàng", category: "Thông tin", icon: UserCheck,     color: "text-pink-600",    bg: "bg-pink-50",    usages: 14 },
  { id: "T13", name: "Thay đổi TT đồng sở hữu",  desc: "Bổ sung hoặc thay đổi người đồng sở hữu hợp đồng", category: "Thông tin", icon: UserMinus,     color: "text-fuchsia-600", bg: "bg-fuchsia-50", usages: 7  },
  { id: "T19", name: "Thay đổi TT căn hộ",       desc: "Cập nhật thông tin sản phẩm / căn hộ giao dịch",  category: "Thông tin", icon: Home,          color: "text-lime-700",    bg: "bg-lime-50",    usages: 9  },
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

// ─── Contracts available to pick as "hợp đồng gốc" in Step 1 ─────────────────
export interface AddendumContractOption {
  value: string;
  label: string;
  customer: string;
  property: string;
  value_str: string;
  status: "Đã ký" | "Công chứng" | "Đã đặt cọc";
}

export const contractOptions: AddendumContractOption[] = [
  { value: "HDMB-001", label: "HDMB-001", customer: "Nguyễn Minh Anh", property: "Căn hộ IKI.H.06-01", value_str: "2,750,000,000đ", status: "Đã ký" },
  { value: "HDMB-002", label: "HDMB-002", customer: "Trần Hoài Nam",   property: "Căn hộ IKI.H.06-02", value_str: "2,550,000,000đ", status: "Đã ký" },
  { value: "HDMB-003", label: "HDMB-003", customer: "Lê Thanh Hằng",   property: "Căn hộ IKI.H.06-03", value_str: "2,680,000,000đ", status: "Đã ký" },
  { value: "HDMB-004", label: "HDMB-004", customer: "Phạm Gia Bảo",    property: "Căn hộ IKI.H.06-04", value_str: "2,900,000,000đ", status: "Đã ký" },
  { value: "HDMB-005", label: "HDMB-005", customer: "Vũ Khánh Linh",   property: "Căn hộ IKI.H.06-05", value_str: "2,500,000,000đ", status: "Công chứng" },
  { value: "HDMB-006", label: "HDMB-006", customer: "Đặng Quốc Huy",   property: "Căn hộ IKI.H.06-06", value_str: "2,820,000,000đ", status: "Đã ký" },
  { value: "HDMB-007", label: "HDMB-007", customer: "Bùi Thanh Tùng",  property: "Căn hộ IKI.H.06-07", value_str: "3,100,000,000đ", status: "Đã ký" },
  { value: "HDMB-008", label: "HDMB-008", customer: "Hoàng Mai Chi",   property: "Căn hộ IKI.H.07-03", value_str: "2,650,000,000đ", status: "Đã đặt cọc" },
  { value: "HDMB-149", label: "HDMB-149", customer: "Trần Thị Mai",    property: "Căn hộ B2-0543",     value_str: "2,750,000,000đ", status: "Đã ký" },
  { value: "HDMB-150", label: "HDMB-150", customer: "Lê Văn Hòa",      property: "Căn hộ C3-0110",     value_str: "2,550,000,000đ", status: "Đã ký" },
  { value: "HDMB-151", label: "HDMB-151", customer: "Nguyễn Thị Hương",property: "Căn hộ D4-0702",     value_str: "2,680,000,000đ", status: "Đã ký" },
  { value: "HDMB-152", label: "HDMB-152", customer: "Phạm Văn An",     property: "Căn hộ E5-0315",     value_str: "2,900,000,000đ", status: "Đã ký" },
  { value: "HDMB-153", label: "HDMB-153", customer: "Đỗ Minh Tuấn",    property: "Căn hộ F6-0084",     value_str: "2,500,000,000đ", status: "Công chứng" },
  { value: "HDMB-154", label: "HDMB-154", customer: "Bùi Thị Lan",     property: "Căn hộ G7-0258",     value_str: "2,820,000,000đ", status: "Đã đặt cọc" },
];

export const contractStatusCfg: Record<string, string> = {
  "Đã ký":       "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Công chứng":  "bg-violet-100 text-violet-700 border-violet-200",
  "Đã đặt cọc":  "bg-orange-100 text-orange-700 border-orange-200",
};

// ─── Addendum list — 13 columns ───────────────────────────────────────────────
export interface AddendumPerson {
  name: string;
  email: string;
  initials: string;
}

export type AddendumStatus = "Đã ký" | "Nháp";

export interface AddendumListItem {
  id: string;                 // Mã phụ lục — PL-001
  soPhuLuc: string;            // Số phụ lục — PL/HDMB/2026-001
  loaiPhuLuc: string;          // Loại phụ lục
  templateId: string;          // ref → templates[]
  maHopDong: string;           // Mã hợp đồng
  khachHang: AddendumPerson;
  nhanVienThayDoi: AddendumPerson;
  duAn: string;
  thapBlock: string;
  tang: string;
  maCan: string;
  ngayTao: string;             // dd/mm/yyyy
  capNhatLanCuoi: string;      // dd/mm/yyyy
  trangThai: AddendumStatus;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

function employee(name: string): AddendumPerson {
  const email = `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .split(" ")
    .slice(-2)
    .join("")}@akh.vn`;
  return { name, email, initials: initialsOf(name) };
}

function customer(name: string): AddendumPerson {
  const email = `${name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .split(" ")
    .join("")}@email.com`;
  return { name, email, initials: initialsOf(name) };
}

export const addendumList: AddendumListItem[] = [
  { id: "PL-001", soPhuLuc: "PL/HDMB/2026-001", loaiPhuLuc: "Thay đổi TT khách hàng",  templateId: "T03", maHopDong: "HDMB-001", khachHang: customer("Nguyễn Tuấn Anh"),  nhanVienThayDoi: employee("Nguyễn Minh Anh"), duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-01", ngayTao: "08/05/2026", capNhatLanCuoi: "10/05/2026", trangThai: "Đã ký" },
  { id: "PL-002", soPhuLuc: "PL/HDMB/2026-002", loaiPhuLuc: "Thay đổi TT đồng sở hữu", templateId: "T13", maHopDong: "HDMB-002", khachHang: customer("Trần Văn Tình"),     nhanVienThayDoi: employee("Trần Hoài Nam"),   duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-02", ngayTao: "10/05/2026", capNhatLanCuoi: "12/05/2026", trangThai: "Đã ký" },
  { id: "PL-003", soPhuLuc: "PL/HDMB/2026-003", loaiPhuLuc: "Thay đổi TT căn hộ",      templateId: "T19", maHopDong: "HDMB-003", khachHang: customer("Lê Văn Thành"),      nhanVienThayDoi: employee("Lê Thanh Hằng"),   duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-03", ngayTao: "12/05/2026", capNhatLanCuoi: "14/05/2026", trangThai: "Đã ký" },
  { id: "PL-004", soPhuLuc: "PL/HDMB/2026-004", loaiPhuLuc: "Thay đổi TT khách hàng",  templateId: "T03", maHopDong: "HDMB-004", khachHang: customer("Đỗ Ngọc Quý"),        nhanVienThayDoi: employee("Phạm Gia Bảo"),    duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-04", ngayTao: "15/05/2026", capNhatLanCuoi: "16/05/2026", trangThai: "Đã ký" },
  { id: "PL-005", soPhuLuc: "PL/HDMB/2026-005", loaiPhuLuc: "Thay đổi TT căn hộ",      templateId: "T19", maHopDong: "HDMB-005", khachHang: customer("Phạm Viết Hiệp"),    nhanVienThayDoi: employee("Vũ Khánh Linh"),   duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-05", ngayTao: "18/05/2026", capNhatLanCuoi: "19/05/2026", trangThai: "Nháp" },
  { id: "PL-006", soPhuLuc: "PL/HDMB/2026-006", loaiPhuLuc: "Thay đổi TT đồng sở hữu", templateId: "T13", maHopDong: "HDMB-006", khachHang: customer("Đặng Tiến Vương"),   nhanVienThayDoi: employee("Đặng Quốc Huy"),   duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-06", ngayTao: "20/05/2026", capNhatLanCuoi: "22/05/2026", trangThai: "Đã ký" },
  { id: "PL-007", soPhuLuc: "PL/HDMB/2026-007", loaiPhuLuc: "Thay đổi TT khách hàng",  templateId: "T03", maHopDong: "HDMB-007", khachHang: customer("Bùi Thanh Tâm"),     nhanVienThayDoi: employee("Bùi Thanh Tùng"),  duAn: "Ikivillage", thapBlock: "Harmonie", tang: "06", maCan: "IKI.H.06-07", ngayTao: "22/05/2026", capNhatLanCuoi: "23/05/2026", trangThai: "Đã ký" },
  { id: "PL-008", soPhuLuc: "PL/HDMB/2026-008", loaiPhuLuc: "Thay đổi TT căn hộ",      templateId: "T19", maHopDong: "HDMB-008", khachHang: customer("Hoàng Thị Vân Anh"),  nhanVienThayDoi: employee("Hoàng Mai Chi"),   duAn: "Ikivillage", thapBlock: "Harmonie", tang: "07", maCan: "IKI.H.07-03", ngayTao: "25/05/2026", capNhatLanCuoi: "26/05/2026", trangThai: "Nháp" },
];

export const addendumStatusCfg: Record<AddendumStatus, string> = {
  "Đã ký": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Nháp":  "bg-slate-100 text-slate-600 border-slate-200",
};

// ─── Filter option lists (derived) ────────────────────────────────────────────
export const employeeFilterOptions = Array.from(new Set(addendumList.map((a) => a.nhanVienThayDoi.name)));
export const towerBlockFilterOptions = Array.from(new Set(addendumList.map((a) => a.thapBlock)));
export const statusFilterOptions: AddendumStatus[] = ["Đã ký", "Nháp"];

// ─── Table columns (used to drive the "Hiển thị" column-visibility picker) ──
export interface AddendumColumnDef {
  key: string;
  label: string;
  alwaysOn?: boolean; // checkbox + mã phụ lục stay pinned
}

export const addendumColumns: AddendumColumnDef[] = [
  { key: "id",             label: "Mã phụ lục",         alwaysOn: true },
  { key: "soPhuLuc",       label: "Số phụ lục" },
  { key: "loaiPhuLuc",     label: "Loại phụ lục" },
  { key: "maHopDong",      label: "Mã hợp đồng" },
  { key: "khachHang",      label: "Khách hàng" },
  { key: "nhanVienThayDoi",label: "Nhân viên thay đổi" },
  { key: "duAn",           label: "Dự án" },
  { key: "thapBlock",      label: "Tháp/block" },
  { key: "tang",           label: "Tầng" },
  { key: "maCan",          label: "Mã căn" },
  { key: "ngayTao",        label: "Ngày tạo" },
  { key: "capNhatLanCuoi", label: "Cập nhật lần cuối" },
  { key: "trangThai",      label: "Trạng thái",         alwaysOn: true },
];

// ─── Audit / history log (shared by the row-level "Nhật ký thay đổi" modal) ──
export interface AddendumAuditEntry {
  id: number;
  addendumId: string;
  user: string;
  time: string;     // "10:00 13/06/2025"
  action: "Tạo phụ lục" | "Chỉnh sửa";
  detail: string;
  contract: string;
}

export const addendumAuditLog: AddendumAuditEntry[] = [
  { id: 1, addendumId: "PL-001", user: "Trần Minh Khoa", time: "10:00 13/06/2025", action: "Tạo phụ lục", detail: "Chỉnh sửa phụ lục PL-01 Điều chỉnh giá", contract: "HDMB-001" },
  { id: 2, addendumId: "PL-001", user: "Trần Minh Khoa", time: "10:00 13/06/2025", action: "Chỉnh sửa",   detail: "Chỉnh sửa phụ lục PL-01 Điều chỉnh giá", contract: "HDMB-001" },
  { id: 3, addendumId: "PL-001", user: "Trần Minh Khoa", time: "10:00 13/06/2025", action: "Chỉnh sửa",   detail: "Chỉnh sửa phụ lục PL-01 Điều chỉnh giá", contract: "HDMB-001" },
  { id: 4, addendumId: "PL-002", user: "Nguyễn Thị Hương", time: "09:15 12/06/2025", action: "Tạo phụ lục", detail: "Khởi tạo phụ lục PL-02 Thay đổi TT đồng sở hữu", contract: "HDMB-002" },
  { id: 5, addendumId: "PL-002", user: "Nguyễn Thị Hương", time: "14:40 12/06/2025", action: "Chỉnh sửa",   detail: "Cập nhật thông tin đồng sở hữu mới", contract: "HDMB-002" },
  { id: 6, addendumId: "PL-003", user: "Lê Đức Anh", time: "08:30 11/06/2025", action: "Tạo phụ lục", detail: "Khởi tạo phụ lục PL-03 Thay đổi TT căn hộ", contract: "HDMB-003" },
];

export function getAuditLogForAddendum(addendumId: string): AddendumAuditEntry[] {
  return addendumAuditLog.filter((a) => a.addendumId === addendumId);
}
