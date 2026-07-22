import { ColumnDef } from "@tanstack/react-table";
import { Contract } from "../types/contract";
import { formatCurrency, formatDate, formatPercent, formatDateMonthYear } from "../utils/format";
import { TinhTrangGDLabels, LoaiSanPhamLabels } from "./verticalColumns";

// Helper to generate the 11-column template for installments (Đợt 1–11)
const buildInstallmentGroup = (dotIndex: number): ColumnDef<Contract>[] => {
  const dotLabel = `ĐỢT ${dotIndex}`;

  // #8 Special label: Đợt 1 là "Tiền cọc chuyển sang", Đợt 2–11 là "Dư thiếu đợt trước"
  const specialLabel = dotIndex === 1 ? "Trong đó › Tiền cọc chuyển sang" : "Trong đó › Dư thiếu đợt trước";

  const cols: ColumnDef<Contract>[] = [
    {
      id: `${dotLabel}_phanTramTT`,
      header: "%TT",
      accessorFn: (row) => row.installments[dotIndex - 1]?.phanTramTT,
      cell: ({ getValue }) => formatPercent(getValue() as number),
    },
    {
      id: `${dotLabel}_soTienPhaiThu`,
      header: "Số tiền",
      accessorFn: (row) => row.installments[dotIndex - 1]?.soTienPhaiThu,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: `${dotLabel}_ngayDenHan`,
      header: "Ngày đến hạn",
      accessorFn: (row) => row.installments[dotIndex - 1]?.ngayDenHan,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: `${dotLabel}_duBaoQuaHan`,
      header: "Dự báo quá hạn",
      accessorFn: (row) => row.installments[dotIndex - 1]?.duBaoQuaHan,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: `${dotLabel}_ngayDuKienTT`,
      header: "Ngày dự kiến TT",
      accessorFn: (row) => row.installments[dotIndex - 1]?.ngayDuKienTT,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: `${dotLabel}_ngayThucTeTT`,
      header: "Ngày thực tế TT",
      accessorFn: (row) => row.installments[dotIndex - 1]?.ngayThucTeTT,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: `${dotLabel}_daThu`,
      header: "Tổng đã thu",
      accessorFn: (row) => row.installments[dotIndex - 1]?.daThu,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: `${dotLabel}_duThieuKyTruoc`,
      header: specialLabel,
      accessorFn: (row) => row.installments[dotIndex - 1]?.duThieuKyTruoc,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: `${dotLabel}_boSung`,
      header: "Trong đó › Bổ sung",
      accessorFn: (row) => row.installments[dotIndex - 1]?.boSung,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: `${dotLabel}_conLai`,
      header: "Còn lại",
      accessorFn: (row) => row.installments[dotIndex - 1]?.conLai,
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    },
    {
      id: `${dotLabel}_tyLeKHTT`,
      header: "Tỷ lệ KH TT",
      accessorFn: (row) => row.installments[dotIndex - 1]?.tyLeKHTT,
      cell: ({ getValue }) => formatPercent(getValue() as number),
    },
  ];

  return cols;
};

