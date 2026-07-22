import { Contract, Installment } from "../types/contract";

// Helper to generate ISO string relative to current date (2026-07-21)
// today = 2026-07-21
const relativeDate = (days: number): string => {
  const baseDate = new Date("2026-07-21T09:00:00Z");
  baseDate.setDate(baseDate.getDate() + days);
  return baseDate.toISOString().split("T")[0];
};

export const mockContracts: Contract[] = [
  // 1. Đã thanh lý full - Căn hộ Sky Garden - Hợp đồng 1
  {
    id: "HD-001",
    stt: 1,
    tinhTrangGD: "DA_THANH_LY",
    gdDoiChieuThang: "2026-03",
    phanKhu: "Vitalis",
    maSanPham: "SG-A1-05",
    tenKhachHang: "Nguyễn Văn Hùng",
    donViPhanPhoi: {
      nvtv: "Trần Thị Mai",
      tpkd: "Lê Văn Tùng",
      gdsSlk: "Nguyễn Hoàng Nam",
      donVi: "Đại lý EraLand"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Đông Nam",
      loaiSp: "SKY_GARDEN",
      donGia: 45000000,
      giaBan: 3150000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0.02, soTien: 63000000, ghiChu: "Thanh toán nhanh" },
      gopNhom: { phanTram: 0.01, soTien: 31500000, ghiChu: "Mua chung nhóm" },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.03, soTien: 94500000 }
    },
    giaTriHD: {
      donGia: 43650000,
      giaBan: 3055500000
    },
    kyCoc: {
      ngayCoc: relativeDate(-180),
      soTienCoc: 100000000,
      phaiThu: 100000000,
      daThu: 100000000,
      bookingChuyenSangCoc: 50000000,
      boSungCocMoi: 50000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-170),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 458325000,
        ngayDenHan: relativeDate(-150),
        ngayDuKienTT: relativeDate(-152),
        ngayThucTeTT: relativeDate(-152),
        daThu: 458325000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null,
        ghiChu: "Đợt 1 đúng hạn"
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 458325000,
        ngayDenHan: relativeDate(-120),
        ngayDuKienTT: relativeDate(-121),
        ngayThucTeTT: relativeDate(-121),
        daThu: 458325000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.15,
        soTienPhaiThu: 458325000,
        ngayDenHan: relativeDate(-90),
        ngayDuKienTT: relativeDate(-90),
        ngayThucTeTT: relativeDate(-90),
        daThu: 458325000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 4,
        phanTramTT: 0.15,
        soTienPhaiThu: 458325000,
        ngayDenHan: relativeDate(-60),
        ngayDuKienTT: relativeDate(-60),
        ngayThucTeTT: relativeDate(-60),
        daThu: 458325000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 5,
        phanTramTT: 0.40,
        soTienPhaiThu: 1222200000,
        ngayDenHan: relativeDate(-30),
        ngayDuKienTT: relativeDate(-29),
        ngayThucTeTT: relativeDate(-29),
        daThu: 1222200000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null,
        ghiChu: "Nhận bàn giao căn hộ"
      }
    ],
    tongPhaiThu: 3055500000,
    tongDaThu: 3055500000,
    tongConLai: 0,
    tyLeDaThu: 1.0,
    tyLeConLai: 0,
    thoiGianCongChungCN: relativeDate(-20),
    hoanTatDot: { 1: relativeDate(-152), 2: relativeDate(-121), 3: relativeDate(-90), 4: relativeDate(-60), 5: relativeDate(-29) }
  },

  // 2. Đã thanh lý full - Penhouse - Hợp đồng 2
  {
    id: "HD-002",
    stt: 2,
    tinhTrangGD: "DA_THANH_LY",
    gdDoiChieuThang: "2026-04",
    phanKhu: "Vitalis",
    maSanPham: "PH-VIP-01",
    tenKhachHang: "Phạm Minh Quang",
    donViPhanPhoi: {
      nvtv: "Nguyễn Văn Hưng",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn VIP",
      huongView: "Skyview Trọn Cảnh",
      loaiSp: "PENHOUSE",
      donGia: 120000000,
      giaBan: 18000000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0.05, soTien: 900000000, ghiChu: "Thanh toán sớm 95%" },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.05, soTien: 900000000 }
    },
    giaTriHD: {
      donGia: 114000000,
      giaBan: 17100000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-120),
      soTienCoc: 1000000000,
      phaiThu: 1000000000,
      daThu: 1000000000,
      bookingChuyenSangCoc: 200000000,
      boSungCocMoi: 800000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-115),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.95,
        soTienPhaiThu: 16245000000, // Thanh toán nhanh
        ngayDenHan: relativeDate(-110),
        ngayDuKienTT: relativeDate(-112),
        ngayThucTeTT: relativeDate(-112),
        daThu: 16245000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null,
        ghiChu: "Thanh toán vượt tiến độ"
      },
      {
        soDot: 2,
        phanTramTT: 0.05,
        soTienPhaiThu: 855000000,
        ngayDenHan: relativeDate(-30),
        ngayDuKienTT: relativeDate(-32),
        ngayThucTeTT: relativeDate(-32),
        daThu: 855000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null,
        ghiChu: "Nhận sổ hồng"
      }
    ],
    tongPhaiThu: 17100000000,
    tongDaThu: 17100000000,
    tongConLai: 0,
    tyLeDaThu: 1.0,
    tyLeConLai: 0,
    thoiGianCongChungCN: relativeDate(-30),
    hoanTatDot: { 1: relativeDate(-112), 2: relativeDate(-32) }
  },

  // 3. Đang quá hạn - Nhóm 1-30 ngày (Trễ đợt 2: do trễ 15 ngày)
  {
    id: "HD-003",
    stt: 3,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-07",
    phanKhu: "Vitalis",
    maSanPham: "SG-A1-12",
    tenKhachHang: "Trần Văn Bằng",
    donViPhanPhoi: {
      nvtv: "Trần Thị Mai",
      tpkd: "Lê Văn Tùng",
      gdsSlk: "Nguyễn Hoàng Nam",
      donVi: "Đại lý EraLand"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Đông Bắc",
      loaiSp: "SKY_GARDEN",
      donGia: 44000000,
      giaBan: 3080000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0, soTien: 0 }
    },
    giaTriHD: {
      donGia: 44000000,
      giaBan: 3080000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-90),
      soTienCoc: 100000000,
      phaiThu: 100000000,
      daThu: 100000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 100000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-80),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.20,
        soTienPhaiThu: 616000000,
        ngayDenHan: relativeDate(-60),
        ngayDuKienTT: relativeDate(-60),
        ngayThucTeTT: relativeDate(-60),
        daThu: 616000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.20,
        soTienPhaiThu: 616000000,
        ngayDenHan: relativeDate(-15), // Quá hạn 15 ngày
        ngayDuKienTT: relativeDate(-10),
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 616000000,
        tyLeKHTT: 0,
        duBaoQuaHan: relativeDate(5),
        ghiChu: "Khách hàng khất nợ xin đóng muộn"
      },
      {
        soDot: 3,
        phanTramTT: 0.20,
        soTienPhaiThu: 616000000,
        ngayDenHan: relativeDate(30),
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 616000000,
        tyLeKHTT: 0,
        duBaoQuaHan: null
      }
    ],
    tongPhaiThu: 3080000000,
    tongDaThu: 716000000,
    tongConLai: 2364000000,
    tyLeDaThu: 0.232,
    tyLeConLai: 0.768,
    thoiGianCongChungCN: relativeDate(180),
    hoanTatDot: { 1: relativeDate(-60) }
  },

  // 4. Đang quá hạn - Nhóm 31-60 ngày (Đợt 3: trễ 45 ngày)
  {
    id: "HD-004",
    stt: 4,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-06",
    phanKhu: "Harmonie",
    maSanPham: "SV-B1-02",
    tenKhachHang: "Hoàng Minh Tuấn",
    donViPhanPhoi: {
      nvtv: "Nguyễn Thị Thùy",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Trực diện hồ bơi",
      loaiSp: "SKY_VILLA_RESIDENCE",
      donGia: 65000000,
      giaBan: 7800000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0.015, soTien: 117000000, ghiChu: "Chiết khấu sỉ mua 2 căn" },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.015, soTien: 117000000 }
    },
    giaTriHD: {
      donGia: 64025000,
      giaBan: 7683000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-180),
      soTienCoc: 200000000,
      phaiThu: 200000000,
      daThu: 200000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 200000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-170),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152450000,
        ngayDenHan: relativeDate(-150),
        ngayDuKienTT: relativeDate(-150),
        ngayThucTeTT: relativeDate(-150),
        daThu: 1152450000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152450000,
        ngayDenHan: relativeDate(-100),
        ngayDuKienTT: relativeDate(-98),
        ngayThucTeTT: relativeDate(-98),
        daThu: 1152450000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152450000,
        ngayDenHan: relativeDate(-45), // Quá hạn 45 ngày
        ngayDuKienTT: relativeDate(-40),
        ngayThucTeTT: null,
        daThu: 152450000, // Đóng một phần
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 1000000000, // Còn lại 1 tỷ
        tyLeKHTT: 0.132,
        duBaoQuaHan: relativeDate(-10),
        ghiChu: "Khách hàng hứa thu xếp tài chính trả nốt trước ngày 10/7"
      }
    ],
    tongPhaiThu: 7683000000,
    tongDaThu: 2657350000,
    tongConLai: 5025650000,
    tyLeDaThu: 0.346,
    tyLeConLai: 0.654,
    thoiGianCongChungCN: relativeDate(150),
    hoanTatDot: { 1: relativeDate(-150), 2: relativeDate(-98) }
  },

  // 5. Đang quá hạn - Nhóm >90 ngày (Đợt 2: trễ 95 ngày)
  {
    id: "HD-005",
    stt: 5,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-04",
    phanKhu: "Harmonie",
    maSanPham: "DG-B2-08",
    tenKhachHang: "Lê Hoàng Yến",
    donViPhanPhoi: {
      nvtv: "Vũ Quang Huy",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 2",
      huongView: "Sân vườn nội khu",
      loaiSp: "DUPLEX_GARDEN",
      donGia: 52000000,
      giaBan: 4680000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0.005, soTien: 23400000, ghiChu: "Booking chủ nhật vàng" },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.005, soTien: 23400000 }
    },
    giaTriHD: {
      donGia: 51740000,
      giaBan: 4656600000
    },
    kyCoc: {
      ngayCoc: relativeDate(-150),
      soTienCoc: 150000000,
      phaiThu: 150000000,
      daThu: 150000000,
      bookingChuyenSangCoc: 50000000,
      boSungCocMoi: 100000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-140),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 698490000,
        ngayDenHan: relativeDate(-120),
        ngayDuKienTT: relativeDate(-119),
        ngayThucTeTT: relativeDate(-119),
        daThu: 698490000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 698490000,
        ngayDenHan: relativeDate(-95), // Trễ 95 ngày
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 698490000,
        tyLeKHTT: 0,
        duBaoQuaHan: relativeDate(-60),
        ghiChu: "Khách hàng gặp sự cố tài chính đột xuất, chưa thu xếp được"
      }
    ],
    tongPhaiThu: 4656600000,
    tongDaThu: 848490000,
    tongConLai: 3808110000,
    tyLeDaThu: 0.182,
    tyLeConLai: 0.818,
    thoiGianCongChungCN: relativeDate(200),
    hoanTatDot: { 1: relativeDate(-119) }
  },

  // 6. Đúng tiến độ - Đang ở đợt 3
  {
    id: "HD-006",
    stt: 6,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-08",
    phanKhu: "Vitalis",
    maSanPham: "SG-A1-22",
    tenKhachHang: "Phan Thanh Sơn",
    donViPhanPhoi: {
      nvtv: "Trần Thị Mai",
      tpkd: "Lê Văn Tùng",
      gdsSlk: "Nguyễn Hoàng Nam",
      donVi: "Đại lý EraLand"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Đông Nam",
      loaiSp: "SKY_GARDEN",
      donGia: 46000000,
      giaBan: 3220000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0, soTien: 0 }
    },
    giaTriHD: {
      donGia: 46000000,
      giaBan: 3220000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-120),
      soTienCoc: 100000000,
      phaiThu: 100000000,
      daThu: 100000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 100000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-110),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 483000000,
        ngayDenHan: relativeDate(-90),
        ngayDuKienTT: relativeDate(-90),
        ngayThucTeTT: relativeDate(-90),
        daThu: 483000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 483000000,
        ngayDenHan: relativeDate(-45),
        ngayDuKienTT: relativeDate(-46),
        ngayThucTeTT: relativeDate(-46),
        daThu: 483000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.15,
        soTienPhaiThu: 483000000,
        ngayDenHan: relativeDate(15), // Chưa đến hạn (trong 15 ngày nữa)
        ngayDuKienTT: relativeDate(15),
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 483000000,
        tyLeKHTT: 0,
        duBaoQuaHan: null
      }
    ],
    tongPhaiThu: 3220000000,
    tongDaThu: 1066000000,
    tongConLai: 2154000000,
    tyLeDaThu: 0.331,
    tyLeConLai: 0.669,
    thoiGianCongChungCN: relativeDate(200),
    hoanTatDot: { 1: relativeDate(-90), 2: relativeDate(-46) }
  },

  // 7. Đúng tiến độ - Đang ở đợt 4
  {
    id: "HD-007",
    stt: 7,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-09",
    phanKhu: "Vitalis",
    maSanPham: "PH-VIP-05",
    tenKhachHang: "Đặng Hoàng Việt",
    donViPhanPhoi: {
      nvtv: "Nguyễn Văn Hưng",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn VIP",
      huongView: "Toàn cảnh công viên",
      loaiSp: "PENHOUSE",
      donGia: 110000000,
      giaBan: 14300000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0.01, soTien: 143000000, ghiChu: "Chiết khấu ngày lễ" },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.01, soTien: 143000000 }
    },
    giaTriHD: {
      donGia: 108900000,
      giaBan: 14157000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-150),
      soTienCoc: 1000000000,
      phaiThu: 1000000000,
      daThu: 1000000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 1000000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-140),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 2123550000,
        ngayDenHan: relativeDate(-120),
        ngayDuKienTT: relativeDate(-120),
        ngayThucTeTT: relativeDate(-120),
        daThu: 2123550000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 2123550000,
        ngayDenHan: relativeDate(-80),
        ngayDuKienTT: relativeDate(-80),
        ngayThucTeTT: relativeDate(-80),
        daThu: 2123550000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.15,
        soTienPhaiThu: 2123550000,
        ngayDenHan: relativeDate(-40),
        ngayDuKienTT: relativeDate(-39),
        ngayThucTeTT: relativeDate(-39),
        daThu: 2123550000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 4,
        phanTramTT: 0.15,
        soTienPhaiThu: 2123550000,
        ngayDenHan: relativeDate(45), // Chưa tới hạn
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 2123550000,
        tyLeKHTT: 0,
        duBaoQuaHan: null
      }
    ],
    tongPhaiThu: 14157000000,
    tongDaThu: 7370650000,
    tongConLai: 6786350000,
    tyLeDaThu: 0.521,
    tyLeConLai: 0.479,
    thoiGianCongChungCN: relativeDate(250),
    hoanTatDot: { 1: relativeDate(-120), 2: relativeDate(-80), 3: relativeDate(-39) }
  },

  // 8. Đúng tiến độ - Đang ở đợt 5
  {
    id: "HD-008",
    stt: 8,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-10",
    phanKhu: "Harmonie",
    maSanPham: "SV-B1-05",
    tenKhachHang: "Lưu Văn Đạt",
    donViPhanPhoi: {
      nvtv: "Nguyễn Thị Thùy",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Góc ngắm hồ bơi",
      loaiSp: "SKY_VILLA_RESIDENCE",
      donGia: 63000000,
      giaBan: 7560000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0.01, soTien: 75600000, ghiChu: "Khách mua chung tòa" },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.01, soTien: 75600000 }
    },
    giaTriHD: {
      donGia: 62370000,
      giaBan: 7484400000
    },
    kyCoc: {
      ngayCoc: relativeDate(-180),
      soTienCoc: 200000000,
      phaiThu: 200000000,
      daThu: 200000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 200000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-170),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.10,
        soTienPhaiThu: 748440000,
        ngayDenHan: relativeDate(-150),
        ngayDuKienTT: relativeDate(-150),
        ngayThucTeTT: relativeDate(-150),
        daThu: 748440000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.10,
        soTienPhaiThu: 748440000,
        ngayDenHan: relativeDate(-120),
        ngayDuKienTT: relativeDate(-120),
        ngayThucTeTT: relativeDate(-120),
        daThu: 748440000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.10,
        soTienPhaiThu: 748440000,
        ngayDenHan: relativeDate(-90),
        ngayDuKienTT: relativeDate(-90),
        ngayThucTeTT: relativeDate(-90),
        daThu: 748440000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 4,
        phanTramTT: 0.10,
        soTienPhaiThu: 748440000,
        ngayDenHan: relativeDate(-60),
        ngayDuKienTT: relativeDate(-59),
        ngayThucTeTT: relativeDate(-59),
        daThu: 748440000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 5,
        phanTramTT: 0.10,
        soTienPhaiThu: 748440000,
        ngayDenHan: relativeDate(30), // Chưa tới hạn
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 748440000,
        tyLeKHTT: 0,
        duBaoQuaHan: null
      }
    ],
    tongPhaiThu: 7484400000,
    tongDaThu: 3193760000,
    tongConLai: 4290640000,
    tyLeDaThu: 0.427,
    tyLeConLai: 0.573,
    thoiGianCongChungCN: relativeDate(220),
    hoanTatDot: { 1: relativeDate(-150), 2: relativeDate(-120), 3: relativeDate(-90), 4: relativeDate(-59) }
  },

  // 9. Mới ký cọc - Chưa đến đợt 1 (Hợp đồng 1)
  {
    id: "HD-009",
    stt: 9,
    tinhTrangGD: "CHUA_KY_HDMB",
    gdDoiChieuThang: "2026-08",
    phanKhu: "Harmonie",
    maSanPham: "DG-B2-02",
    tenKhachHang: "Lâm Thị Cúc",
    donViPhanPhoi: {
      nvtv: "Vũ Quang Huy",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 2",
      huongView: "Sân vườn nội khu",
      loaiSp: "DUPLEX_GARDEN",
      donGia: 51000000,
      giaBan: 4590000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0, soTien: 0 }
    },
    giaTriHD: {
      donGia: 51000000,
      giaBan: 4590000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-5), // Mới ký cọc 5 ngày trước
      soTienCoc: 150000000,
      phaiThu: 150000000,
      daThu: 150000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 150000000,
      conThu: 0
    },
    ngayKyHDMB: null,
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 688500000,
        ngayDenHan: relativeDate(25), // Chưa đến hạn (trong 25 ngày tới)
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 150000000, // cọc khấu trừ sang đợt 1
        boSung: 0,
        conLai: 688500000,
        tyLeKHTT: 0,
        duBaoQuaHan: null,
        ghiChu: "Chờ ký HĐMB"
      }
    ],
    tongPhaiThu: 4590000000,
    tongDaThu: 150000000,
    tongConLai: 4440000000,
    tyLeDaThu: 0.033,
    tyLeConLai: 0.967,
    thoiGianCongChungCN: null,
    hoanTatDot: {}
  },

  // 10. Mới ký cọc - Chưa đến đợt 1 (Hợp đồng 2)
  {
    id: "HD-010",
    stt: 10,
    tinhTrangGD: "CHUA_KY_HDMB",
    gdDoiChieuThang: "2026-08",
    phanKhu: "Vitalis",
    maSanPham: "SG-A1-30",
    tenKhachHang: "Vũ Đình Long",
    donViPhanPhoi: {
      nvtv: "Trần Thị Mai",
      tpkd: "Lê Văn Tùng",
      gdsSlk: "Nguyễn Hoàng Nam",
      donVi: "Đại lý EraLand"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Tây Nam",
      loaiSp: "SKY_GARDEN",
      donGia: 43000000,
      giaBan: 3010000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0, soTien: 0 }
    },
    giaTriHD: {
      donGia: 43000000,
      giaBan: 3010000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-2), // Ký cọc 2 ngày trước
      soTienCoc: 100000000,
      phaiThu: 100000000,
      daThu: 100000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 100000000,
      conThu: 0
    },
    ngayKyHDMB: null,
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 451500000,
        ngayDenHan: relativeDate(28),
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 100000000,
        boSung: 0,
        conLai: 451500000,
        tyLeKHTT: 0,
        duBaoQuaHan: null,
        ghiChu: "Chuẩn bị ký HĐMB"
      }
    ],
    tongPhaiThu: 3010000000,
    tongDaThu: 100000000,
    tongConLai: 2910000000,
    tyLeDaThu: 0.033,
    tyLeConLai: 0.967,
    thoiGianCongChungCN: null,
    hoanTatDot: {}
  },

  // 11. Chuyển nhượng - Có đợt 10-11
  {
    id: "HD-011",
    stt: 11,
    tinhTrangGD: "CHUYEN_NHUONG",
    gdDoiChieuThang: "2026-07",
    phanKhu: "Vitalis",
    maSanPham: "PH-VIP-03",
    tenKhachHang: "Mai Thu Trang",
    donViPhanPhoi: {
      nvtv: "Nguyễn Văn Hưng",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn VIP",
      huongView: "Hồ điều hòa",
      loaiSp: "PENHOUSE",
      donGia: 115000000,
      giaBan: 14950000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0.02, soTien: 299000000, ghiChu: "Thanh toán nhanh đợt 1" },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0.02, soTien: 299000000 }
    },
    giaTriHD: {
      donGia: 112700000,
      giaBan: 14651000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-200),
      soTienCoc: 1000000000,
      phaiThu: 1000000000,
      daThu: 1000000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 1000000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-190),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.10,
        soTienPhaiThu: 1465100000,
        ngayDenHan: relativeDate(-170),
        ngayDuKienTT: relativeDate(-170),
        ngayThucTeTT: relativeDate(-170),
        daThu: 1465100000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 9,
        phanTramTT: 0.40,
        soTienPhaiThu: 5860400000,
        ngayDenHan: relativeDate(-120),
        ngayDuKienTT: relativeDate(-122),
        ngayThucTeTT: relativeDate(-122),
        daThu: 5860400000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 10,
        phanTramTT: 0.20,
        soTienPhaiThu: 2930200000,
        ngayDenHan: relativeDate(-80),
        ngayDuKienTT: relativeDate(-80),
        ngayThucTeTT: relativeDate(-80),
        daThu: 2930200000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null,
        ghiChu: "Ký hợp đồng chuyển nhượng"
      },
      {
        soDot: 11,
        phanTramTT: 0.10,
        soTienPhaiThu: 1465100000,
        ngayDenHan: relativeDate(-10), // Trễ 10 ngày
        ngayDuKienTT: null,
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 1465100000,
        tyLeKHTT: 0,
        duBaoQuaHan: relativeDate(10),
        ghiChu: "Khách nhận chuyển nhượng làm hồ sơ vay"
      }
    ],
    tongPhaiThu: 14651000000,
    tongDaThu: 11255700000,
    tongConLai: 3395300000,
    tyLeDaThu: 0.768,
    tyLeConLai: 0.232,
    thoiGianCongChungCN: relativeDate(-12),
    hoanTatDot: { 1: relativeDate(-170), 9: relativeDate(-122), 10: relativeDate(-80) }
  },

  // 12. Sắp đến hạn - Đợt tiếp theo sắp đến hạn trong vòng 7 ngày (Đợt 3: đến hạn sau 3 ngày)
  {
    id: "HD-012",
    stt: 12,
    tinhTrangGD: "DA_KY_HDMB",
    gdDoiChieuThang: "2026-07",
    phanKhu: "Harmonie",
    maSanPham: "SV-B1-09",
    tenKhachHang: "Trịnh Quốc Huy",
    donViPhanPhoi: {
      nvtv: "Nguyễn Thị Thùy",
      tpkd: "Bùi Thị Thảo",
      gdsSlk: "Vũ Quốc Việt",
      donVi: "Đại lý SunReal"
    },
    sanPham: {
      giaiDoan: "Giai đoạn 1",
      huongView: "Đông Nam",
      loaiSp: "SKY_VILLA_RESIDENCE",
      donGia: 64000000,
      giaBan: 7680000000
    },
    chietKhau: {
      thanhToan: { phanTram: 0, soTien: 0 },
      gopNhom: { phanTram: 0, soTien: 0 },
      muaSi: { phanTram: 0, soTien: 0 },
      giuCho: { phanTram: 0, soTien: 0 },
      chuyenCoc: { phanTram: 0, soTien: 0 },
      bocTham: { phanTram: 0, soTien: 0 },
      khac: { phanTram: 0, soTien: 0 },
      tong: { phanTram: 0, soTien: 0 }
    },
    giaTriHD: {
      donGia: 64000000,
      giaBan: 7680000000
    },
    kyCoc: {
      ngayCoc: relativeDate(-100),
      soTienCoc: 200000000,
      phaiThu: 200000000,
      daThu: 200000000,
      bookingChuyenSangCoc: 0,
      boSungCocMoi: 200000000,
      conThu: 0
    },
    ngayKyHDMB: relativeDate(-90),
    installments: [
      {
        soDot: 1,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152000000,
        ngayDenHan: relativeDate(-70),
        ngayDuKienTT: relativeDate(-70),
        ngayThucTeTT: relativeDate(-70),
        daThu: 1152000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 2,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152000000,
        ngayDenHan: relativeDate(-30),
        ngayDuKienTT: relativeDate(-30),
        ngayThucTeTT: relativeDate(-30),
        daThu: 1152000000,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 0,
        tyLeKHTT: 1.0,
        duBaoQuaHan: null
      },
      {
        soDot: 3,
        phanTramTT: 0.15,
        soTienPhaiThu: 1152000000,
        ngayDenHan: relativeDate(3), // Sắp đến hạn (còn 3 ngày nữa)
        ngayDuKienTT: relativeDate(3),
        ngayThucTeTT: null,
        daThu: 0,
        duThieuKyTruoc: 0,
        boSung: 0,
        conLai: 1152000000,
        tyLeKHTT: 0,
        duBaoQuaHan: null,
        ghiChu: "Kế toán đã gọi nhắc nợ lần 1"
      }
    ],
    tongPhaiThu: 7680000000,
    tongDaThu: 2504000000,
    tongConLai: 5176000000,
    tyLeDaThu: 0.326,
    tyLeConLai: 0.674,
    thoiGianCongChungCN: relativeDate(180),
    hoanTatDot: { 1: relativeDate(-70), 2: relativeDate(-30) }
  }
];

