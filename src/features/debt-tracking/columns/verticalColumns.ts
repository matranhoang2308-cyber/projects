import { ColumnDef } from "@tanstack/react-table";
import { Contract, Installment, NhomTuoiNo, TrangThaiDot } from "../types/contract";
import { formatCurrency, formatDate, formatPercent } from "../utils/format";

export interface VerticalRowData {
  id: string; // unique ID e.g., HD-001-coc, HD-001-1
  contract: Contract;
  installment: {
    soDot: number | "coc";      // 0 for "Cọc", 1..11 for installments
    phanTramTT: number;
    soTienPhaiThu: number;
    ngayDenHan: string | null;
    ngayDuKienTT: string | null;
    ngayThucTeTT: string | null;
    daThu: number;
    duThieuKyTruoc: number;
    boSung: number;
    conLai: number;
    tyLeKHTT: number;
    duBaoQuaHan: string | null;
    ghiChu?: string;
    soNgayQuaHan: number;
    nhomTuoiNo: NhomTuoiNo;
    trangThai: TrangThaiDot;
  };
  indexInContract: number;
  isFirstRowOfContract: boolean;
  totalInstallmentsCount: number;
}

// Map TinhTrangGD to Vietnamese label
export const TinhTrangGDLabels: Record<string, string> = {
  CHUA_KY_HDMB: "Chưa ký HĐMB",
  DA_KY_HDMB: "Đã ký HĐMB",
  DA_THANH_LY: "Đã thanh lý",
  CHUYEN_NHUONG: "Chuyển nhượng"
};

export const LoaiSanPhamLabels: Record<string, string> = {
  SKY_GARDEN: "Sky Garden",
  PENHOUSE: "Penhouse",
  SKY_VILLA_RESIDENCE: "Sky Villa Residence",
  DUPLEX_GARDEN: "Duplex Garden"
};

export const verticalColumns: ColumnDef<VerticalRowData>[] = [
  // 1. STT
  {
    id: "stt",
    header: "STT",
    cell: ({ row }) => row.index + 1,
  },
  // 2. Mã sản phẩm (Cột ưu tiên đầu tiên)
  {
    accessorKey: "contract.maSanPham",
    header: "Mã sản phẩm",
  },
  // 3. Tên khách hàng (Đứng ngay sau Mã sản phẩm)
  {
    accessorKey: "contract.tenKhachHang",
    header: "Tên khách hàng",
  },
  // 4. Phân khu
  {
    accessorKey: "contract.phanKhu",
    header: "Phân khu",
  },
  // 6. NVTV
  {
    accessorKey: "contract.donViPhanPhoi.nvtv",
    header: "NVTV",
  },
  // 7. TPKD
  {
    accessorKey: "contract.donViPhanPhoi.tpkd",
    header: "TPKD",
  },
  // 8. GĐS/SLK
  {
    accessorKey: "contract.donViPhanPhoi.gdsSlk",
    header: "GĐS/SLK",
  },
  // 9. Đơn vị
  {
    accessorKey: "contract.donViPhanPhoi.donVi",
    header: "Đơn vị",
  },
  // 10. Giai đoạn
  {
    accessorKey: "contract.sanPham.giaiDoan",
    header: "Giai đoạn",
  },
  // 11. Hướng/View
  {
    accessorKey: "contract.sanPham.huongView",
    header: "Hướng/View",
  },
  // 12. Loại SP
  {
    accessorKey: "contract.sanPham.loaiSp",
    header: "Loại SP",
    cell: ({ getValue }) => {
      const val = getValue() as string;
      return LoaiSanPhamLabels[val] || val;
    }
  },
  // 13. Đơn giá (sau CK)
  {
    accessorKey: "contract.giaTriHD.donGia",
    header: "Đơn giá",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 14. Giá bán (sau CK)
  {
    accessorKey: "contract.giaTriHD.giaBan",
    header: "Giá bán",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 15. Đợt TT
  {
    accessorKey: "installment.soDot",
    header: "Đợt TT",
    cell: ({ getValue }) => {
      const val = getValue();
      return val === "coc" || val === 0 ? "Cọc" : `Đợt ${val}`;
    }
  },
  // 16. % thanh toán
  {
    accessorKey: "installment.phanTramTT",
    header: "% thanh toán",
    cell: ({ getValue }) => formatPercent(getValue() as number),
  },
  // 17. Số tiền phải thu
  {
    accessorKey: "installment.soTienPhaiThu",
    header: "Số tiền phải thu",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 18. Ngày đến hạn
  {
    accessorKey: "installment.ngayDenHan",
    header: "Ngày đến hạn",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  // 19. Ngày dự kiến TT
  {
    accessorKey: "installment.ngayDuKienTT",
    header: "Ngày dự kiến TT",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  // 20. Ngày thực tế TT
  {
    accessorKey: "installment.ngayThucTeTT",
    header: "Ngày thực tế TT",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  // 21. Đã thu
  {
    accessorKey: "installment.daThu",
    header: "Đã thu",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 22. Dư thiếu kỳ trước
  {
    accessorKey: "installment.duThieuKyTruoc",
    header: "Dư thiếu kỳ trước",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 23. Bổ sung
  {
    accessorKey: "installment.boSung",
    header: "Bổ sung",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 24. Còn lại
  {
    accessorKey: "installment.conLai",
    header: "Còn lại",
    cell: ({ getValue }) => formatCurrency(getValue() as number),
  },
  // 25. Tỷ lệ KH thanh toán
  {
    accessorKey: "installment.tyLeKHTT",
    header: "Tỷ lệ KH thanh toán",
    cell: ({ getValue }) => formatPercent(getValue() as number),
  },
  // 26. Số ngày quá hạn
  {
    accessorKey: "installment.soNgayQuaHan",
    header: "Số ngày quá hạn",
    cell: ({ getValue }) => {
      const val = getValue() as number;
      return val <= 0 ? "—" : val;
    }
  },
  // 27. Nhóm tuổi nợ
  {
    accessorKey: "installment.nhomTuoiNo",
    header: "Nhóm tuổi nợ",
  },
  // 28. Trạng thái (Sticky right)
  {
    accessorKey: "installment.trangThai",
    header: "Trạng thái",
  },
  // 29. Ghi chú
  {
    accessorKey: "installment.ghiChu",
    header: "Ghi chú",
  },
  // 30. Hành động
  {
    id: "actions",
    header: "...",
  }
];