// Main Horizontal Columns definition mapping 186 fields
export const horizontalColumns: ColumnDef<Contract>[] = [
  // ── Nhóm A: Định danh ──
  {
    id: "stt",
    header: "STT",
    accessorFn: (row, idx) => (idx != null ? idx + 1 : 1),
  },
  {
    id: "maSanPham",
    header: "Mã sản phẩm",
    accessorFn: (row) => row.maSanPham,
  },
  {
    id: "tenKhachHang",
    header: "Tên khách hàng",
    accessorFn: (row) => row.tenKhachHang,
  },
  {
    id: "gdDoiChieuThang",
    header: "GD đối chiếu tháng",
    accessorFn: (row) => row.gdDoiChieuThang,
    cell: ({ getValue }) => formatDateMonthYear(getValue() as string),
  },
  {
    id: "phanKhu",
    header: "Phân khu",
    accessorFn: (row) => row.phanKhu,
  },

  // ── Nhóm B: Thông tin đơn vị phân phối sản phẩm (4 cột) ──
  {
    id: "group_donViPhanPhoi",
    header: "THÔNG TIN ĐƠN VỊ PHÂN PHỐI SẢN PHẨM",
    columns: [
      {
        id: "nvtv",
        header: "NVTV",
        accessorFn: (row) => row.donViPhanPhoi.nvtv,
      },
      {
        id: "tpkd",
        header: "TPKD",
        accessorFn: (row) => row.donViPhanPhoi.tpkd,
      },
      {
        id: "gdsSlk",
        header: "GĐS/SLK",
        accessorFn: (row) => row.donViPhanPhoi.gdsSlk,
      },
      {
        id: "donVi",
        header: "Đơn vị",
        accessorFn: (row) => row.donViPhanPhoi.donVi,
      },
    ],
  },

  // ── Nhóm C: Thông tin sản phẩm (5 cột) ──
  {
    id: "group_sanPham",
    header: "THÔNG TIN SẢN PHẨM",
    columns: [
      {
        id: "giaiDoan",
        header: "Giai đoạn",
        accessorFn: (row) => row.sanPham.giaiDoan,
      },
      {
        id: "huongView",
        header: "Hướng/View",
        accessorFn: (row) => row.sanPham.huongView,
      },
      {
        id: "loaiSp",
        header: "Loại SP",
        accessorFn: (row) => row.sanPham.loaiSp,
        cell: ({ getValue }) => LoaiSanPhamLabels[getValue() as string] || (getValue() as string),
      },
      {
        id: "group_giaBanHanh",
        header: "GIÁ BAN HÀNH",
        columns: [
          {
            id: "donGiaBanHanh",
            header: "Đơn giá",
            accessorFn: (row) => row.sanPham.donGia,
            cell: ({ getValue }) => formatCurrency(getValue() as number),
          },
          {
            id: "giaBanBanHanh",
            header: "Giá bán",
            accessorFn: (row) => row.sanPham.giaBan,
            cell: ({ getValue }) => formatCurrency(getValue() as number),
          },
        ]
      }
    ],
  },

  // ── Nhóm D: Chiết khấu trừ vào giá (23 cột) ──
  {
    id: "group_chietKhau",
    header: "CHIẾT KHẤU TRỪ VÀO GIÁ",
    columns: [
      // CK thanh toán
      {
        id: "ck_thanhToan",
        header: "CK thanh toán",
        columns: [
          { id: "ck_tt_ghiChu", header: "PTTT", accessorFn: (row) => row.chietKhau.thanhToan.ghiChu },
          { id: "ck_tt_phanTram", header: "%", accessorFn: (row) => row.chietKhau.thanhToan.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_tt_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.thanhToan.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK gộp nhóm
      {
        id: "ck_gopNhom",
        header: "CK gộp nhóm",
        columns: [
          { id: "ck_gn_ghiChu", header: "SL/xin thêm", accessorFn: (row) => row.chietKhau.gopNhom.ghiChu },
          { id: "ck_gn_phanTram", header: "%", accessorFn: (row) => row.chietKhau.gopNhom.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_gn_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.gopNhom.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK mua sỉ
      {
        id: "ck_muaSi",
        header: "CK mua sỉ",
        columns: [
          { id: "ck_ms_ghiChu", header: "SL/xin thêm", accessorFn: (row) => row.chietKhau.muaSi.ghiChu },
          { id: "ck_ms_phanTram", header: "%", accessorFn: (row) => row.chietKhau.muaSi.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_ms_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.muaSi.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK giữ chỗ
      {
        id: "ck_giuCho",
        header: "CK giữ chỗ (booking CN)",
        columns: [
          { id: "ck_gc_ghiChu", header: "Ngày booking/xin thêm", accessorFn: (row) => row.chietKhau.giuCho.ghiChu },
          { id: "ck_gc_phanTram", header: "%", accessorFn: (row) => row.chietKhau.giuCho.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_gc_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.giuCho.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK chuyển cọc
      {
        id: "ck_chuyenCoc",
        header: "CK chuyển cọc",
        columns: [
          { id: "ck_cc_ghiChu", header: "Ngày cc/Xin thêm", accessorFn: (row) => row.chietKhau.chuyenCoc.ghiChu },
          { id: "ck_cc_phanTram", header: "%", accessorFn: (row) => row.chietKhau.chuyenCoc.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_cc_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.chuyenCoc.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK bốc thăm
      {
        id: "ck_bocTham",
        header: "CK bốc thăm (ngày EV)",
        columns: [
          { id: "ck_bt_ghiChu", header: "Giải/xin thêm", accessorFn: (row) => row.chietKhau.bocTham.ghiChu },
          { id: "ck_bt_phanTram", header: "%", accessorFn: (row) => row.chietKhau.bocTham.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_bt_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.bocTham.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // CK khác
      {
        id: "ck_khac",
        header: "CK khác",
        columns: [
          { id: "ck_kh_ghiChu", header: "Nội dung", accessorFn: (row) => row.chietKhau.khac.ghiChu },
          { id: "ck_kh_phanTram", header: "%", accessorFn: (row) => row.chietKhau.khac.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_kh_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.khac.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      },
      // Tổng chiết khấu
      {
        id: "ck_tong",
        header: "TỔNG CHIẾT KHẤU",
        columns: [
          { id: "ck_tong_phanTram", header: "%", accessorFn: (row) => row.chietKhau.tong.phanTram, cell: ({ getValue }) => formatPercent(getValue() as number) },
          { id: "ck_tong_soTien", header: "Số tiền", accessorFn: (row) => row.chietKhau.tong.soTien, cell: ({ getValue }) => formatCurrency(getValue() as number) },
        ]
      }
    ],
  },

  // ── Nhóm E: Giá trị hợp đồng (sau chiết khấu) (2 cột) ──
  {
    id: "group_giaTriHD",
    header: "GIÁ TRỊ HỢP ĐỒNG (Sau chiết khấu)",
    columns: [
      {
        id: "giaTriHD_donGia",
        header: "Đơn giá",
        accessorFn: (row) => row.giaTriHD.donGia,
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        id: "giaTriHD_giaBan",
        header: "Giá bán",
        accessorFn: (row) => row.giaTriHD.giaBan,
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
    ],
  },

  // ── Nhóm F: Ký phiếu cọc (7 cột) ──
  {
    id: "group_kyCoc",
    header: "KÝ PHIẾU CỌC",
    columns: [
      { id: "kyCoc_ngayCoc", header: "Ngày cọc", accessorFn: (row) => row.kyCoc.ngayCoc, cell: ({ getValue }) => formatDate(getValue() as string) },
      { id: "kyCoc_soTienCoc", header: "Số tiền cọc", accessorFn: (row) => row.kyCoc.soTienCoc, cell: ({ getValue }) => formatCurrency(getValue() as number) },
      { id: "kyCoc_phaiThu", header: "Phải thu", accessorFn: (row) => row.kyCoc.phaiThu, cell: ({ getValue }) => formatCurrency(getValue() as number) },
      { id: "kyCoc_daThu", header: "Đã thu", accessorFn: (row) => row.kyCoc.daThu, cell: ({ getValue }) => formatCurrency(getValue() as number) },
      { id: "kyCoc_bookingChuyenSangCoc", header: "Tiền booking chuyển sang cọc", accessorFn: (row) => row.kyCoc.bookingChuyenSangCoc, cell: ({ getValue }) => formatCurrency(getValue() as number) },
      { id: "kyCoc_boSungCocMoi", header: "Tiền bổ sung cọc mới", accessorFn: (row) => row.kyCoc.boSungCocMoi, cell: ({ getValue }) => formatCurrency(getValue() as number) },
      { id: "kyCoc_conThu", header: "Còn thu", accessorFn: (row) => row.kyCoc.conThu, cell: ({ getValue }) => formatCurrency(getValue() as number) },
    ],
  },

  // ── Nhóm G: Ký HĐ mua bán, Đợt 1 → 9 (100 cột) ──
  {
    id: "group_kyHDMB",
    header: "KÝ HĐ MUA BÁN",
    columns: [
      // ĐỢT 1 (Đặc biệt có Ngày ký HĐMB ở cột 48)
      {
        id: "dot1_group",
        header: "ĐỢT 1",
        columns: [
          {
            id: "ngayKyHDMB",
            header: "Ngày ký HĐMB",
            accessorFn: (row) => row.ngayKyHDMB,
            cell: ({ getValue }) => formatDate(getValue() as string),
          },
          ...buildInstallmentGroup(1),
        ],
      },
      // ĐỢT 2 -> 9
      ...Array.from({ length: 8 }, (_, i) => {
        const dot = i + 2;
        return {
          id: `dot${dot}_group`,
          header: `ĐỢT ${dot}`,
          columns: buildInstallmentGroup(dot),
        };
      }),
    ],
  },

  // ── Nhóm H: Ký HĐ chuyển nhượng, Đợt 10 → 11 (22 cột) ──
  {
    id: "group_kyHDCN",
    header: "KÝ HỢP ĐỒNG CHUYỂN NHƯỢNG",
    columns: Array.from({ length: 2 }, (_, i) => {
      const dot = i + 10;
      return {
        id: `dot${dot}_group`,
        header: `ĐỢT ${dot}`,
        columns: buildInstallmentGroup(dot),
      };
    }),
  },

  // ── Nhóm I: Tổng công nợ (5 cột) ──
  {
    id: "group_tongCongNo",
    header: "TỔNG CÔNG NỢ",
    columns: [
      {
        id: "tongPhaiThu",
        header: "Tổng phải thu",
        accessorFn: (row) => row.tongPhaiThu,
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        id: "group_tongDaThu",
        header: "TỔNG ĐÃ THU",
        columns: [
          {
            id: "tongDaThu_phanTram",
            header: "Tỷ lệ đã thu (%)",
            accessorFn: (row) => row.tyLeDaThu,
            cell: ({ getValue }) => formatPercent(getValue() as number),
          },
          {
            id: "tongDaThu_soTien",
            header: "Số tiền",
            accessorFn: (row) => row.tongDaThu,
            cell: ({ getValue }) => formatCurrency(getValue() as number),
          },
        ]
      },
      {
        id: "group_tongConLai",
        header: "TỔNG CÒN LẠI",
        columns: [
          {
            id: "tongConLai_phanTram",
            header: "Tỷ lệ còn lại (%)",
            accessorFn: (row) => row.tyLeConLai,
            cell: ({ getValue }) => formatPercent(getValue() as number),
          },
          {
            id: "tongConLai_soTien",
            header: "Số tiền",
            accessorFn: (row) => row.tongConLai,
            cell: ({ getValue }) => formatCurrency(getValue() as number),
          },
        ]
      },
    ],
  },

  // ── Nhóm J: Mốc hoàn tất (12 cột) ──
  {
    id: "thoiGianCongChungCN",
    header: "Thời gian công chứng CN (dự kiến)",
    accessorFn: (row) => row.thoiGianCongChungCN,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  ...Array.from({ length: 11 }, (_, i) => {
    const dot = i + 1;
    return {
      id: `hoanTatDot_${dot}`,
      header: `Hoàn tất Đợt ${dot}`,
      accessorFn: (row: Contract) => row.hoanTatDot[dot],
      cell: ({ getValue }: any) => formatDate(getValue() as string),
    };
  }),

  // ── Cột Thao tác (Sticky right) ──
  {
    id: "actions",
    header: "...",
  },
];