// Enrich mock contracts to ensure all 11 installments & milestones are fully populated for horizontal view demo
mockContracts.forEach((contract) => {
  const contractVal = contract.giaTriHD.giaBan || 3000000000;
  const existingCount = contract.installments.length;

  for (let i = existingCount + 1; i <= 11; i++) {
    const dueDateDays = (i - existingCount) * 35 + 15;
    const pct = i === 11 ? 0.05 : 0.08;
    const amt = Math.round(contractVal * pct);
    const isPaid = contract.tinhTrangGD === "DA_THANH_LY";

    contract.installments.push({
      soDot: i,
      phanTramTT: pct,
      soTienPhaiThu: amt,
      ngayDenHan: relativeDate(dueDateDays),
      ngayDuKienTT: relativeDate(dueDateDays),
      ngayThucTeTT: isPaid ? relativeDate(dueDateDays - 2) : null,
      daThu: isPaid ? amt : 0,
      duThieuKyTruoc: 0,
      boSung: 0,
      conLai: isPaid ? 0 : amt,
      tyLeKHTT: isPaid ? 1.0 : 0,
      duBaoQuaHan: null,
      ghiChu: i === 11 ? "Đợt 11 bàn giao GCN QSDĐ" : `Đợt ${i} theo tiến độ xây dựng`,
    });

    if (isPaid && !contract.hoanTatDot[i]) {
      contract.hoanTatDot[i] = relativeDate(dueDateDays - 2);
    }
  }
});

