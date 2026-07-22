import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ChevronRight, Search, Plus, Upload, Users, DollarSign, Wallet, AlertCircle,
  MoreHorizontal, Eye, Pencil, Trash2, CalendarDays
} from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";
import { getStoredBookings, saveStoredBookings } from "../mock/mockBookings";
import { BookingDetailSheet, fmtVndCurrency, fmtDateVn } from "../components/BookingDetailSheet";
import { BookingCreateDialog } from "../components/BookingCreateDialog";
import { BookingImportDialog } from "../components/BookingImportDialog";
import { BookingDateRangePicker, type TimePresetKey } from "../components/BookingDateRangePicker";
import type { CustomerBooking, TinhTrangDatCho } from "../types/booking";

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none";

const columnWidthsMap: Record<number, number> = {
  0: 52,    // STT
  1: 140,   // Số phiếu GQUT
  2: 200,   // Tên KH
  3: 140,   // Ngày xác nhận
  4: 140,   // Ngày thanh toán
  5: 100,   // STT ưu tiên
  6: 160,   // Phải thu
  7: 160,   // Đã thu
  8: 190,   // Còn bổ sung
  9: 140,   // Hình thức TT
  10: 240,  // Nội dung
  11: 160,  // Đơn vị PP
  12: 140,  // NVTV
  13: 140,  // CMND/CCCD
  14: 120,  // Ngày cấp
  15: 180,  // Nơi cấp
  16: 220,  // ĐC thường trú cũ
  17: 220,  // ĐC thường trú mới
  18: 220,  // ĐC liên hệ cũ
  19: 220,  // ĐC liên hệ mới
  20: 100,  // Giới tính
  21: 120,  // Ngày sinh
  22: 140,  // SĐT
  23: 180,  // Email
  24: 140,  // Mối quan hệ
  25: 140,  // Tình trạng
  26: 56,   // Thao tác (...)
};

const columnHelper = createColumnHelper<CustomerBooking>();

function isDateInFilterRange(dateStr: string | null, filter: string, fromDate: string, toDate: string): boolean {
  if (filter === "all") return true;
  if (!dateStr) return false;

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return true;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return targetDate >= today && targetDate < new Date(today.getTime() + 86400000);
  }

  if (filter === "this_week") {
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return targetDate >= startOfWeek && targetDate < endOfWeek;
  }

  if (filter === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return targetDate >= startOfMonth && targetDate < endOfMonth;
  }

  if (filter === "this_quarter") {
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 1);
    return targetDate >= startOfQuarter && targetDate < endOfQuarter;
  }

  if (filter === "this_year") {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    return targetDate >= startOfYear && targetDate < endOfYear;
  }

  if (filter === "custom") {
    if (fromDate) {
      const from = new Date(fromDate);
      if (targetDate < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (targetDate > to) return false;
    }
    return true;
  }

  return true;
}

