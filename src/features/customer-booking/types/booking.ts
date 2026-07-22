export type TinhTrangDatCho = 'DAT_CHO' | 'HOAN_TIEN' | 'CHUYEN_COC';

export type HinhThucThanhToan = 'CHUYEN_KHOAN' | 'TIEN_MAT';

export type GioiTinh = 'NAM' | 'NU' | 'KHAC';

export interface CustomerBooking {
  // Nhóm A — Thông tin phiếu (11 field)
  id: string;
  stt: number;
  soPhieuGQUT: string;              // VD: "001/2025"
  ngayXacNhanGQUT: string;          // YYYY-MM-DD hoặc ISO date string
  ngayThanhToan: string | null;
  sttUuTien: string;                // VD: "001"
  tenKhachHang: string;
  phaiThu: number;
  daThu: number;
  conBoSung: number;                // = phaiThu - daThu, có thể âm (KH TT thừa)
  hinhThucThanhToan: HinhThucThanhToan;
  noiDung: string;

  // Nhóm B — Phân phối (2 field)
  donViPhanPhoi: string;
  nvtv: string;

  // Nhóm C — Thông tin KH (12 field)
  cmnd: string;
  ngayCap: string | null;
  noiCap: string;
  diaChiThuongTruCu: string;
  diaChiThuongTruMoi: string;
  diaChiLienHeCu: string;
  diaChiLienHeMoi: string;
  gioiTinh: GioiTinh;
  ngaySinh: string | null;
  soDienThoai: string;
  email: string;
  moiQuanHe: string;

  // Nhóm D — Trạng thái
  tinhTrang: TinhTrangDatCho;
}
