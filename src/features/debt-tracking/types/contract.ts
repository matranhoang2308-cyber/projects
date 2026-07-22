export type TinhTrangGD =
  | 'CHUA_KY_HDMB'
  | 'DA_KY_HDMB'
  | 'DA_THANH_LY'
  | 'CHUYEN_NHUONG';

export type LoaiSanPham =
  | 'SHOPHOUSE'
  | 'BIET_THU'
  | 'CAN_HO'
  | 'DAT_NEN'
  | 'SKY_GARDEN'
  | 'PENHOUSE'
  | 'SKY_VILLA_RESIDENCE'
  | 'DUPLEX_GARDEN';

export type TrangThaiDot =
  | 'DA_THANH_TOAN'
  | 'QUA_HAN'
  | 'SAP_TOI_HAN';

export type NhomTuoiNo =
  | 'CHUA_QUA_HAN'
  | 'QH_1_30'
  | 'QH_31_60'
  | 'QH_61_90'
  | 'QH_TREN_90';

export interface DonViPhanPhoi {
  nvtv: string;      // Nhân viên tư vấn
  tpkd: string;      // Trưởng phòng kinh doanh
  gdsSlk: string;    // Giám đốc sàn / SLK
  donVi: string;     // Tên đơn vị phân phối
}

export interface ThongTinSanPham {
  giaiDoan: string;
  huongView: string;
  loaiSp: LoaiSanPham;
  donGia: number;    // giá ban hành /m2
  giaBan: number;    // giá ban hành tổng
}

export interface ChietKhauItem {
  phanTram: number;   // 0..1
  soTien: number;
  ghiChu?: string;    // PTTT / SL / ngày / giải / nội dung tùy loại
}

export interface ChietKhau {
  thanhToan: ChietKhauItem;
  gopNhom: ChietKhauItem;
  muaSi: ChietKhauItem;
  giuCho: ChietKhauItem;      // CK giữ chỗ - booking chủ nhật
  chuyenCoc: ChietKhauItem;
  bocTham: ChietKhauItem;
  khac: ChietKhauItem;
  tong: { phanTram: number; soTien: number };
}

export interface GiaTriHopDong {
  donGia: number;    // sau CK
  giaBan: number;    // sau CK
}

export interface KyCoc {
  ngayCoc: string | null;       // ISO date
  soTienCoc: number;
  phaiThu: number;
  daThu: number;
  bookingChuyenSangCoc: number;
  boSungCocMoi: number;
  conThu: number;
}

export interface Installment {
  soDot: number;              // 1..11
  phanTramTT: number;         // 0..1
  soTienPhaiThu: number;
  ngayDenHan: string | null;  // ISO
  ngayDuKienTT: string | null;
  ngayThucTeTT: string | null;
  daThu: number;
  duThieuKyTruoc: number;     // hoặc tiền cọc chuyển sang (Đợt 1)
  boSung: number;
  conLai: number;
  tyLeKHTT: number;           // 0..1, tỷ lệ KH đã thanh toán của đợt
  duBaoQuaHan: string | null; // Đợt ngang: forecast late date
  ghiChu?: string;

  // 3 trường DERIVED — compute từ ngày đến hạn / thực tế TT
  soNgayQuaHan?: number;      // âm nếu chưa đến hạn
  nhomTuoiNo?: NhomTuoiNo;
  trangThai?: TrangThaiDot;
}

export interface Contract {
  id: string;
  stt: number;
  tinhTrangGD: TinhTrangGD;
  gdDoiChieuThang: string;    // yyyy-MM cho view ngang
  phanKhu: string;
  maSanPham: string;
  tenKhachHang: string;
  donViPhanPhoi: DonViPhanPhoi;
  sanPham: ThongTinSanPham;
  chietKhau: ChietKhau;
  giaTriHD: GiaTriHopDong;
  kyCoc: KyCoc;
  ngayKyHDMB: string | null;
  installments: Installment[];   // 1..11

  // Tổng công nợ (derived nhưng cache)
  tongPhaiThu: number;
  tongDaThu: number;
  tongConLai: number;
  tyLeDaThu: number;    // 0..1
  tyLeConLai: number;   // 0..1

  // Mốc hoàn tất
  thoiGianCongChungCN: string | null; // dự kiến
  hoanTatDot: Record<number, string | null>; // { 1: '2025-03-15', 2: null, ... }
}
