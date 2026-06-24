export type HdmbField = { key: string; column: number; label: string; section: string };
export type HdmbRecord = { id: string; values: Record<string, string> };

export const hdmbImportFields: HdmbField[] = [
  {
    "key": "c1",
    "column": 1,
    "label": "STT",
    "section": "THÔNG TIN CHUNG"
  },
  {
    "key": "c2",
    "column": 2,
    "label": "MÃ KH (SH1)",
    "section": "THÔNG TIN KHÁCH HÀNG"
  },
  {
    "key": "c3",
    "column": 3,
    "label": "HỌ TÊN KHÁCH HÀNG (SH1)",
    "section": "THÔNG TIN KHÁCH HÀNG"
  },
  {
    "key": "c4",
    "column": 4,
    "label": "SH1- SỐ CCCD/HC",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c5",
    "column": 5,
    "label": "SH1- SỐ CCCD/HC",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c6",
    "column": 6,
    "label": "SH1- NGÀY CẤP",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c7",
    "column": 7,
    "label": "SH1- CƠ QUAN CẤP",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c8",
    "column": 8,
    "label": "SH1- NGÀY THÁNG NĂM SINH",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c9",
    "column": 9,
    "label": "SH1- GIỚI TÍNH",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c10",
    "column": 10,
    "label": "SH1- ĐỊA CHỈ TT (CŨ)",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c11",
    "column": 11,
    "label": "SH1- ĐỊA CHỈ TT (MỚI)",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c12",
    "column": 12,
    "label": "SH1- SĐT",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c13",
    "column": 13,
    "label": "SH1- EMAIL",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c14",
    "column": 14,
    "label": "SH1- NGHỀ NGHIỆP",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c15",
    "column": 15,
    "label": "SH1- ĐỊA CHỈ LIÊN HỆ (CŨ)",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c16",
    "column": 16,
    "label": "SH1- ĐỊA CHỈ LIÊN HỆ (MỚI)",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c17",
    "column": 17,
    "label": "SH1- SĐT",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c18",
    "column": 18,
    "label": "SH1- EMAIL",
    "section": "SH1 - KHÁCH HÀNG SỞ HỮU 1"
  },
  {
    "key": "c19",
    "column": 19,
    "label": "SH2 - HỌ VÀ TÊN KHÁCH HÀNG",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c20",
    "column": 20,
    "label": "SH2 - SỐ CCCD/HC (LẦN 1)",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c21",
    "column": 21,
    "label": "SH2 - NGÀY CẤP",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c22",
    "column": 22,
    "label": "SH2 - CƠ QUAN CẤP",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c23",
    "column": 23,
    "label": "SH2 - NGÀY THÁNG NĂM SINH",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c24",
    "column": 24,
    "label": "SH2 - GIỚI TÍNH",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c25",
    "column": 25,
    "label": "SH2 - ĐỊA CHỈ TT (CŨ)",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c26",
    "column": 26,
    "label": "SH2 - ĐỊA CHỈ TT (MỚI)",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c27",
    "column": 27,
    "label": "SH2 - SĐT",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c28",
    "column": 28,
    "label": "SH2 - EMAIL",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c29",
    "column": 29,
    "label": "SH2 - NGHỀ NGHIỆP",
    "section": "SH2 - ĐỒNG SỞ HỮU"
  },
  {
    "key": "c30",
    "column": 30,
    "label": "KHDN - TÊN CÔNG TY MUA",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c31",
    "column": 31,
    "label": "KHDN - GIẤY PHÉP ĐKKD",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c32",
    "column": 32,
    "label": "KHDN - MÃ SỐ THUẾ",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c33",
    "column": 33,
    "label": "KHDN - NGÀY CẤP GP ĐKKD",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c34",
    "column": 34,
    "label": "KHDN - CƠ QUAN CẤP",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c35",
    "column": 35,
    "label": "KHDN - ĐỊA CHỈ TRỤ SỞ (CŨ)",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c36",
    "column": 36,
    "label": "KHDN - ĐỊA CHỈ TRỤ SỞ (MỚI)",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c37",
    "column": 37,
    "label": "KHDN - NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c38",
    "column": 38,
    "label": "KHDN - SỐ CCCD/HC",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c39",
    "column": 39,
    "label": "KHDN - NGÀY CẤP",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c40",
    "column": 40,
    "label": "KHDN - CƠ QUAN CẤP",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c41",
    "column": 41,
    "label": "KHDN - NGÀY THÁNG NĂM SINH",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c42",
    "column": 42,
    "label": "KHDN - GIỚI TÍNH",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c43",
    "column": 43,
    "label": "KHDN - SĐT",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c44",
    "column": 44,
    "label": "KHDN - EMAIL",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c45",
    "column": 45,
    "label": "KHDN - NGHỀ NGHIỆP",
    "section": "KHÁCH HÀNG DOANH NGHIỆP"
  },
  {
    "key": "c46",
    "column": 46,
    "label": "Địa chỉ nhận thông báo_ liên hệ (cũ)",
    "section": "THÔNG TIN NHẬN THÔNG BÁO"
  },
  {
    "key": "c47",
    "column": 47,
    "label": "Địa chỉ nhận thông báo_ liên hệ (mới)",
    "section": "THÔNG TIN NHẬN THÔNG BÁO"
  },
  {
    "key": "c48",
    "column": 48,
    "label": "Người nhận",
    "section": "THÔNG TIN NHẬN THÔNG BÁO"
  },
  {
    "key": "c49",
    "column": 49,
    "label": "SĐT nhận thông báo",
    "section": "THÔNG TIN NHẬN THÔNG BÁO"
  },
  {
    "key": "c50",
    "column": 50,
    "label": "Email nhận thông báo",
    "section": "THÔNG TIN NHẬN THÔNG BÁO"
  },
  {
    "key": "c51",
    "column": 51,
    "label": "MÃ CĂN HỘ THƯƠNG MẠI",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c52",
    "column": 52,
    "label": "THÁP",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c53",
    "column": 53,
    "label": "TẦNG",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c54",
    "column": 54,
    "label": "MÃ CĂN HỘ PHÁP LÝ (LÊN HĐMB)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c55",
    "column": 55,
    "label": "LOẠI CĂN HỘ",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c56",
    "column": 56,
    "label": "SỐ PHÒNG NGỦ",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c57",
    "column": 57,
    "label": "VIEW",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c58",
    "column": 58,
    "label": "HƯỚNG VIEW",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c59",
    "column": 59,
    "label": "DIỆN TÍCH TIM TƯỜNG (M2)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c60",
    "column": 60,
    "label": "DIỆN TÍCH THÔNG THỦY (M2)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c61",
    "column": 61,
    "label": "DIỆN TÍCH SÂN VƯỜN THÊM",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c62",
    "column": 62,
    "label": "DIỆN TÍCH KHÁC",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c63",
    "column": 63,
    "label": "ĐƠN GIÁ BÁN THUẦN (CHƯA VAT)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c64",
    "column": 64,
    "label": "GIÁ BÁN THUẦN (CHƯA VAT)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c65",
    "column": 65,
    "label": "GIÁ TRỊ CÓ ĐƯỢC TỪ VIỆC ĐẶT MÃ CĂN HỘ",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c66",
    "column": 66,
    "label": "TÌNH TRẠNG BÀN GIAO",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c67",
    "column": 67,
    "label": "GÓI HOÀN THIỆN VÀ NỘI THẤT",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c68",
    "column": 68,
    "label": "GIÁ BÁN THUẦN HOÀN THIỆN/ THÔ THEO LOẠI CĂN HỘ (CHƯA VAT)",
    "section": "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG"
  },
  {
    "key": "c69",
    "column": 69,
    "label": "PTTT",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c70",
    "column": 70,
    "label": "CK THANH TOÁN (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c71",
    "column": 71,
    "label": "CK THANH TOÁN (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c72",
    "column": 72,
    "label": "CK MUA SỈ (SỐ LƯỢNG)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c73",
    "column": 73,
    "label": "CK MUA SỈ (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c74",
    "column": 74,
    "label": "CK MUA SỈ (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c75",
    "column": 75,
    "label": "NGÀY GQUT (CK GQUT SỚM)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c76",
    "column": 76,
    "label": "CK GIỮ QUT SỚM (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c77",
    "column": 77,
    "label": "CK GIỮ QUT SỚM (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c78",
    "column": 78,
    "label": "NGÀY CỌC (CK CHUYỂN CỌC)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c79",
    "column": 79,
    "label": "CK CHUYỂN CỌC (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c80",
    "column": 80,
    "label": "CK CHUYỂN CỌC (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c81",
    "column": 81,
    "label": "CK KHÁC (NỘI DUNG)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c82",
    "column": 82,
    "label": "CK KHÁC (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c83",
    "column": 83,
    "label": "CK KHÁC (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c84",
    "column": 84,
    "label": "TỔNG CHIẾT KHẤU (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c85",
    "column": 85,
    "label": "TỔNG CHIẾT KHẤU (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c86",
    "column": 86,
    "label": "ĐƠN GIÁ BÁN (SAU CHIẾT KHẤU, CHƯA VAT VÀ PBT)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c87",
    "column": 87,
    "label": "GIÁ BÁN (SAU CHIẾT KHẤU, CHƯA VAT VÀ PBT)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c88",
    "column": 88,
    "label": "THUẾ GTGT (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c89",
    "column": 89,
    "label": "THUẾ GTGT (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c90",
    "column": 90,
    "label": "PHÍ BẢO TRÌ (%)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c91",
    "column": 91,
    "label": "PHÍ BẢO TRÌ (SỐ TIỀN)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c92",
    "column": 92,
    "label": "ĐƠN GIÁ BÁN CĂN HỘ (ĐÃ BAO GỒM VAT)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c93",
    "column": 93,
    "label": "GIÁ BÁN CĂN HỘ (ĐÃ BAO GỒM VAT VÀ PBT)",
    "section": "THÔNG TIN CHÍNH SÁCH BÁN HÀNG"
  },
  {
    "key": "c94",
    "column": 94,
    "label": "TIỀN CỌC PHẢI THU",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c95",
    "column": 95,
    "label": "TIỀN CỌC ĐÃ THU",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c96",
    "column": 96,
    "label": "NGÀY THANH TOÁN CỌC",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c97",
    "column": 97,
    "label": "SỐ TIỀN CỌC ĐÃ THANH TOÁN",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c98",
    "column": 98,
    "label": "NGÀY THANH TOÁN CỌC MỚI",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c99",
    "column": 99,
    "label": "SỐ TIỀN CỌC MỚI",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c100",
    "column": 100,
    "label": "TIỀN MẶT",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c101",
    "column": 101,
    "label": "CHUYỂN KHOẢN",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c102",
    "column": 102,
    "label": "NGÀY DỰ KIẾN BỔ SUNG TIỀN CỌC",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c103",
    "column": 103,
    "label": "SỐ TIỀN CỌC BỔ SUNG",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c104",
    "column": 104,
    "label": "NỘI DUNG - PTTT",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c105",
    "column": 105,
    "label": "TỶ LỆ PTTT",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c106",
    "column": 106,
    "label": "NGÀY KÝ HĐMB (THEO QUI ĐỊNH)",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c107",
    "column": 107,
    "label": "NGÀY KÝ HĐMB (GIA HẠN)",
    "section": "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB"
  },
  {
    "key": "c108",
    "column": 108,
    "label": "LOẠI KH - NHÓM KH (NB, MQH, SỈ…)",
    "section": "LOẠI KHÁCH HÀNG"
  },
  {
    "key": "c154",
    "column": 154,
    "label": "NHÂN VIÊN TƯ VẤN",
    "section": "THÔNG TIN NHÂN VIÊN GIAO DỊCH"
  },
  {
    "key": "c155",
    "column": 155,
    "label": "MÃ ACCOUNT",
    "section": "THÔNG TIN NHÂN VIÊN GIAO DỊCH"
  },
  {
    "key": "c156",
    "column": 156,
    "label": "ĐƠN VỊ BÁN HÀNG",
    "section": "THÔNG TIN NHÂN VIÊN GIAO DỊCH"
  },
  {
    "key": "c157",
    "column": 157,
    "label": "SỐ THỎA THUẬN CỌC",
    "section": "CHỨNG TỪ KÈM THEO"
  },
  {
    "key": "c158",
    "column": 158,
    "label": "SỐ PHIẾU THÔNG TIN SẢN PHẨM",
    "section": "CHỨNG TỪ KÈM THEO"
  },
  {
    "key": "c159",
    "column": 159,
    "label": "SỐ PHIẾU XNCK",
    "section": "CHỨNG TỪ KÈM THEO"
  },
  {
    "key": "c160",
    "column": 160,
    "label": "GHI CHÚ",
    "section": "GHI CHÚ"
  }
];