export function CustomerBookingListPage() {
  const navigate = useNavigate();
  const [bookingList, setBookingList] = useState<CustomerBooking[]>(() => getStoredBookings());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);
  const [bookingToEdit, setBookingToEdit] = useState<CustomerBooking | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Save to localStorage on state change
  useEffect(() => {
    saveStoredBookings(bookingList);
  }, [bookingList]);

  const handleOpenCreate = () => {
    setBookingToEdit(null);
    setCreateOpen(true);
  };

  const handleOpenEdit = (booking: CustomerBooking) => {
    setSheetOpen(false);
    setBookingToEdit(booking);
    setCreateOpen(true);
  };

  const handleSaveBooking = (savedBooking: CustomerBooking) => {
    setBookingList((prev) => {
      const index = prev.findIndex((b) => b.id === savedBooking.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedBooking;
        return updated;
      }
      return [savedBooking, ...prev];
    });
  };

  const handleStatusChange = (bookingId: string, newStatus: TinhTrangDatCho) => {
    setBookingList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, tinhTrang: newStatus } : b))
    );

    if (newStatus === "HOAN_TIEN" || newStatus === "CHUYEN_COC") {
      toast.success("Đã cập nhật trạng thái phiếu đặt chỗ", {
        description: "Có thể chuyển thông tin sang Danh sách khách hàng.",
        action: {
          label: "Chuyển sang DS KH",
          onClick: () => {
            navigate(`/customers?bookingId=${encodeURIComponent(bookingId)}`);
          },
        },
      });
    } else {
      toast.success("Đã cập nhật trạng thái phiếu đặt chỗ");
    }
  };

  const handleDeleteBooking = (id: string) => {
    setBookingList((prev) => prev.filter((b) => b.id !== id));
    toast.success("Đã xoá phiếu đặt chỗ");
  };

  // Dynamic filter for agency dropdown options
  const agencyOptions = useMemo(() => {
    const set = new Set<string>();
    bookingList.forEach((b) => {
      if (b.donViPhanPhoi) set.add(b.donViPhanPhoi);
    });
    return Array.from(set);
  }, [bookingList]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return bookingList.filter((b) => {
      const matchSearch =
        search === "" ||
        b.tenKhachHang.toLowerCase().includes(search.toLowerCase()) ||
        b.soPhieuGQUT.toLowerCase().includes(search.toLowerCase()) ||
        b.soDienThoai.includes(search) ||
        b.cmnd.includes(search);

      const matchStatus = statusFilter === "all" || b.tinhTrang === statusFilter;
      const matchAgency = agencyFilter === "all" || b.donViPhanPhoi === agencyFilter;
      const matchTime = isDateInFilterRange(b.ngayXacNhanGQUT || b.ngayThanhToan, timeFilter, fromDate, toDate);

      return matchSearch && matchStatus && matchAgency && matchTime;
    });
  }, [bookingList, search, statusFilter, agencyFilter, timeFilter, fromDate, toDate]);

  // Reactive KPI calculation
  const totalCount = filteredData.length;
  const totalPhaiThu = useMemo(() => filteredData.reduce((s, b) => s + b.phaiThu, 0), [filteredData]);
  const totalDaThu = useMemo(() => filteredData.reduce((s, b) => s + b.daThu, 0), [filteredData]);
  const totalConBoSung = useMemo(() => filteredData.reduce((s, b) => s + b.conBoSung, 0), [filteredData]);

  // Contiguous columns arrangement matching CustomerPage/LeadPage design tokens
  const columns = useMemo(
    () => [
      // 0. STT (Freeze left)
      columnHelper.accessor("stt", {
        header: "STT",
        cell: (info) => <span className="text-slate-500 font-mono text-center block">{info.getValue()}</span>,
      }),
      // 1. Số phiếu GQUT (Freeze left)
      columnHelper.accessor("soPhieuGQUT", {
        header: "Số phiếu GQUT",
        cell: (info) => <span className="font-mono font-semibold text-slate-900">{info.getValue()}</span>,
      }),
      // 2. Tên khách hàng (Freeze left)
      columnHelper.accessor("tenKhachHang", {
        header: "Tên khách hàng",
        cell: (info) => <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{info.getValue()}</span>,
      }),
      // 3. Ngày xác nhận GQUT
      columnHelper.accessor("ngayXacNhanGQUT", {
        header: "Ngày xác nhận GQUT",
        cell: (info) => fmtDateVn(info.getValue()),
      }),
      // 4. Ngày thanh toán
      columnHelper.accessor("ngayThanhToan", {
        header: "Ngày thanh toán",
        cell: (info) => fmtDateVn(info.getValue()),
      }),
      // 5. STT ưu tiên
      columnHelper.accessor("sttUuTien", {
        header: "STT ưu tiên",
        cell: (info) => <span className="text-center block font-medium text-slate-700">{info.getValue()}</span>,
      }),
      // 6. Phải thu
      columnHelper.accessor("phaiThu", {
        header: "Phải thu",
        cell: (info) => <span className="font-semibold text-slate-900 text-right block">{fmtVndCurrency(info.getValue())}</span>,
      }),
      // 7. Đã thu
      columnHelper.accessor("daThu", {
        header: "Đã thu",
        cell: (info) => {
          const val = info.getValue();
          const phaiThu = info.row.original.phaiThu;
          return (
            <span className={`font-semibold text-right block ${val >= phaiThu ? "text-emerald-600" : "text-slate-900"}`}>
              {fmtVndCurrency(val)}
            </span>
          );
        },
      }),
      // 8. Còn bổ sung
      columnHelper.accessor("conBoSung", {
        header: "Còn bổ sung",
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className={`text-right block ${val > 0 ? "font-extrabold text-red-600" : "font-medium text-slate-600"}`}>
              {fmtVndCurrency(val)}
            </span>
          );
        },
      }),
      // 9. Hình thức thanh toán
      columnHelper.accessor("hinhThucThanhToan", {
        header: "Hình thức TT",
        cell: (info) => (
          <Badge variant="outline" className="inline-flex h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 bg-slate-100 text-slate-700 ring-slate-200" style={{ fontWeight: 650 }}>
            {info.getValue() === "CHUYEN_KHOAN" ? "Chuyển khoản" : "Tiền mặt"}
          </Badge>
        ),
      }),
      // 10. Nội dung
      columnHelper.accessor("noiDung", {
        header: "Nội dung",
        cell: (info) => {
          const text = info.getValue() || "—";
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate max-w-[240px] block text-slate-600">{text}</span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p>{text}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      }),
      // 11. Đơn vị phân phối
      columnHelper.accessor("donViPhanPhoi", {
        header: "Đơn vị phân phối",
        cell: (info) => <span className="text-slate-700">{info.getValue() || "—"}</span>,
      }),
      // 12. NVTV
      columnHelper.accessor("nvtv", {
        header: "NVTV",
        cell: (info) => <span className="text-slate-700">{info.getValue() || "—"}</span>,
      }),
      // 13. CMND
      columnHelper.accessor("cmnd", {
        header: "CMND/CCCD",
        cell: (info) => <span className="font-mono text-slate-700">{info.getValue() || "—"}</span>,
      }),
      // 14. Ngày cấp
      columnHelper.accessor("ngayCap", {
        header: "Ngày cấp",
        cell: (info) => fmtDateVn(info.getValue()),
      }),
      // 15. Nơi cấp
      columnHelper.accessor("noiCap", {
        header: "Nơi cấp",
        cell: (info) => <span className="truncate max-w-[170px] block text-slate-600">{info.getValue() || "—"}</span>,
      }),
      // 16. Địa chỉ thường trú (cũ)
      columnHelper.accessor("diaChiThuongTruCu", {
        header: "ĐC thường trú (cũ)",
        cell: (info) => <span className="truncate max-w-[200px] block text-slate-600">{info.getValue() || "—"}</span>,
      }),
      // 17. Địa chỉ thường trú (mới)
      columnHelper.accessor("diaChiThuongTruMoi", {
        header: "ĐC thường trú (mới)",
        cell: (info) => <span className="truncate max-w-[200px] block text-[#475569]">{info.getValue() || "—"}</span>,
      }),
      // 18. Địa chỉ liên hệ (cũ)
      columnHelper.accessor("diaChiLienHeCu", {
        header: "ĐC liên hệ (cũ)",
        cell: (info) => <span className="truncate max-w-[200px] block text-slate-600">{info.getValue() || "—"}</span>,
      }),
      // 19. Địa chỉ liên hệ (mới)
      columnHelper.accessor("diaChiLienHeMoi", {
        header: "ĐC liên hệ (mới)",
        cell: (info) => <span className="truncate max-w-[200px] block text-slate-600">{info.getValue() || "—"}</span>,
      }),
      // 20. Giới tính
      columnHelper.accessor("gioiTinh", {
        header: "Giới tính",
        cell: (info) => {
          const g = info.getValue();
          return (
            <Badge variant="outline" className="inline-flex h-5 max-w-full items-center justify-center rounded-md border-transparent px-2 text-[10px] leading-none ring-1 bg-slate-50 text-slate-600 ring-slate-200">
              {g === "NAM" ? "Nam" : g === "NU" ? "Nữ" : "Khác"}
            </Badge>
          );
        },
      }),
      // 21. Ngày sinh
      columnHelper.accessor("ngaySinh", {
        header: "Ngày sinh",
        cell: (info) => fmtDateVn(info.getValue()),
      }),
      // 22. Số điện thoại
      columnHelper.accessor("soDienThoai", {
        header: "Số điện thoại",
        cell: (info) => <span className="font-mono text-slate-700">{info.getValue() || "—"}</span>,
      }),
      // 23. Email
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => {
          const email = info.getValue();
          return email ? (
            <a href={`mailto:${email}`} className="text-indigo-600 hover:underline truncate max-w-[160px] block">
              {email}
            </a>
          ) : (
            "—"
          );
        },
      }),
      // 24. Mối quan hệ
      columnHelper.accessor("moiQuanHe", {
        header: "Mối quan hệ",
        cell: (info) => <span className="truncate max-w-[120px] block text-slate-600">{info.getValue() || "—"}</span>,
      }),
      // 25. Tình trạng (Interactive Select Dropdown)
      columnHelper.accessor("tinhTrang", {
        header: "Tình trạng",
        cell: (info) => {
          const booking = info.row.original;
          const st = booking.tinhTrang;

          const statusStyleClass =
            st === "DAT_CHO"
              ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 hover:bg-sky-100/60"
              : st === "HOAN_TIEN"
              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 hover:bg-amber-100/60"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 hover:bg-emerald-100/60";

          return (
            <Select
              value={st}
              onValueChange={(val: CustomerBooking["tinhTrang"]) => handleStatusChange(booking.id, val)}
            >
              <SelectTrigger
                className={`h-5 w-fit min-w-[90px] items-center justify-between rounded-md border-0 px-2 text-[11px] font-semibold leading-none gap-1 shadow-none focus:ring-0 [&_svg]:size-3 cursor-pointer transition-all ${statusStyleClass}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                <SelectItem value="DAT_CHO" className="text-xs">Đặt chỗ</SelectItem>
                <SelectItem value="HOAN_TIEN" className="text-xs">Hoàn tiền</SelectItem>
                <SelectItem value="CHUYEN_COC" className="text-xs">Chuyển cọc</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      }),
      // 26. Thao tác (...) (Freeze right)
      columnHelper.display({
        id: "actions",
        header: () => <span className="text-center block text-slate-500 font-bold">...</span>,
        cell: (info) => {
          const booking = info.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Mở menu thao tác ${booking.tenKhachHang}`}
                  className="h-7 w-7 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300 mx-auto flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-white border border-[#E5EAF3] p-1 shadow-md rounded-md z-50">
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(booking);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                  Xem
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded cursor-pointer focus:bg-slate-50 focus:text-slate-700 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(booking);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded cursor-pointer focus:bg-red-50 focus:text-red-700 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBooking(booking.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  Xoá
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleRowClick = (booking: CustomerBooking) => {
    setSelectedBooking(booking);
    setSheetOpen(true);
  };

  const handleCreatedBooking = (newBooking: CustomerBooking) => {
    setBookingList((prev) => [newBooking, ...prev]);
  };

  const handleImportedBookings = (imported: CustomerBooking[]) => {
    setBookingList((prev) => [...imported, ...prev]);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span>Khách hàng</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span>Khách hàng đặt chỗ</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">DS khách hàng đặt chỗ</span>
          </nav>
          <h1 className="text-xl font-semibold leading-7 text-slate-950">DS khách hàng đặt chỗ</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="h-9 gap-2 bg-white">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import Excel</span>
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="h-9 gap-2 bg-slate-950 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4" />
            <span>Tạo mới</span>
          </Button>
        </div>
      </div>

      {/* 4 Reactive KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CoreMetricCard
          icon={Users}
          label="Tổng khách hàng"
          value={String(totalCount)}
          sub="Theo bộ lọc hiện tại"
          iconClass="bg-blue-50 text-blue-700"
        />
        <CoreMetricCard
          icon={DollarSign}
          label="Tổng phải thu"
          value={fmtVndCurrency(totalPhaiThu)}
          sub="Tổng giá trị phải thu"
          iconClass="bg-slate-100 text-slate-700"
        />
        <CoreMetricCard
          icon={Wallet}
          label="Tổng đã thu"
          value={fmtVndCurrency(totalDaThu)}
          sub="Đã thực thu thành công"
          iconClass="bg-emerald-50 text-emerald-700"
        />
        <CoreMetricCard
          icon={AlertCircle}
          label="Tổng bổ sung"
          value={fmtVndCurrency(totalConBoSung)}
          sub="Phải thu - Đã thu"
          iconClass={totalConBoSung > 0 ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-700"}
          valueClass={totalConBoSung > 0 ? "text-red-600 font-extrabold" : "text-slate-950 font-semibold"}
        />
      </div>

      {/* Main Table Card matching CustomerPage / LeadPage design system */}
      <Card className="max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50">
        {/* Table Panel Header */}
        <div className="border-b border-[#E5EAF3] bg-white px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Danh sách khách hàng đặt chỗ</h2>
            <p className="text-xs text-slate-500 mt-0.5">Hiển thị {filteredData.length} kết quả phù hợp</p>
          </div>
          <span className="inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] font-medium text-slate-600">
            {filteredData.length} phiếu
          </span>
        </div>

        {/* Toolbar with Time Filter */}
        <div className="border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo Tên, Số phiếu, SĐT, CMND..."
              className="h-9 w-full rounded-[8px] border border-[#E5EAF3] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Filter theo Thời gian Popover Calendar */}
          <div className="w-56 flex-shrink-0">
            <BookingDateRangePicker
              preset={timeFilter as TimePresetKey}
              fromDate={fromDate}
              toDate={toDate}
              onApply={(presetKey, fromStr, toStr) => {
                setTimeFilter(presetKey);
                setFromDate(fromStr || "");
                setToDate(toStr || "");
              }}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`${compactFilterTriggerClass} w-40 flex-shrink-0`}>
              <SelectValue placeholder="Tình trạng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tình trạng</SelectItem>
              <SelectItem value="DAT_CHO">Đặt chỗ</SelectItem>
              <SelectItem value="HOAN_TIEN">Hoàn tiền</SelectItem>
              <SelectItem value="CHUYEN_COC">Chuyển cọc</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agencyFilter} onValueChange={setAgencyFilter}>
            <SelectTrigger className={`${compactFilterTriggerClass} w-48 flex-shrink-0`}>
              <SelectValue placeholder="Đơn vị phân phối" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị PP</SelectItem>
              {agencyOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 27-Column Flat Table with Sticky Action Column */}
        <div className="max-h-[calc(100dvh-340px)] min-h-[420px] max-w-full overflow-auto bg-white">
          <Table className="min-w-max table-fixed border-separate border-spacing-0 text-xs">
            <TableHeader className="sticky top-0 z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, idx) => {
                    const isSTT = idx === 0;
                    const isSoPhieu = idx === 1;
                    const isTenKH = idx === 2;
                    const isActions = idx === 26;

                    const width = columnWidthsMap[idx] || 150;

                    let stickyClass = "";
                    let styleObj: React.CSSProperties = {
                      width: `${width}px`,
                      minWidth: `${width}px`,
                    };

                    if (isSTT) {
                      stickyClass = "sticky left-0 z-30 bg-[#F6F8FB]";
                      styleObj = { ...styleObj, left: 0 };
                    } else if (isSoPhieu) {
                      stickyClass = "sticky z-30 bg-[#F6F8FB]";
                      styleObj = { ...styleObj, left: "52px" };
                    } else if (isTenKH) {
                      stickyClass = "sticky z-30 bg-[#F6F8FB] shadow-[6px_0_12px_-10px_rgba(15,23,42,0.3)]";
                      styleObj = { ...styleObj, left: "192px" };
                    } else if (isActions) {
                      stickyClass = "sticky right-0 z-30 bg-[#F6F8FB] shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.3)]";
                      styleObj = { ...styleObj, right: 0 };
                    }

                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={styleObj}
                        className={`h-10 border-b border-r border-[#DDE5F0] bg-[#F6F8FB] px-3 py-2 text-left align-middle text-[11px] leading-4 text-slate-600 font-semibold cursor-pointer select-none ${stickyClass}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest(".td-status") || target.closest(".td-actions")) return;
                    handleRowClick(row.original);
                  }}
                  className="group h-11 cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                >
                  {row.getVisibleCells().map((cell, idx) => {
                    const isSTT = idx === 0;
                    const isSoPhieu = idx === 1;
                    const isTenKH = idx === 2;
                    const isTinhTrang = idx === 25;
                    const isActions = idx === 26;

                    const width = columnWidthsMap[idx] || 150;

                    let stickyClass = "";
                    let styleObj: React.CSSProperties = {
                      width: `${width}px`,
                      minWidth: `${width}px`,
                    };

                    if (isSTT) {
                      stickyClass = "sticky left-0 z-10 bg-white group-hover:bg-[#F8FAFC]";
                      styleObj = { ...styleObj, left: 0 };
                    } else if (isSoPhieu) {
                      stickyClass = "sticky z-10 bg-white group-hover:bg-[#F8FAFC]";
                      styleObj = { ...styleObj, left: "52px" };
                    } else if (isTenKH) {
                      stickyClass = "sticky z-10 bg-white group-hover:bg-[#F8FAFC] shadow-[6px_0_12px_-10px_rgba(15,23,42,0.3)]";
                      styleObj = { ...styleObj, left: "192px" };
                    } else if (isActions) {
                      stickyClass = "sticky right-0 z-10 bg-white group-hover:bg-[#F8FAFC] shadow-[-6px_0_12px_-10px_rgba(15,23,42,0.3)]";
                      styleObj = { ...styleObj, right: 0 };
                    }

                    return (
                      <TableCell
                        key={cell.id}
                        style={styleObj}
                        className={`h-11 border-b border-r border-[#E5EAF3] px-3 py-1.5 align-middle text-xs ${stickyClass} ${isTinhTrang ? "td-status" : ""} ${isActions ? "td-actions" : ""}`}
                        onClick={isTinhTrang || isActions ? (e) => e.stopPropagation() : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {table.getRowModel().rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={27} className="px-4 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-1">
                      <p className="text-sm font-medium text-slate-700">Không tìm thấy dữ liệu đặt chỗ phù hợp</p>
                      <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bỏ điều kiện lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Pagination Footer */}
        <div className="flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Hiển thị {table.getRowModel().rows.length} / {filteredData.length} phiếu đặt chỗ (Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1})
          </div>
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40"
                >
                  ‹
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 tabular-nums">
                  {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 rounded-[8px] p-0 text-slate-500 disabled:opacity-40"
                >
                  ›
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </Card>

      {/* Detail Drawer / Modal */}
      <BookingDetailSheet
        booking={selectedBooking}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleOpenEdit}
      />

      {/* Create / Edit Dialog */}
      <BookingCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        existingBookings={bookingList}
        onCreated={handleSaveBooking}
        bookingToEdit={bookingToEdit}
      />

      {/* Import Dialog */}
      <BookingImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        existingBookings={bookingList}
        onImportSuccess={handleImportedBookings}
      />
    </div>
  );
}
