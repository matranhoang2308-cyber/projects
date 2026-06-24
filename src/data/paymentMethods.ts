// Master payment method definitions
// Source: HARMONIE_BẢNG TÍNH THEO CĂN, VITALIS_BẢNG TÍNH THEO CĂN,
//         Sheet2 (công nợ), BẢNG TÍNH THEO THANH TOÁN SỚM, Tiến độ TT P. KD

export type InstallmentTemplate = {
  seq: number;
  pct: number;
  note: string;
  offsetMonths: number; // months from contract signing date
};

export type PaymentMethodDef = {
  id: string;
  label: string;
  shortLabel: string;
  group: "main" | "early";
  hasLoan: boolean;
  loanPct?: number;
  description: string;
  installments: InstallmentTemplate[];
};

// ─── 6 phương thức chính (HARMONIE / VITALIS, hàng 43 trở đi) ────────────────
const MAIN_METHODS: PaymentMethodDef[] = [
  {
    id: "chuan",
    label: "Chuẩn",
    shortLabel: "Chuẩn",
    group: "main",
    hasLoan: false,
    description: "Trả góp tiêu chuẩn, chia đều theo định kỳ 3 tháng/đợt",
    installments: [
      { seq: 1,  pct: 20, note: "Ký HĐMB",                    offsetMonths: 0  },
      { seq: 2,  pct: 8,  note: "Đợt 2",                       offsetMonths: 3  },
      { seq: 3,  pct: 8,  note: "Đợt 3",                       offsetMonths: 6  },
      { seq: 4,  pct: 8,  note: "Đợt 4",                       offsetMonths: 9  },
      { seq: 5,  pct: 8,  note: "Đợt 5",                       offsetMonths: 12 },
      { seq: 6,  pct: 8,  note: "Đợt 6",                       offsetMonths: 15 },
      { seq: 7,  pct: 8,  note: "Đợt 7",                       offsetMonths: 18 },
      { seq: 8,  pct: 8,  note: "Đợt 8",                       offsetMonths: 21 },
      { seq: 9,  pct: 9,  note: "Bàn giao nhà",                offsetMonths: 24 },
      { seq: 10, pct: 5,  note: "Cấp sổ hồng",                 offsetMonths: 30 },
    ],
  },
  {
    id: "tien_do_xd",
    label: "Tiến độ xây dựng",
    shortLabel: "Tiến độ XD",
    group: "main",
    hasLoan: false,
    description: "Thanh toán theo từng mốc tiến độ xây dựng công trình",
    installments: [
      { seq: 1, pct: 20, note: "Ký HĐMB",                      offsetMonths: 0  },
      { seq: 2, pct: 10, note: "Khởi công / Đào móng xong",     offsetMonths: 2  },
      { seq: 3, pct: 10, note: "Đổ sàn tầng 3",                 offsetMonths: 5  },
      { seq: 4, pct: 10, note: "Đổ sàn tầng 7",                 offsetMonths: 9  },
      { seq: 5, pct: 10, note: "Đổ sàn tầng 12",                offsetMonths: 12 },
      { seq: 6, pct: 10, note: "Đổ sàn nóc",                    offsetMonths: 15 },
      { seq: 7, pct: 10, note: "Hoàn thiện bên ngoài",          offsetMonths: 18 },
      { seq: 8, pct: 10, note: "Nghiệm thu & bàn giao",         offsetMonths: 22 },
      { seq: 9, pct: 10, note: "Cấp sổ hồng / GPXD",            offsetMonths: 30 },
    ],
  },
  {
    id: "nhanh_40",
    label: "Nhanh 40%",
    shortLabel: "Nhanh 40%",
    group: "main",
    hasLoan: false,
    description: "Thanh toán nhanh đợt đầu 40%, các đợt còn lại trải đều",
    installments: [
      { seq: 1, pct: 40, note: "Ký HĐMB – Thanh toán nhanh",   offsetMonths: 0  },
      { seq: 2, pct: 15, note: "Đợt 2",                         offsetMonths: 3  },
      { seq: 3, pct: 15, note: "Đợt 3",                         offsetMonths: 6  },
      { seq: 4, pct: 15, note: "Đợt 4",                         offsetMonths: 9  },
      { seq: 5, pct: 10, note: "Bàn giao & sổ hồng",            offsetMonths: 15 },
    ],
  },
  {
    id: "nhanh_60",
    label: "Nhanh 60%",
    shortLabel: "Nhanh 60%",
    group: "main",
    hasLoan: false,
    description: "Thanh toán nhanh đợt đầu 60%, hưởng chiết khấu cao",
    installments: [
      { seq: 1, pct: 60, note: "Ký HĐMB – Thanh toán nhanh",   offsetMonths: 0  },
      { seq: 2, pct: 15, note: "Đợt 2",                         offsetMonths: 3  },
      { seq: 3, pct: 15, note: "Đợt 3",                         offsetMonths: 6  },
      { seq: 4, pct: 10, note: "Bàn giao & sổ hồng",            offsetMonths: 12 },
    ],
  },
  {
    id: "vay_50",
    label: "Vay 50%",
    shortLabel: "Vay 50%",
    group: "main",
    hasLoan: true,
    loanPct: 50,
    description: "Vay ngân hàng 50% giá trị HĐ, phần còn lại trả góp",
    installments: [
      { seq: 1, pct: 20, note: "Ký HĐMB",                       offsetMonths: 0  },
      { seq: 2, pct: 30, note: "Giải ngân vay ngân hàng",        offsetMonths: 2  },
      { seq: 3, pct: 8,  note: "Đợt 3",                          offsetMonths: 6  },
      { seq: 4, pct: 8,  note: "Đợt 4",                          offsetMonths: 9  },
      { seq: 5, pct: 8,  note: "Đợt 5",                          offsetMonths: 12 },
      { seq: 6, pct: 8,  note: "Đợt 6",                          offsetMonths: 15 },
      { seq: 7, pct: 8,  note: "Đợt 7",                          offsetMonths: 18 },
      { seq: 8, pct: 5,  note: "Bàn giao nhà",                   offsetMonths: 24 },
      { seq: 9, pct: 5,  note: "Cấp sổ hồng",                    offsetMonths: 30 },
    ],
  },
  {
    id: "vay_60",
    label: "Vay 60%",
    shortLabel: "Vay 60%",
    group: "main",
    hasLoan: true,
    loanPct: 60,
    description: "Vay ngân hàng 60% giá trị HĐ, tối ưu dòng tiền khách hàng",
    installments: [
      { seq: 1, pct: 15, note: "Ký HĐMB",                       offsetMonths: 0  },
      { seq: 2, pct: 25, note: "Giải ngân lần 1 (ngân hàng)",    offsetMonths: 1  },
      { seq: 3, pct: 20, note: "Giải ngân lần 2 (ngân hàng)",    offsetMonths: 3  },
      { seq: 4, pct: 8,  note: "Đợt 4",                          offsetMonths: 6  },
      { seq: 5, pct: 8,  note: "Đợt 5",                          offsetMonths: 9  },
      { seq: 6, pct: 8,  note: "Đợt 6",                          offsetMonths: 12 },
      { seq: 7, pct: 8,  note: "Đợt 7",                          offsetMonths: 15 },
      { seq: 8, pct: 4,  note: "Bàn giao nhà",                   offsetMonths: 22 },
      { seq: 9, pct: 4,  note: "Cấp sổ hồng",                    offsetMonths: 30 },
    ],
  },
];