export const hdmbImportSections = [
  "THÔNG TIN CHUNG",
  "THÔNG TIN KHÁCH HÀNG",
  "SH1 - KHÁCH HÀNG SỞ HỮU 1",
  "SH2 - ĐỒNG SỞ HỮU",
  "KHÁCH HÀNG DOANH NGHIỆP",
  "THÔNG TIN NHẬN THÔNG BÁO",
  "THÔNG TIN SẢN PHẨM BAN HÀNH THEO GIỎ HÀNG",
  "THÔNG TIN CHÍNH SÁCH BÁN HÀNG",
  "THÔNG TIN CỌC - THANH TOÁN - KÝ HĐMB",
  "LOẠI KHÁCH HÀNG",
  "THÔNG TIN NHÂN VIÊN GIAO DỊCH",
  "CHỨNG TỪ KÈM THEO",
  "GHI CHÚ"
];

export const defaultVisibleHdmbFieldKeys = [
  'c1','c2','c3','c4','c12','c13','c19','c30','c51','c52','c53','c54','c55','c56','c57','c59','c60','c69','c84','c85','c87','c93','c94','c95','c104','c105','c106','c107','c108','c154','c156','c157','c158','c159','c160'
];

export const hdmbImportRecords: HdmbRecord[] = [
  {
    "id": "row-1",
    "values": {
      "c1": "1",
      "c2": "KH-0001",
      "c3": "Nguyễn Gia Bảo",
      "c4": "294857392",
      "c6": "24/02/2025",
      "c7": "CTCCS",
      "c8": "24/02/1993",
      "c9": "Nam",
      "c10": "929 Hart St, Brooklyn, NY 11237",
      "c11": "929 Hart St, Brooklyn, NY 11237",
      "c12": "090-987-6543",
      "c13": "huuhuy.realestate@email.com",
      "c14": "Kinh doanh",
      "c15": "929 Hart St, Brooklyn, NY 11237",
      "c16": "929 Hart St, Brooklyn, NY 11237",
      "c17": "090-987-6543",
      "c18": "huuhuy.realestate@email.com",
      "c19": "Nguyễn Minh Khôi",
      "c20": "103849428550",
      "c23": "14/08/1995",
      "c27": "093-222-1122",
      "c28": "khoi.nguyen@email.com",
      "c46": "929 Hart St, Brooklyn, NY 11237",
      "c48": "Nguyễn Gia Bảo",
      "c49": "0909876543",
      "c50": "huuhuy.realestate@email.com",
      "c51": "TM-IKV-A-0501",
      "c52": "VITALIS",
      "c53": "05",
      "c54": "IKV.U04-01",
      "c55": "Căn hộ thương mại",
      "c56": "3BR+4B",
      "c57": "Sông + Rạch + Thành phố",
      "c58": "Đông Bắc",
      "c59": "200",
      "c60": "75",
      "c63": "100.000.000 VNĐ",
      "c64": "3.200.000.000 VNĐ",
      "c66": "Hoàn thiện tinh tế",
      "c67": "Hoàn thiện cao cấp",
      "c69": "PTTT 1 - Theo tiến độ chuẩn 18 tháng",
      "c70": "0%",
      "c71": "0 VNĐ",
      "c84": "10%",
      "c85": "267.716.364 VNĐ",
      "c86": "100.000.000 VNĐ",
      "c87": "2.677.716.364 VNĐ",
      "c88": "10%",
      "c89": "267.716.364 VNĐ",
      "c90": "2%",
      "c91": "53.554.327 VNĐ",
      "c92": "2.677.716.364 VNĐ",
      "c93": "2.570.392.888 VNĐ",
      "c94": "200.000.000 VNĐ",
      "c95": "200.000.000 VNĐ",
      "c96": "14/04/2026",
      "c97": "200.000.000 VNĐ",
      "c100": "0 VNĐ",
      "c101": "200.000.000 VNĐ",
      "c104": "Thanh toán chuẩn 18 đợt",
      "c105": "40%",
      "c106": "13/07/2025",
      "c107": "13/07/2025",
      "c108": "MQH",
      "c154": "Lâm Trà My",
      "c155": "ACC-1024",
      "c156": "AKH",
      "c157": "TTC-2026-001",
      "c158": "PTTSP-2026-001",
      "c159": "XNCK-2026-001",
      "c160": "Khách hàng đã đủ hồ sơ ký HĐMB."
    }
  },
  {
    "id": "row-2",
    "values": {
      "c1": "2",
      "c2": "KH-0002",
      "c3": "Trần Minh Anh",
      "c4": "079199456789",
      "c6": "12/01/2024",
      "c7": "Cục CSQLHC",
      "c8": "09/09/1991",
      "c9": "Nữ",
      "c12": "091-222-3344",
      "c13": "minhanh.tran@email.com",
      "c19": "Lê Hoàng Nam",
      "c27": "090-555-6677",
      "c28": "nam.le@email.com",
      "c48": "Trần Minh Anh",
      "c49": "0912223344",
      "c50": "minhanh.tran@email.com",
      "c51": "TM-IKV-B-0912",
      "c52": "HARMONIE",
      "c53": "09",
      "c54": "IKV.B09-12",
      "c55": "Căn hộ",
      "c56": "2BR",
      "c57": "Công viên",
      "c58": "Đông Nam",
      "c59": "88",
      "c60": "74",
      "c63": "82.000.000 VNĐ",
      "c64": "7.216.000.000 VNĐ",
      "c66": "Bàn giao thô",
      "c69": "PTTT 2 - Thanh toán nhanh",
      "c70": "3%",
      "c71": "216.480.000 VNĐ",
      "c72": "2",
      "c73": "1%",
      "c74": "72.160.000 VNĐ",
      "c84": "4%",
      "c85": "288.640.000 VNĐ",
      "c87": "6.927.360.000 VNĐ",
      "c88": "10%",
      "c89": "692.736.000 VNĐ",
      "c90": "2%",
      "c91": "138.547.200 VNĐ",
      "c93": "7.758.643.200 VNĐ",
      "c94": "300.000.000 VNĐ",
      "c95": "300.000.000 VNĐ",
      "c96": "18/04/2026",
      "c97": "300.000.000 VNĐ",
      "c104": "Thanh toán nhanh 8 đợt",
      "c105": "35%",
      "c106": "20/07/2026",
      "c107": "",
      "c108": "NB",
      "c154": "Nguyễn Hoàng Phúc",
      "c155": "ACC-1041",
      "c156": "AKH",
      "c157": "TTC-2026-002",
      "c158": "PTTSP-2026-002",
      "c159": "XNCK-2026-002",
      "c160": "Chờ xác nhận lịch ký."
    }
  },
  {
    "id": "row-3",
    "values": {
      "c1": "3",
      "c2": "KH-0003",
      "c3": "Công ty CP Đại Minh Real",
      "c30": "Công ty CP Đại Minh Real",
      "c31": "0314567890",
      "c32": "0314567890",
      "c33": "02/02/2022",
      "c34": "Sở KHĐT TP.HCM",
      "c35": "65 Lê Lợi, Quận 1, TP.HCM",
      "c36": "65 Lê Lợi, Quận 1, TP.HCM",
      "c37": "Phạm Quốc Hùng",
      "c38": "001078098765",
      "c41": "02/12/1978",
      "c42": "Nam",
      "c43": "02838221199",
      "c44": "admin@daiminhreal.vn",
      "c48": "Phạm Quốc Hùng",
      "c49": "02838221199",
      "c50": "admin@daiminhreal.vn",
      "c51": "TM-IKV-C-1208",
      "c52": "HARMONIE",
      "c53": "12",
      "c54": "IKV.C12-08",
      "c55": "Shophouse",
      "c56": "Studio",
      "c57": "Đại lộ",
      "c58": "Tây Nam",
      "c59": "160",
      "c60": "140",
      "c63": "120.000.000 VNĐ",
      "c64": "19.200.000.000 VNĐ",
      "c66": "Hoàn thiện cơ bản",
      "c69": "PTTT doanh nghiệp",
      "c70": "2%",
      "c71": "384.000.000 VNĐ",
      "c84": "2%",
      "c85": "384.000.000 VNĐ",
      "c87": "18.816.000.000 VNĐ",
      "c88": "10%",
      "c89": "1.881.600.000 VNĐ",
      "c90": "2%",
      "c91": "376.320.000 VNĐ",
      "c93": "21.073.920.000 VNĐ",
      "c94": "1.000.000.000 VNĐ",
      "c95": "700.000.000 VNĐ",
      "c96": "21/04/2026",
      "c97": "700.000.000 VNĐ",
      "c102": "30/04/2026",
      "c103": "300.000.000 VNĐ",
      "c104": "Thanh toán doanh nghiệp",
      "c105": "30%",
      "c106": "01/08/2026",
      "c107": "15/08/2026",
      "c108": "SỈ",
      "c154": "Trần Minh Khoa",
      "c155": "ACC-1007",
      "c156": "Đại lý AKH",
      "c157": "TTC-2026-003",
      "c158": "PTTSP-2026-003",
      "c159": "",
      "c160": "Khách doanh nghiệp cần kiểm tra pháp nhân."
    }
  },
  {
    "id": "row-4",
    "values": {
      "c1": "4",
      "c2": "KH-0004",
      "c3": "Lê Thị Cẩm",
      "c4": "07904123456",
      "c8": "01/01/1990",
      "c9": "Nữ",
      "c12": "0941234567",
      "c13": "khach4@email.com",
      "c51": "TM-IKV-A-0004",
      "c52": "VITALIS",
      "c53": "06",
      "c54": "IKV.A04-01",
      "c55": "Căn hộ",
      "c56": "2BR",
      "c57": "Nội khu",
      "c58": "Đông Nam",
      "c59": "95",
      "c60": "80",
      "c63": "90.000.000 VNĐ",
      "c64": "8.550.000.000 VNĐ",
      "c69": "PTTT 1 - Chuẩn",
      "c84": "0%",
      "c85": "0 VNĐ",
      "c87": "8.550.000.000 VNĐ",
      "c88": "10%",
      "c90": "2%",
      "c94": "300.000.000 VNĐ",
      "c95": "300.000.000 VNĐ",
      "c104": "Thanh toán chuẩn",
      "c105": "25%",
      "c106": "10/08/2026",
      "c108": "MQH",
      "c154": "Lâm Trà My",
      "c155": "ACC-1104",
      "c156": "AKH",
      "c157": "TTC-2026-004",
      "c158": "PTTSP-2026-004",
      "c160": ""
    }
  },
  {
    "id": "row-5",
    "values": {
      "c1": "5",
      "c2": "KH-0005",
      "c3": "Trần Hữu Dũng",
      "c4": "07905123456",
      "c8": "01/01/1990",
      "c9": "Nam",
      "c12": "0951234567",
      "c13": "khach5@email.com",
      "c51": "TM-IKV-A-0005",
      "c52": "VITALIS",
      "c53": "07",
      "c54": "IKV.A05-01",
      "c55": "Căn hộ",
      "c56": "2BR",
      "c57": "Nội khu",
      "c58": "Đông Nam",
      "c59": "95",
      "c60": "80",
      "c63": "90.000.000 VNĐ",
      "c64": "8.550.000.000 VNĐ",
      "c69": "PTTT 1 - Chuẩn",
      "c84": "0%",
      "c85": "0 VNĐ",
      "c87": "8.550.000.000 VNĐ",
      "c88": "10%",
      "c90": "2%",
      "c94": "300.000.000 VNĐ",
      "c95": "300.000.000 VNĐ",
      "c104": "Thanh toán chuẩn",
      "c105": "25%",
      "c106": "10/08/2026",
      "c108": "MQH",
      "c154": "Lâm Trà My",
      "c155": "ACC-1105",
      "c156": "AKH",
      "c157": "TTC-2026-005",
      "c158": "PTTSP-2026-005",
      "c160": ""
    }
  },
  {
    "id": "row-6",
    "values": {
      "c1": "6",
      "c2": "KH-0006",
      "c3": "Phan Thị Giang",
      "c4": "07906123456",
      "c8": "01/01/1990",
      "c9": "Nữ",
      "c12": "0961234567",
      "c13": "khach6@email.com",
      "c51": "TM-IKV-A-0006",
      "c52": "VITALIS",
      "c53": "08",
      "c54": "IKV.A06-01",
      "c55": "Căn hộ",
      "c56": "2BR",
      "c57": "Nội khu",
      "c58": "Đông Nam",
      "c59": "95",
      "c60": "80",
      "c63": "90.000.000 VNĐ",
      "c64": "8.550.000.000 VNĐ",
      "c69": "PTTT 1 - Chuẩn",
      "c84": "0%",
      "c85": "0 VNĐ",
      "c87": "8.550.000.000 VNĐ",
      "c88": "10%",
      "c90": "2%",
      "c94": "300.000.000 VNĐ",
      "c95": "300.000.000 VNĐ",
      "c104": "Thanh toán chuẩn",
      "c105": "25%",
      "c106": "10/08/2026",
      "c108": "MQH",
      "c154": "Lâm Trà My",
      "c155": "ACC-1106",
      "c156": "AKH",
      "c157": "TTC-2026-006",
      "c158": "PTTSP-2026-006",
      "c160": ""
    }
  },
  {
    "id": "row-7",
    "values": {
      "c1": "7",
      "c2": "KH-0007",
      "c3": "Hoàng Văn Minh",
      "c4": "07907123456",
      "c8": "01/01/1990",
      "c9": "Nam",
      "c12": "0971234567",
      "c13": "khach7@email.com",
      "c51": "TM-IKV-A-0007",
      "c52": "VITALIS",
      "c53": "09",
      "c54": "IKV.A07-01",
      "c55": "Căn hộ",
      "c56": "2BR",
      "c57": "Nội khu",
      "c58": "Đông Nam",
      "c59": "95",
      "c60": "80",
      "c63": "90.000.000 VNĐ",
      "c64": "8.550.000.000 VNĐ",
      "c69": "PTTT 1 - Chuẩn",
      "c84": "0%",
      "c85": "0 VNĐ",
      "c87": "8.550.000.000 VNĐ",
      "c88": "10%",
      "c90": "2%",
      "c94": "300.000.000 VNĐ",
      "c95": "300.000.000 VNĐ",
      "c104": "Thanh toán chuẩn",
      "c105": "25%",
      "c106": "10/08/2026",
      "c108": "MQH",
      "c154": "Lâm Trà My",
      "c155": "ACC-1107",
      "c156": "AKH",
      "c157": "TTC-2026-007",
      "c158": "PTTSP-2026-007",
      "c160": ""
    }
  }
];
