import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  TrendingUp,
  AlertCircle,
  Wallet,
  Users,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  Filter,
} from "lucide-react";

import {
  customers,
  formatVND,
  getCustomerTotalValue,
  getCustomerTotalPaid,
  getCustomerWorstStatus,
  getCustomerTotalLateFee,
} from "@/data/mockDataCongNo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoreMetricCard } from "@/components/crm/CoreMetricCard";

// ─── Imports from debt-tracking ──────────────────────────────────────────────
import { mockContracts } from "../debt-tracking/mock/mockContracts";
import { VerticalRowData } from "../debt-tracking/columns/verticalColumns";
import { ViewToggle } from "../debt-tracking/components/ViewToggle";
import { DebtTableVertical } from "../debt-tracking/components/DebtTableVertical";
import { DebtTableHorizontal } from "../debt-tracking/components/DebtTableHorizontal";
import { computeDaysOverdue, computeStatus, computeAgingBucket } from "../debt-tracking/utils/derived";
import * as XLSX from "xlsx";

import { cn } from "@/components/ui/utils";

const compactFilterTriggerClass = "h-9 rounded-[8px] border-[#E5EAF3] bg-white px-3 text-xs text-slate-700 shadow-none hover:bg-slate-50";
const getFilterTriggerClass = (isActive: boolean) =>
  cn(
    "h-9 rounded-[8px] px-3 text-xs transition-all shadow-2xs font-medium cursor-pointer",
    isActive
      ? "bg-blue-50/90 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700 font-semibold ring-1 ring-blue-400/30"
      : "border-[#E5EAF3] bg-white text-slate-700 hover:bg-slate-50"
  );
const debtPanelClass = "max-w-full gap-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm shadow-slate-200/50";
const debtPanelHeaderClass = "border-b border-[#E5EAF3] bg-white px-4 py-3";
const debtPanelToolbarClass = "border-b border-[#E5EAF3] bg-[#F8FAFC] px-3 py-2.5";
const debtPanelFooterClass = "flex min-h-11 flex-col gap-2 border-t border-[#E5EAF3] bg-[#F8FAFC] px-4 py-2.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between";
const debtPanelMetaClass = "inline-flex h-6 items-center rounded-md border border-[#E5EAF3] bg-[#F8FAFC] px-2.5 text-[11px] leading-none text-slate-600";