// ─── Nhóm thanh toán sớm / campaign (BẢNG TÍNH THEO THANH TOÁN SỚM) ──────────
const EARLY_METHODS: PaymentMethodDef[] = [
  {
    id: "som_30",
    label: "Thanh toán sớm 30%",
    shortLabel: "Sớm 30%",
    group: "early",
    hasLoan: false,
    description: "Thanh toán sớm 30%, hưởng chiết khấu theo chính sách GD sớm",
    installments: [
      { seq: 1, pct: 30, note: "Đặt cọc & ký HĐMB (TT sớm 30%)", offsetMonths: 0 },
      { seq: 2, pct: 30, note: "Đợt 2",                             offsetMonths: 1 },
      { seq: 3, pct: 30, note: "Đợt 3",                             offsetMonths: 3 },
      { seq: 4, pct: 5,  note: "Bàn giao nhà",                      offsetMonths: 18 },
      { seq: 5, pct: 5,  note: "Cấp sổ hồng",                       offsetMonths: 24 },
    ],
  },
  {
    id: "som_50",
    label: "Thanh toán sớm 50%",
    shortLabel: "Sớm 50%",
    group: "early",
    hasLoan: false,
    description: "Thanh toán sớm 50%, chiết khấu ưu tiên cao nhất không vay",
    installments: [
      { seq: 1, pct: 50, note: "Đặt cọc & ký HĐMB (TT sớm 50%)", offsetMonths: 0 },
      { seq: 2, pct: 30, note: "Đợt 2",                             offsetMonths: 1 },
      { seq: 3, pct: 15, note: "Đợt 3",                             offsetMonths: 3 },
      { seq: 4, pct: 5,  note: "Cấp sổ hồng",                       offsetMonths: 24 },
    ],
  },
  {
    id: "vay_som_70",
    label: "Thanh toán vay 70%",
    shortLabel: "Vay sớm 70%",
    group: "early",
    hasLoan: true,
    loanPct: 70,
    description: "Vay ngân hàng 70%, kết hợp TT sớm – chiết khấu GD sớm",
    installments: [
      { seq: 1, pct: 10, note: "Ký HĐMB",                           offsetMonths: 0 },
      { seq: 2, pct: 20, note: "Giải ngân lần 1 (ngân hàng)",        offsetMonths: 1 },
      { seq: 3, pct: 20, note: "Giải ngân lần 2 (ngân hàng)",        offsetMonths: 2 },
      { seq: 4, pct: 30, note: "Giải ngân lần 3 (ngân hàng)",        offsetMonths: 3 },
      { seq: 5, pct: 10, note: "Bàn giao nhà",                       offsetMonths: 20 },
      { seq: 6, pct: 10, note: "Cấp sổ hồng",                        offsetMonths: 30 },
    ],
  },
  {
    id: "vay_som_90",
    label: "Thanh toán vay 90%",
    shortLabel: "Vay sớm 90%",
    group: "early",
    hasLoan: true,
    loanPct: 90,
    description: "Vay ngân hàng tối đa 90%, tối thiểu hoá vốn tự có ban đầu",
    installments: [
      { seq: 1, pct: 5,  note: "Ký HĐMB",                           offsetMonths: 0 },
      { seq: 2, pct: 45, note: "Giải ngân lần 1 (ngân hàng)",        offsetMonths: 1 },
      { seq: 3, pct: 45, note: "Giải ngân lần 2 (ngân hàng)",        offsetMonths: 3 },
      { seq: 4, pct: 3,  note: "Bàn giao nhà",                       offsetMonths: 20 },
      { seq: 5, pct: 2,  note: "Cấp sổ hồng",                        offsetMonths: 30 },
    ],
  },
];

export const ALL_PAYMENT_METHODS: PaymentMethodDef[] = [
  ...MAIN_METHODS,
  ...EARLY_METHODS,
];

export function getPaymentMethod(id: string): PaymentMethodDef | undefined {
  return ALL_PAYMENT_METHODS.find((m) => m.id === id);
}

/** Build installment rows with concrete due dates from a contract signing date */
export function buildInstallments(
  method: PaymentMethodDef,
  signingDate: string, // ISO: "2026-04-15"
  totalValue: string,
): Array<{ seq: number; pct: string; amount: string; dueDate: string; note: string }> {
  const base = signingDate ? new Date(signingDate) : new Date();
  const total = parseFloat(totalValue.replace(/[^0-9.]/g, "")) || 0;

  return method.installments.map((t) => {
    const due = new Date(base);
    due.setMonth(due.getMonth() + t.offsetMonths);
    const dueISO = due.toISOString().slice(0, 10);
    const amount = total ? Math.round((total * t.pct) / 100).toLocaleString("vi") : "";
    return { seq: t.seq, pct: String(t.pct), amount, dueDate: dueISO, note: t.note };
  });
}
