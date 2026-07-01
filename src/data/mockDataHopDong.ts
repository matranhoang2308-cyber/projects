// ─── Types ────────────────────────────────────────────────────────────────────

export type OwnerProfile = {
  name: string;
  dob: string;
  phone: string;
  email: string;
  cccd: string;
  cccdDate: string;
  cccdPlace: string;
  permanentAddress: string;
  contactAddress: string;
  bankAccount?: string;
  bank?: string;
  bankAccountName?: string;
};

export type TransferLog = {
  id: string;
  seq: number;
  transferDate: string;
  previousOwner: OwnerProfile;
  newOwner: OwnerProfile;
  previousCoOwners: OwnerProfile[];
  newCoOwners: OwnerProfile[];
  file: string;
  performedBy: string;
  note?: string;
};

export type ExtensionInstallment = {
  seq: number;
  amount: string;       // Formatted: "540,000,000"
  amountNum: number;    // Raw number
  dueDate: string;      // "dd/MM/yyyy"
  paidDate: string | null;
  status: "pending" | "paid" | "overdue";
};

export type PaymentExtension = {
  id: string;                          // "GH-001"
  requestDate: string;                 // Ngày KH yêu cầu
  approvedDate: string;                // Ngày duyệt
  approvedBy: string;                  // Nhân viên sale duyệt
  hasPenalty: boolean;                 // Có tính phí phạt không
  penaltyRate?: number;                // % / đơn vị (vd: 0.05)
  penaltyUnit?: "ngày" | "tháng";     // Đơn vị phí phạt
  penaltyDays?: number;                // Số ngày/tháng tính phạt
  penaltyAmount?: string;              // Tổng phí phạt
  reason: string;                      // Lý do gia hạn
  installments: ExtensionInstallment[];
  note?: string;
};

export type PaymentRecord = {
  seq: number;
  amount: string;
  due: string;
  paid: string | null;
  status: "on-time" | "late" | "overdue" | "pending";
  extension?: PaymentExtension;
};

export type DocRecord = {
  name: string;
  size: string;
  date: string;
};