export function DebtDashboard() {
  const navigate = useNavigate();

  // 1. Chế độ xem (Dọc / Ngang) & Lưu vào localStorage
  const [viewMode, setViewMode] = useState<"vertical" | "horizontal">(() => {
    const saved = localStorage.getItem("debt-tracking-view-mode");
    return (saved === "vertical" || saved === "horizontal") ? saved : "vertical";
  });

  useEffect(() => {
    localStorage.setItem("debt-tracking-view-mode", viewMode);
  }, [viewMode]);

  // 2. State các bộ lọc
  const [search, setSearch] = useState("");
  const [selectedMaSanPham, setSelectedMaSanPham] = useState<string>("ALL");
  const [selectedTinhTrangGD, setSelectedTinhTrangGD] = useState<string>("ALL");
  const [selectedDot, setSelectedDot] = useState<string>("ALL");
  const [selectedLoaiSp, setSelectedLoaiSp] = useState<string>("ALL");
  const [selectedPhanKhu, setSelectedPhanKhu] = useState<string>("ALL");
  const [selectedTrangThaiNo, setSelectedTrangThaiNo] = useState<string>("ALL");

  // ── Derived stats (cho KPI cards từ mock data công nợ cũ)
  const allContracts = customers.flatMap((c) => c.contracts);
  const totalValue = allContracts.reduce((s, ct) => s + ct.contractValue, 0);
  const totalPaid = allContracts.reduce((s, ct) => s + ct.paidAmount, 0);
  const overdueCustomers = customers.filter(
    (c) => getCustomerWorstStatus(c) === "overdue"
  );
  const overdueContracts = allContracts.filter((ct) => ct.status === "overdue");
  const totalLateFee = customers.reduce(
    (s, c) => s + getCustomerTotalLateFee(c),
    0
  );

  // 3. Chuẩn bị & Flatten dữ liệu công nợ HDMB (1 dòng = 1 đợt)
  const allRowData = useMemo<VerticalRowData[]>(() => {
    const rows: VerticalRowData[] = [];

    mockContracts.forEach((contract) => {
      const contractRows: any[] = [];

      // Dòng Cọc
      if (contract.kyCoc) {
        const conLai = contract.kyCoc.conThu;
        const soNgayQuaHan = computeDaysOverdue(contract.kyCoc.ngayCoc, conLai);
        const trangThai = computeStatus(contract.kyCoc.ngayCoc, conLai);
        const nhomTuoiNo = computeAgingBucket(soNgayQuaHan);

        contractRows.push({
          soDot: "coc",
          phanTramTT: contract.kyCoc.phaiThu / (contract.giaTriHD.giaBan || 1),
          soTienPhaiThu: contract.kyCoc.phaiThu,
          ngayDenHan: contract.kyCoc.ngayCoc,
          ngayDuKienTT: contract.kyCoc.ngayCoc,
          ngayThucTeTT: contract.kyCoc.daThu >= contract.kyCoc.phaiThu ? contract.kyCoc.ngayCoc : null,
          daThu: contract.kyCoc.daThu,
          duThieuKyTruoc: 0,
          boSung: contract.kyCoc.boSungCocMoi,
          conLai: conLai,
          tyLeKHTT: contract.kyCoc.daThu >= contract.kyCoc.phaiThu ? 1.0 : contract.kyCoc.daThu / (contract.kyCoc.phaiThu || 1),
          duBaoQuaHan: null,
          ghiChu: "Ký phiếu đặt cọc",
          soNgayQuaHan,
          trangThai,
          nhomTuoiNo,
        });
      }

      // Các dòng đợt
      contract.installments.forEach((inst) => {
        const soNgayQuaHan = computeDaysOverdue(inst.ngayDenHan, inst.conLai);
        const trangThai = computeStatus(inst.ngayDenHan, inst.conLai);
        const nhomTuoiNo = computeAgingBucket(soNgayQuaHan);

        contractRows.push({
          ...inst,
          soNgayQuaHan,
          trangThai,
          nhomTuoiNo,
        });
      });

      // Flat map và đánh dấu merge cells
      contractRows.forEach((rowInst, idx) => {
        rows.push({
          id: `${contract.id}-${rowInst.soDot}`,
          contract,
          installment: rowInst,
          indexInContract: idx,
          isFirstRowOfContract: idx === 0,
          totalInstallmentsCount: contractRows.length,
        });
      });
    });

    return rows;
  }, []);

  // 4. Lấy danh sách duy nhất phục vụ bộ lọc dropdown
  const uniqueProducts = useMemo(() => {
    const list = new Set<string>();
    mockContracts.forEach((c) => {
      if (c.maSanPham) list.add(c.maSanPham);
    });
    return Array.from(list).sort();
  }, []);

  const uniquePhanKhuList = useMemo(() => {
    const list = new Set<string>();
    mockContracts.forEach((c) => {
      if (c.phanKhu) list.add(c.phanKhu);
    });
    return Array.from(list).sort();
  }, []);

  // 5. Reset bộ lọc
  const handleResetFilters = () => {
    setSearch("");
    setSelectedMaSanPham("ALL");
    setSelectedTinhTrangGD("ALL");
    setSelectedDot("ALL");
    setSelectedLoaiSp("ALL");
    setSelectedPhanKhu("ALL");
    setSelectedTrangThaiNo("ALL");
  };

  // 6. Thực hiện bộ lọc kết hợp
  const filteredRowData = useMemo(() => {
    return allRowData.filter((row) => {
      // Gõ tìm kiếm theo tên KH hoặc mã căn
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = row.contract.tenKhachHang.toLowerCase().includes(query);
        const matchCode = row.contract.maSanPham.toLowerCase().includes(query);
        if (!matchName && !matchCode) return false;
      }

      // Bộ lọc: Mã sản phẩm
      if (selectedMaSanPham !== "ALL" && row.contract.maSanPham !== selectedMaSanPham) {
        return false;
      }

      // Bộ lọc: Tình trạng giao dịch
      if (selectedTinhTrangGD !== "ALL" && row.contract.tinhTrangGD !== selectedTinhTrangGD) {
        return false;
      }

      // Bộ lọc: Đợt thanh toán
      if (selectedDot !== "ALL") {
        if (selectedDot === "coc" && row.installment.soDot !== "coc") return false;
        if (selectedDot !== "coc" && row.installment.soDot !== parseInt(selectedDot)) return false;
      }

      // Bộ lọc: Loại sản phẩm
      if (selectedLoaiSp !== "ALL" && row.contract.sanPham.loaiSp !== selectedLoaiSp) {
        return false;
      }

      // Bộ lọc: Phân khu
      if (selectedPhanKhu !== "ALL" && row.contract.phanKhu !== selectedPhanKhu) {
        return false;
      }

      // Bộ lọc: Trạng thái công nợ
      if (selectedTrangThaiNo !== "ALL" && row.installment.trangThai !== selectedTrangThaiNo) {
        return false;
      }

      return true;
    });
  }, [allRowData, search, selectedMaSanPham, selectedTinhTrangGD, selectedDot, selectedLoaiSp, selectedPhanKhu, selectedTrangThaiNo]);

  const filteredContracts = useMemo(() => {
    return mockContracts.filter((contract) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = contract.tenKhachHang.toLowerCase().includes(query);
        const matchCode = contract.maSanPham.toLowerCase().includes(query);
        if (!matchName && !matchCode) return false;
      }

      if (selectedMaSanPham !== "ALL" && contract.maSanPham !== selectedMaSanPham) {
        return false;
      }

      if (selectedTinhTrangGD !== "ALL" && contract.tinhTrangGD !== selectedTinhTrangGD) {
        return false;
      }

      if (selectedLoaiSp !== "ALL" && contract.sanPham.loaiSp !== selectedLoaiSp) {
        return false;
      }

      if (selectedPhanKhu !== "ALL" && contract.phanKhu !== selectedPhanKhu) {
        return false;
      }

      if (selectedDot !== "ALL") {
        const hasDot = contract.installments.some((inst) => {
          if (selectedDot === "coc") return false;
          return inst.soDot === parseInt(selectedDot);
        });
        const hasCoc = selectedDot === "coc" && !!contract.kyCoc;
        if (!hasDot && !hasCoc) return false;
      }

      if (selectedTrangThaiNo !== "ALL") {
        const matchesCoc = contract.kyCoc && computeStatus(contract.kyCoc.ngayCoc, contract.kyCoc.conThu) === selectedTrangThaiNo;
        const matchesInst = contract.installments.some((inst) => computeStatus(inst.ngayDenHan, inst.conLai) === selectedTrangThaiNo);
        if (!matchesCoc && !matchesInst) return false;
      }

      return true;
    });
  }, [search, selectedMaSanPham, selectedTinhTrangGD, selectedLoaiSp, selectedPhanKhu, selectedDot, selectedTrangThaiNo]);

  const activeFilters = useMemo(() => ({
    maSanPham: selectedMaSanPham !== "ALL",
    dot: viewMode === "vertical" && selectedDot !== "ALL",
    loaiSp: selectedLoaiSp !== "ALL",
    phanKhu: selectedPhanKhu !== "ALL",
    trangThaiNo: selectedTrangThaiNo !== "ALL",
    search: search.trim() !== "",
  }), [selectedMaSanPham, selectedDot, selectedLoaiSp, selectedPhanKhu, selectedTrangThaiNo, search, viewMode]);

  // NOTE: Tạm thời ẩn lớp thứ 2 (/debt/customer/:customerId - CustomerContracts).
  // Khi bấm từ bảng ngoài sẽ vào thẳng Chi tiết Hợp đồng.
  // Lớp 2 vẫn được giữ nguyên trong codebase và đường dẫn routes.tsx (KHÔNG XOÁ).
  // Để mở lại lớp thứ 2 sau này, chỉ cần đổi flag bên dưới thành true.
  const ENABLE_LAYER_2_CUSTOMER_OVERVIEW = false;

  // 7. Logic click hàng để chuyển tiếp tới chi tiết
  const handleRowClick = (rowData: VerticalRowData) => {
    // Ánh xạ mã hợp đồng "HD-001" -> customerId "1", contractId "c1-1"
    const numPart = rowData.contract.id.replace("HD-", "");
    const customerId = String(parseInt(numPart, 10));
    const contractId = `c${customerId}-1`;

    if (ENABLE_LAYER_2_CUSTOMER_OVERVIEW) {
      navigate(`/debt/customer/${customerId}`);
    } else {
      navigate(`/debt/customer/${customerId}/contract/${contractId}`);
    }
  };

  // 8. Xuất Excel
  const handleExportExcel = () => {
    const exportData = filteredRowData.map((row, idx) => ({
      "STT": idx + 1,
      "Tình trạng GD": row.contract.tinhTrangGD === "DA_KY_HDMB" ? "Đã ký HĐMB" : row.contract.tinhTrangGD === "CHUA_KY_HDMB" ? "Chưa ký HĐMB" : row.contract.tinhTrangGD === "DA_THANH_LY" ? "Đã thanh lý" : "Chuyển nhượng",
      "Phân khu": row.contract.phanKhu,
      "Mã sản phẩm": row.contract.maSanPham,
      "Tên khách hàng": row.contract.tenKhachHang,
      "NVTV": row.contract.donViPhanPhoi.nvtv,
      "Đơn vị": row.contract.donViPhanPhoi.donVi,
      "Loại SP": row.contract.sanPham.loaiSp,
      "Giá bán (sau CK)": row.contract.giaTriHD.giaBan,
      "Đợt TT": row.installment.soDot === "coc" ? "Cọc" : `Đợt ${row.installment.soDot}`,
      "% thanh toán": row.installment.phanTramTT,
      "Số tiền phải thu": row.installment.soTienPhaiThu,
      "Ngày đến hạn": row.installment.ngayDenHan,
      "Đã thu": row.installment.daThu,
      "Còn lại": row.installment.conLai,
      "Số ngày quá hạn": row.installment.soNgayQuaHan,
      "Trạng thái": row.installment.trangThai === "DA_THANH_TOAN" ? "Đã thanh toán" : row.installment.trangThai === "QUA_HAN" ? "Quá hạn" : "Sắp đến hạn",
      "Ghi chú": row.installment.ghiChu || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CongNo_HDMB");
    XLSX.writeFile(workbook, "Danh_Sach_Cong_No_HDMB.xlsx");
  };

  return (
    <div className="min-h-full space-y-4 p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-slate-950 font-bold text-xl" style={{ fontWeight: 750 }}>
            Quản lý công nợ
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến độ thanh toán và tình trạng nợ theo từng đợt của hợp đồng mua bán (HDMB)
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-9 text-xs border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"
            onClick={handleExportExcel}
            aria-label="Xuất Excel"
            title="Xuất Excel"
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CoreMetricCard
          icon={Users}
          label="Tổng khách hàng"
          value={`${customers.length} khách`}
          sub={`${allContracts.length} hợp đồng · ${overdueCustomers.length} quá hạn`}
          iconClass="bg-slate-100"
        />
        <CoreMetricCard
          icon={Wallet}
          label="Tổng giá trị hợp đồng"
          value={formatVND(totalValue)}
          sub={`${allContracts.length} hợp đồng`}
          iconClass="bg-blue-50"
        />
        <CoreMetricCard
          icon={TrendingUp}
          label="Đã thu"
          value={formatVND(totalPaid)}
          sub={`${Math.round((totalPaid / totalValue) * 100)}% tổng danh mục`}
          iconClass="bg-emerald-50"
          valueClass="text-emerald-700"
        />
        <CoreMetricCard
          icon={AlertCircle}
          label="Phạt trễ hạn (ước tính)"
          value={formatVND(totalLateFee)}
          sub={`${overdueContracts.length} hợp đồng quá hạn`}
          iconClass="bg-red-50"
          valueClass={totalLateFee > 0 ? "text-red-600" : "text-foreground"}
        />
      </div>

      {/* Customer / Installment Table Panel */}
      <Card className={debtPanelClass}>
        <div className={debtPanelHeaderClass}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Danh sách công nợ đợt thanh toán</h2>
              <p className="mt-0.5 text-xs leading-5 text-slate-500">
                {filteredRowData.length} đợt phù hợp bộ lọc · Bấm vào dòng để xem chi tiết thanh toán của hợp đồng
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className={debtPanelMetaClass}>{filteredRowData.length} đợt thanh toán</span>
              <span className="hidden text-xs text-slate-500 lg:inline">Bấm vào dòng để xem chi tiết</span>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className={debtPanelToolbarClass}>
          <div className="flex flex-col gap-3.5">
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo Tên khách hàng hoặc Mã sản phẩm..."
                className="pl-9 h-9 text-xs w-full bg-white border border-[#E5EAF3]"
              />
            </div>

            {/* Selector Filters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {/* Lọc Mã sản phẩm */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", activeFilters.maSanPham ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400")}>
                    Mã sản phẩm
                  </span>
                  {activeFilters.maSanPham && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <Select value={selectedMaSanPham} onValueChange={setSelectedMaSanPham}>
                  <SelectTrigger className={getFilterTriggerClass(activeFilters.maSanPham)}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả sản phẩm</SelectItem>
                    {uniqueProducts.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc Đợt thanh toán */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", activeFilters.dot ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400")}>
                    Đợt thanh toán {viewMode === "horizontal" && <span className="text-[9px] font-normal text-slate-400 lowercase italic">(hiện đủ 11 đợt)</span>}
                  </span>
                  {activeFilters.dot && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <Select disabled={viewMode === "horizontal"} value={viewMode === "horizontal" ? "ALL" : selectedDot} onValueChange={setSelectedDot}>
                  <SelectTrigger className={cn(getFilterTriggerClass(activeFilters.dot), viewMode === "horizontal" && "opacity-60 cursor-not-allowed bg-slate-100/80 text-slate-400 dark:bg-slate-900/50")}>
                    <SelectValue placeholder={viewMode === "horizontal" ? "Hiện đủ 11 đợt" : "Tất cả"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả đợt</SelectItem>
                    <SelectItem value="coc">Cọc</SelectItem>
                    {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        Đợt {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc Loại sản phẩm */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", activeFilters.loaiSp ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400")}>
                    Loại sản phẩm
                  </span>
                  {activeFilters.loaiSp && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <Select value={selectedLoaiSp} onValueChange={setSelectedLoaiSp}>
                  <SelectTrigger className={getFilterTriggerClass(activeFilters.loaiSp)}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả loại SP</SelectItem>
                    <SelectItem value="SKY_GARDEN">Sky Garden</SelectItem>
                    <SelectItem value="PENHOUSE">Penhouse</SelectItem>
                    <SelectItem value="SKY_VILLA_RESIDENCE">Sky Villa Residence</SelectItem>
                    <SelectItem value="DUPLEX_GARDEN">Duplex Garden</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc Phân khu */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", activeFilters.phanKhu ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400")}>
                    Phân khu
                  </span>
                  {activeFilters.phanKhu && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <Select value={selectedPhanKhu} onValueChange={setSelectedPhanKhu}>
                  <SelectTrigger className={getFilterTriggerClass(activeFilters.phanKhu)}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả phân khu</SelectItem>
                    <SelectItem value="Vitalis">Vitalis</SelectItem>
                    <SelectItem value="Harmonie">Harmonie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Lọc Trạng thái công nợ */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", activeFilters.trangThaiNo ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400")}>
                    Trạng thái công nợ
                  </span>
                  {activeFilters.trangThaiNo && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <Select value={selectedTrangThaiNo} onValueChange={setSelectedTrangThaiNo}>
                  <SelectTrigger className={getFilterTriggerClass(activeFilters.trangThaiNo)}>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="DA_THANH_TOAN">Đã thanh toán</SelectItem>
                    <SelectItem value="QUA_HAN">Quá hạn</SelectItem>
                    <SelectItem value="SAP_TOI_HAN">Sắp đến hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleResetFilters}
                variant="ghost"
                className="h-8 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 border border-dashed border-slate-200 px-3 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950">
          {viewMode === "vertical" ? (
            <DebtTableVertical
              data={filteredRowData}
              onRowClick={handleRowClick}
              isFilteredByMaSp={selectedMaSanPham !== "ALL"}
              activeFilters={activeFilters}
            />
          ) : (
            <DebtTableHorizontal
              data={filteredContracts}
              activeFilters={activeFilters}
              onRowClick={(contract) => {
                const numPart = contract.id.replace("HD-", "");
                const customerId = String(parseInt(numPart, 10));
                const contractId = `c${customerId}-1`;
                if (ENABLE_LAYER_2_CUSTOMER_OVERVIEW) {
                  navigate(`/debt/customer/${customerId}`);
                } else {
                  navigate(`/debt/customer/${customerId}/contract/${contractId}`);
                }
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