export type Contract = {
  id: string;
  customerId: string;
  customer: string;
  phone: string;
  email: string;
  property: string;
  address: string;
  type: string;
  salesperson: string;
  value: string;
  paid: number;
  total: number;
  pct: number;
  status: "Đang ký" | "Đã ký" | "Công chứng" | "Đã hủy";
  date: string;
  payments: PaymentRecord[];
  docs: DocRecord[];
  owner?: OwnerProfile;
  coOwners?: OwnerProfile[];
  transferCount?: number;
  transferHistory?: TransferLog[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  type: "Cá nhân" | "Doanh nghiệp";
  dob?: string;
  country?: string;
  cccd?: string;
  cccdDate?: string;
  cccdPlace?: string;
  gender?: string;
  job?: string;
  source?: string;
  customerStatus?: string;
  lifestyle?: string;
  customerGroup?: string;
  hobbies?: string;
  wellnessStyle?: string;
  housingNeed?: string;
  careNote?: string;
  oldAddress?: string;
  newAddress?: string;
  taxCode?: string;
  representative?: string;
  note?: string;
  joinDate: string;
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers: Customer[] = [
  {
    id: "C001",
    name: "Nguyễn Văn Bình",
    phone: "0912 345 678",
    email: "nvbinh@email.com",
    address: "45 Nguyễn Trãi, Quận 1, TP.HCM",
    type: "Cá nhân",
    dob: "15/03/1985",
    cccd: "079085012345",
    gender: "Nam",
    job: "Nhà đầu tư",
    source: "Facebook",
    note: "Khách VIP – ưu tiên xử lý. Đã mua 3 BĐS trong 3 năm liên tiếp.",
    joinDate: "10/03/2024",
  },
  {
    id: "C002",
    name: "Lê Thị Cẩm",
    phone: "0987 654 321",
    email: "ltcam@email.com",
    address: "12 Lê Lợi, Quận Hải Châu, Đà Nẵng",
    type: "Cá nhân",
    dob: "28/07/1990",
    cccd: "048090067890",
    gender: "Nữ",
    job: "Quản lý kinh doanh",
    source: "Zalo",
    note: "Khách hàng giới thiệu từ đối tác ABS Realty.",
    joinDate: "05/11/2024",
  },
  {
    id: "C003",
    name: "Trần Hữu Dũng",
    phone: "0903 111 222",
    email: "thdung@email.com",
    address: "78 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM",
    type: "Cá nhân",
    dob: "02/12/1978",
    cccd: "001078098765",
    gender: "Nam",
    job: "Chủ doanh nghiệp",
    source: "Website",
    note: "Kinh doanh thuê mặt bằng thương mại. Cần tư vấn kỹ pháp lý.",
    joinDate: "20/06/2024",
  },
  {
    id: "C004",
    name: "Phan Thị Giang",
    phone: "0976 222 333",
    email: "ptgiang@email.com",
    address: "33 Võ Thị Sáu, Quận 3, TP.HCM",
    type: "Cá nhân",
    dob: "19/04/1995",
    cccd: "079095034567",
    gender: "Nữ",
    job: "Chuyên viên tài chính",
    source: "Zalo",
    note: "Mua cho gia đình ở. Thanh toán đúng hạn, ít phát sinh.",
    joinDate: "02/09/2025",
  },
  {
    id: "C005",
    name: "Hoàng Văn Minh",
    phone: "0908 444 555",
    email: "hvminh@email.com",
    address: "101 Hoàng Hoa Thám, Tây Hồ, Hà Nội",
    type: "Cá nhân",
    dob: "07/09/1982",
    cccd: "001082056789",
    gender: "Nam",
    job: "Kỹ sư xây dựng",
    source: "Facebook",
    note: "Hủy hợp đồng lần đầu do tài chính. Lần 2 đang tích cực.",
    joinDate: "15/01/2025",
  },
  {
    id: "C006",
    name: "Đỗ Thị Hồng",
    phone: "0919 666 777",
    email: "dthong@email.com",
    address: "22 Nguyễn Huệ, Quận 1, TP.HCM",
    type: "Cá nhân",
    dob: "11/06/1992",
    cccd: "079092045678",
    gender: "Nữ",
    job: "Chuyên viên marketing",
    source: "Hotline",
    joinDate: "01/04/2026",
  },
  {
    id: "C007",
    name: "Công ty CP Đại Minh Real",
    phone: "028 3822 1199",
    email: "admin@daiminhreal.vn",
    address: "Tầng 15, Tòa nhà Sài Gòn Centre, 65 Lê Lợi, Q.1, TP.HCM",
    type: "Doanh nghiệp",
    taxCode: "0314 567 890",
    representative: "Ông Phạm Quốc Hùng – Tổng Giám đốc",
    gender: "—",
    job: "Công ty phân phối BĐS",
    source: "Email",
    note: "Đối tác phân phối chiến lược. Ưu tiên hoa hồng cao.",
    joinDate: "10/01/2024",
  },
];

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contracts: Contract[] = [
  // ── C001: Nguyễn Văn Bình – 3 contracts ──────────────────────────────────
  {
    id: "HĐ-2026-148",
    customerId: "C001",
    customer: "Nguyễn Văn Bình",
    phone: "0912 345 678",
    email: "nvbinh@email.com",
    property: "Căn hộ A1-0812",
    address: "Tầng 8, Tháp A1, KĐT Vinhomes Grand Park",
    type: "Mua bán",
    salesperson: "Trần Minh Khoa",
    value: "2,400,000,000",
    paid: 720000000,
    total: 2400000000,
    pct: 30,
    status: "Đang ký",
    date: "14/04/2026",
    payments: [
      { seq: 1, amount: "720,000,000", due: "14/04/2026", paid: "14/04/2026", status: "on-time" },
      { seq: 2, amount: "720,000,000", due: "14/06/2026", paid: null, status: "pending" },
      { seq: 3, amount: "960,000,000", due: "14/09/2026", paid: null, status: "pending" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "2.4 MB", date: "14/04/2026" },
      { name: "CMND khách hàng.pdf", size: "0.8 MB", date: "14/04/2026" },
    ],
    owner: {
      name: "Nguyễn Văn Bình",
      dob: "15/03/1988",
      phone: "0912 345 678",
      email: "nvbinh@email.com",
      cccd: "079088012345",
      cccdDate: "20/01/2021",
      cccdPlace: "Cục CSQL HCNN - Bộ CA",
      permanentAddress: "45 Nguyễn Trãi, P.3, Q.5, TP.HCM",
      contactAddress: "Tầng 8, Tháp A1, KĐT Vinhomes Grand Park, Q.9",
      bankAccount: "0112 3456 789",
      bank: "Vietcombank",
      bankAccountName: "NGUYEN VAN BINH",
    },
    coOwners: [
      {
        name: "Trần Thị Hoa",
        dob: "22/07/1990",
        phone: "0934 567 890",
        email: "tthoa@email.com",
        cccd: "079090056789",
        cccdDate: "15/03/2022",
        cccdPlace: "Cục CSQL HCNN - Bộ CA",
        permanentAddress: "45 Nguyễn Trãi, P.3, Q.5, TP.HCM",
        contactAddress: "Tầng 8, Tháp A1, KĐT Vinhomes Grand Park, Q.9",
      },
    ],
    transferCount: 1,
    transferHistory: [
      {
        id: "CN-001",
        seq: 1,
        transferDate: "02/01/2026",
        previousOwner: {
          name: "Lê Văn Tuấn",
          dob: "10/05/1980",
          phone: "0908 111 222",
          email: "lvtuan@email.com",
          cccd: "079080098765",
          cccdDate: "10/06/2019",
          cccdPlace: "CA TP.HCM",
          permanentAddress: "12 Lê Lợi, P.1, Q.1, TP.HCM",
          contactAddress: "12 Lê Lợi, P.1, Q.1, TP.HCM",
        },
        newOwner: {
          name: "Nguyễn Văn Bình",
          dob: "15/03/1988",
          phone: "0912 345 678",
          email: "nvbinh@email.com",
          cccd: "079088012345",
          cccdDate: "20/01/2021",
          cccdPlace: "Cục CSQL HCNN - Bộ CA",
          permanentAddress: "45 Nguyễn Trãi, P.3, Q.5, TP.HCM",
          contactAddress: "Tầng 8, Tháp A1, KĐT Vinhomes Grand Park, Q.9",
        },
        previousCoOwners: [],
        newCoOwners: [
          {
            name: "Trần Thị Hoa",
            dob: "22/07/1990",
            phone: "0934 567 890",
            email: "tthoa@email.com",
            cccd: "079090056789",
            cccdDate: "15/03/2022",
            cccdPlace: "Cục CSQL HCNN - Bộ CA",
            permanentAddress: "45 Nguyễn Trãi, P.3, Q.5, TP.HCM",
            contactAddress: "Tầng 8, Tháp A1, KĐT Vinhomes Grand Park, Q.9",
          },
        ],
        file: "hop-dong-chuyen-nhuong-lan-1.pdf",
        performedBy: "Trần Minh Khoa",
        note: "Chuyển nhượng hợp đồng theo thỏa thuận dân sự",
      },
    ],
  },
  {
    id: "HĐ-2025-089",
    customerId: "C001",
    customer: "Nguyễn Văn Bình",
    phone: "0912 345 678",
    email: "nvbinh@email.com",
    property: "Căn hộ Sky B3-1505",
    address: "Tầng 15, Tháp B3, KĐT Masteri Thảo Điền",
    type: "Mua bán",
    salesperson: "Nguyễn Thu Hà",
    value: "3,150,000,000",
    paid: 3150000000,
    total: 3150000000,
    pct: 100,
    status: "Đã ký",
    date: "20/07/2025",
    payments: [
      { seq: 1, amount: "945,000,000", due: "20/07/2025", paid: "18/07/2025", status: "on-time" },
      { seq: 2, amount: "945,000,000", due: "20/09/2025", paid: "19/09/2025", status: "on-time" },
      { seq: 3, amount: "1,260,000,000", due: "20/12/2025", paid: "15/12/2025", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "2.9 MB", date: "20/07/2025" },
      { name: "Biên bản bàn giao.pdf", size: "1.5 MB", date: "25/12/2025" },
      { name: "Sổ hồng.pdf", size: "3.2 MB", date: "10/02/2026" },
    ],
  },
  {
    id: "HĐ-2024-032",
    customerId: "C001",
    customer: "Nguyễn Văn Bình",
    phone: "0912 345 678",
    email: "nvbinh@email.com",
    property: "Liền kề Lotus 08",
    address: "Lô 08, Khu liền kề Lotus, KĐT Gamuda Gardens",
    type: "Mua bán",
    salesperson: "Trần Minh Khoa",
    value: "4,800,000,000",
    paid: 4800000000,
    total: 4800000000,
    pct: 100,
    status: "Đã ký",
    date: "10/03/2024",
    payments: [
      { seq: 1, amount: "1,440,000,000", due: "10/03/2024", paid: "08/03/2024", status: "on-time" },
      { seq: 2, amount: "1,440,000,000", due: "10/06/2024", paid: "07/06/2024", status: "on-time" },
      { seq: 3, amount: "1,920,000,000", due: "10/10/2024", paid: "09/10/2024", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "3.1 MB", date: "10/03/2024" },
      { name: "Biên bản bàn giao.pdf", size: "1.3 MB", date: "15/10/2024" },
      { name: "Sổ hồng.pdf", size: "2.8 MB", date: "05/01/2025" },
    ],
  },

  // ── C002: Lê Thị Cẩm – 2 contracts ──────────────────────────────────────
  {
    id: "HĐ-2026-147",
    customerId: "C002",
    customer: "Lê Thị Cẩm",
    phone: "0987 654 321",
    email: "ltcam@email.com",
    property: "Biệt thự B2-05",
    address: "Khu biệt thự B2, KĐT EcoPark",
    type: "Mua bán",
    salesperson: "Nguyễn Thu Hà",
    value: "8,100,000,000",
    paid: 8100000000,
    total: 8100000000,
    pct: 100,
    status: "Đã ký",
    date: "13/04/2026",
    payments: [
      { seq: 1, amount: "2,430,000,000", due: "01/01/2026", paid: "29/12/2025", status: "on-time" },
      { seq: 2, amount: "2,430,000,000", due: "01/03/2026", paid: "28/02/2026", status: "on-time" },
      { seq: 3, amount: "3,240,000,000", due: "13/04/2026", paid: "13/04/2026", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "3.1 MB", date: "13/04/2026" },
      { name: "Biên bản bàn giao.pdf", size: "1.2 MB", date: "13/04/2026" },
    ],
  },
  {
    id: "HĐ-2025-071",
    customerId: "C002",
    customer: "Lê Thị Cẩm",
    phone: "0987 654 321",
    email: "ltcam@email.com",
    property: "Căn hộ Ocean View C1-2201",
    address: "Tầng 22, Tháp C1, The Coastal City Đà Nẵng",
    type: "Mua bán",
    salesperson: "Nguyễn Thu Hà",
    value: "2,800,000,000",
    paid: 2800000000,
    total: 2800000000,
    pct: 100,
    status: "Đã ký",
    date: "05/11/2024",
    payments: [
      { seq: 1, amount: "840,000,000", due: "05/11/2024", paid: "02/11/2024", status: "on-time" },
      { seq: 2, amount: "840,000,000", due: "05/02/2025", paid: "03/02/2025", status: "on-time" },
      { seq: 3, amount: "1,120,000,000", due: "05/06/2025", paid: "04/06/2025", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "2.7 MB", date: "05/11/2024" },
      { name: "Biên bản bàn giao.pdf", size: "1.0 MB", date: "10/06/2025" },
    ],
  },

  // ── C003: Trần Hữu Dũng – 2 contracts ────────────────────────────────────
  {
    id: "HĐ-2026-146",
    customerId: "C003",
    customer: "Trần Hữu Dũng",
    phone: "0903 111 222",
    email: "thdung@email.com",
    property: "Shophouse C-11",
    address: "Tầng 1, Toà C, KĐT Grand Park",
    type: "Thuê",
    salesperson: "Lê Đức Anh",
    value: "3,600,000,000",
    paid: 2520000000,
    total: 3600000000,
    pct: 70,
    status: "Công chứng",
    date: "12/04/2026",
    payments: [
      { seq: 1, amount: "720,000,000", due: "12/01/2026", paid: "12/01/2026", status: "on-time" },
      { seq: 2, amount: "720,000,000", due: "12/02/2026", paid: "15/02/2026", status: "late" },
      { seq: 3, amount: "1,080,000,000", due: "12/03/2026", paid: "12/03/2026", status: "on-time" },
      {
        seq: 4,
        amount: "1,080,000,000",
        due: "12/04/2026",
        paid: null,
        status: "overdue",
        extension: {
          id: "GH-001",
          requestDate: "15/04/2026",
          approvedDate: "16/04/2026",
          approvedBy: "Lê Đức Anh",
          hasPenalty: true,
          penaltyRate: 0.05,
          penaltyUnit: "ngày",
          penaltyDays: 10,
          penaltyAmount: "5,400,000",
          reason: "Khách hàng gặp khó khăn tài chính tạm thời, đang chờ giải ngân khoản vay từ Vietcombank. Dự kiến nhận tiền cuối tháng 4/2026.",
          note: "Đã xác nhận hồ sơ vay với NH Vietcombank chi nhánh Bình Thạnh. Nhân viên sale giữ bản cam kết thanh toán có chữ ký.",
          installments: [
            { seq: 1, amount: "540,000,000", amountNum: 540000000, dueDate: "30/04/2026", paidDate: null, status: "pending" },
            { seq: 2, amount: "540,000,000", amountNum: 540000000, dueDate: "31/05/2026", paidDate: null, status: "pending" },
          ],
        },
      },
    ],
    docs: [
      { name: "Hợp đồng thuê.pdf", size: "2.8 MB", date: "12/04/2026" },
    ],
  },
  {
    id: "HĐ-2025-044",
    customerId: "C003",
    customer: "Trần Hữu Dũng",
    phone: "0903 111 222",
    email: "thdung@email.com",
    property: "Kiot TM K-03",
    address: "Khu thương mại K, KĐT Vạn Phúc City, Thủ Đức",
    type: "Thuê",
    salesperson: "Lê Đức Anh",
    value: "1,200,000,000",
    paid: 1200000000,
    total: 1200000000,
    pct: 100,
    status: "Đã ký",
    date: "20/06/2024",
    payments: [
      { seq: 1, amount: "600,000,000", due: "20/06/2024", paid: "18/06/2024", status: "on-time" },
      { seq: 2, amount: "600,000,000", due: "20/12/2024", paid: "19/12/2024", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng thuê.pdf", size: "2.1 MB", date: "20/06/2024" },
      { name: "Biên bản nghiệm thu.pdf", size: "0.9 MB", date: "25/12/2024" },
    ],
  },

  // ── C004: Phan Thị Giang – 1 contract ────────────────────────────────────
  {
    id: "HĐ-2026-145",
    customerId: "C004",
    customer: "Phan Thị Giang",
    phone: "0976 222 333",
    email: "ptgiang@email.com",
    property: "Căn hộ A2-1104",
    address: "Tầng 11, Tháp A2, KĐT Masteri",
    type: "Mua bán",
    salesperson: "Phạm Thị Lan",
    value: "1,900,000,000",
    paid: 1900000000,
    total: 1900000000,
    pct: 100,
    status: "Đã ký",
    date: "11/04/2026",
    payments: [
      { seq: 1, amount: "950,000,000", due: "11/01/2026", paid: "09/01/2026", status: "on-time" },
      { seq: 2, amount: "950,000,000", due: "11/04/2026", paid: "11/04/2026", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "2.2 MB", date: "11/04/2026" },
      { name: "Phụ lục đặt cọc.pdf", size: "0.5 MB", date: "11/01/2026" },
    ],
  },

  // ── C005: Hoàng Văn Minh – 2 contracts (1 cancelled, 1 active) ───────────
  {
    id: "HĐ-2026-144",
    customerId: "C005",
    customer: "Hoàng Văn Minh",
    phone: "0908 444 555",
    email: "hvminh@email.com",
    property: "Liền kề D-08",
    address: "Lô D-08, KĐT Ciputra",
    type: "Mua bán",
    salesperson: "Vũ Hoàng Nam",
    value: "5,200,000,000",
    paid: 0,
    total: 5200000000,
    pct: 0,
    status: "Đã hủy",
    date: "10/04/2026",
    payments: [],
    docs: [
      { name: "Hợp đồng đặt cọc.pdf", size: "1.1 MB", date: "10/04/2026" },
    ],
  },
  {
    id: "HĐ-2025-092",
    customerId: "C005",
    customer: "Hoàng Văn Minh",
    phone: "0908 444 555",
    email: "hvminh@email.com",
    property: "Căn hộ Sky H2-0901",
    address: "Tầng 9, Tháp H2, Hanoi Melody Residences",
    type: "Mua bán",
    salesperson: "Vũ Hoàng Nam",
    value: "2,100,000,000",
    paid: 2100000000,
    total: 2100000000,
    pct: 100,
    status: "Đã ký",
    date: "15/01/2025",
    payments: [
      { seq: 1, amount: "630,000,000", due: "15/01/2025", paid: "14/01/2025", status: "on-time" },
      { seq: 2, amount: "630,000,000", due: "15/04/2025", paid: "15/04/2025", status: "on-time" },
      { seq: 3, amount: "840,000,000", due: "15/09/2025", paid: "12/09/2025", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng mua bán.pdf", size: "2.5 MB", date: "15/01/2025" },
      { name: "Biên bản bàn giao.pdf", size: "1.1 MB", date: "20/09/2025" },
    ],
  },

  // ── C006: Đỗ Thị Hồng – 1 contract ──────────────────────────────────────
  {
    id: "HĐ-2026-143",
    customerId: "C006",
    customer: "Đỗ Thị Hồng",
    phone: "0919 666 777",
    email: "dthong@email.com",
    property: "Căn hộ Studio B1-0203",
    address: "Tầng 2, Tháp B1, KĐT The Sun",
    type: "Thuê",
    salesperson: "Trần Minh Khoa",
    value: "420,000,000",
    paid: 210000000,
    total: 420000000,
    pct: 50,
    status: "Đang ký",
    date: "09/04/2026",
    payments: [
      { seq: 1, amount: "210,000,000", due: "09/04/2026", paid: "09/04/2026", status: "on-time" },
      {
        seq: 2,
        amount: "210,000,000",
        due: "09/10/2026",
        paid: null,
        status: "overdue",
        extension: {
          id: "GH-002",
          requestDate: "11/10/2026",
          approvedDate: "12/10/2026",
          approvedBy: "Trần Minh Khoa",
          hasPenalty: false,
          reason: "Khách hàng mới chuyển công tác, lương tháng 10 chưa về kịp. Sale xác nhận hoàn cảnh hợp lý và đề xuất miễn phạt lần đầu.",
          note: "Lần đầu trễ hạn. Khách hàng ký cam kết thanh toán đúng hạn trong lần gia hạn này.",
          installments: [
            { seq: 1, amount: "105,000,000", amountNum: 105000000, dueDate: "20/10/2026", paidDate: "19/10/2026", status: "paid" },
            { seq: 2, amount: "105,000,000", amountNum: 105000000, dueDate: "15/11/2026", paidDate: null, status: "pending" },
          ],
        },
      },
    ],
    docs: [
      { name: "Hợp đồng thuê.pdf", size: "1.8 MB", date: "09/04/2026" },
    ],
  },

  // ── C007: Công ty CP Đại Minh Real – 3 contracts ─────────────────────────
  {
    id: "HĐ-2026-141",
    customerId: "C007",
    customer: "Công ty CP Đại Minh Real",
    phone: "028 3822 1199",
    email: "admin@daiminhreal.vn",
    property: "Sàn văn phòng Floor 12 – Tower S",
    address: "Tầng 12, Tòa nhà Saigon South Tower, Quận 7",
    type: "Thuê",
    salesperson: "Nguyễn Thu Hà",
    value: "12,000,000,000",
    paid: 4000000000,
    total: 12000000000,
    pct: 33,
    status: "Công chứng",
    date: "01/04/2026",
    payments: [
      { seq: 1, amount: "4,000,000,000", due: "01/04/2026", paid: "01/04/2026", status: "on-time" },
      { seq: 2, amount: "4,000,000,000", due: "01/07/2026", paid: null, status: "pending" },
      { seq: 3, amount: "4,000,000,000", due: "01/10/2026", paid: null, status: "pending" },
    ],
    docs: [
      { name: "Hợp đồng thuê văn phòng.pdf", size: "4.2 MB", date: "01/04/2026" },
      { name: "Giấy phép kinh doanh.pdf", size: "1.5 MB", date: "01/04/2026" },
      { name: "Biên bản thỏa thuận.pdf", size: "0.8 MB", date: "01/04/2026" },
    ],
  },
  {
    id: "HĐ-2025-135",
    customerId: "C007",
    customer: "Công ty CP Đại Minh Real",
    phone: "028 3822 1199",
    email: "admin@daiminhreal.vn",
    property: "Kho xưởng W4 – KCN Long Hậu",
    address: "Lô W4, Khu công nghiệp Long Hậu, Long An",
    type: "Thuê",
    salesperson: "Vũ Hoàng Nam",
    value: "6,000,000,000",
    paid: 6000000000,
    total: 6000000000,
    pct: 100,
    status: "Đã ký",
    date: "15/06/2025",
    payments: [
      { seq: 1, amount: "2,000,000,000", due: "15/06/2025", paid: "12/06/2025", status: "on-time" },
      { seq: 2, amount: "2,000,000,000", due: "15/09/2025", paid: "14/09/2025", status: "on-time" },
      { seq: 3, amount: "2,000,000,000", due: "15/12/2025", paid: "15/12/2025", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng thuê kho.pdf", size: "3.8 MB", date: "15/06/2025" },
      { name: "Biên bản bàn giao.pdf", size: "1.2 MB", date: "20/06/2025" },
    ],
  },
  {
    id: "HĐ-2024-112",
    customerId: "C007",
    customer: "Công ty CP Đại Minh Real",
    phone: "028 3822 1199",
    email: "admin@daiminhreal.vn",
    property: "Mặt bằng bán lẻ R01 – Vincom",
    address: "Tầng 1, Vincom Center, 72 Lê Thánh Tôn, Q.1",
    type: "Thuê",
    salesperson: "Nguyễn Thu Hà",
    value: "3,600,000,000",
    paid: 3600000000,
    total: 3600000000,
    pct: 100,
    status: "Đã ký",
    date: "10/01/2024",
    payments: [
      { seq: 1, amount: "1,800,000,000", due: "10/01/2024", paid: "08/01/2024", status: "on-time" },
      { seq: 2, amount: "1,800,000,000", due: "10/07/2024", paid: "09/07/2024", status: "on-time" },
    ],
    docs: [
      { name: "Hợp đồng thuê mặt bằng.pdf", size: "2.6 MB", date: "10/01/2024" },
      { name: "Biên bản nghiệm thu.pdf", size: "0.9 MB", date: "15/07/2024" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getContractsByCustomer(customerId: string): Contract[] {
  return contracts.filter((c) => c.customerId === customerId);
}

export function getCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getCustomerStats(customerId: string) {
  const ctrs = getContractsByCustomer(customerId);
  const totalValue = ctrs.reduce((s, c) => s + c.total, 0);
  const totalPaid = ctrs.reduce((s, c) => s + c.paid, 0);
  const activeCount = ctrs.filter((c) => c.status !== "Đã hủy").length;
  const cancelledCount = ctrs.filter((c) => c.status === "Đã hủy").length;
  return { count: ctrs.length, totalValue, totalPaid, activeCount, cancelledCount };
}
