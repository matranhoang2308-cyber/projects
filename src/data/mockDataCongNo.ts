export type PaymentStatus =
  | "not-due"
  | "upcoming"
  | "paid"
  | "partial"
  | "overpaid"
  | "overdue"
  | "grace-period"
  | "deposit-forfeited"
  | "extended";

export type StageStatus = "completed" | "in-progress" | "pending";
export type ExtensionType = "with-penalty" | "no-penalty";
export type InvoiceStatus = "pending" | "issued" | "cancelled";
export type DebtStatus = "current" | "overdue" | "grace-period" | "forfeited" | "extended";

export interface InvoiceFile {
  invoiceNumber: string;
  invoiceDate?: string;
  invoiceStatus: InvoiceStatus;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  issuedBy: string;
  bankName: string;
  bankAccount: string;
  transactionRef: string;
  principalAmount: number; // Số tiền gốc được xuất hóa đơn (tỷ VND)
  nonInvoiceInterest?: number; // Lãi không xuất hóa đơn (tỷ VND)
  pendingInvoiceAmount?: number; // Số tiền chưa xuất hóa đơn (tỷ VND)
}

export type AdjustmentTarget =
  | "original-installment"
  | "extension-installment"
  | "late-interest"
  | "extension-fee"
  | "due-date"
  | "paid-amount"
  | "remaining-principal"
  | "status";

export interface DebtAuditLog {
  id: string;
  target: AdjustmentTarget;
  targetId: string; // ID of record or extension
  fieldName: string; // Human readable field name
  oldValue: string | number;
  newValue: string | number;
  reason: string;
  requestedBy: string;
  approvedBy: string;
  createdAt: string; // ISO date string
  attachmentName?: string;
  note?: string;
}

export interface ExtensionInstallment {
  id: string;
  label: string;      // "Đợt gia hạn 1/2"
  dueDate: string;
  amount: number;     // tỷ VND
  status: PaymentStatus;
  paidDate?: string;
  invoice?: InvoiceFile;
}

export interface PaymentExtension {
  id: string;
  requestDate: string;        // ngày KH gửi yêu cầu
  approvedDate: string;       // ngày nhân viên sale duyệt
  approvedBy: string;         // tên nhân viên sale
  type: ExtensionType;        // có/không tính phí phạt
  penaltyRatePercent: number; // %/năm (dùng khi type="with-penalty")
  reason: string;             // lý do gia hạn
  notes?: string;             // ghi chú nội bộ
  installments: ExtensionInstallment[]; // ≥1 đợt chia nhỏ
}

export interface PaymentRecord {
  id: string;
  installmentCode: string; // Mã đợt thanh toán (DOT1, DOT2, etc.)
  label: string;
  dueDate: string;
  paidDate?: string;
  baseAmount: number; // Số tiền gốc phải thu (tỷ VND)
  paidAmount: number; // Số tiền đã thu (tỷ VND)
  remainingAmount: number; // Số tiền gốc còn lại (tỷ VND)
  overpaidAmount?: number; // Số tiền thanh toán dư (tỷ VND)
  status: PaymentStatus;
  debtStatus: DebtStatus;

  // Grace period & late interest
  gracePeriodDays?: number; // Số ngày ân hạn (mặc định 10)
  daysAfterDue?: number; // Số ngày sau hạn
  interestStartDate?: string; // Ngày bắt đầu tính lãi (sau grace period)
  interestDays?: number; // Số ngày tính lãi thực tế
  dailyInterestRate?: number; // Lãi suất %/ngày
  lateInterest?: number; // Lãi trễ hạn (tỷ VND)
  adjustedLateInterest?: number; // Lãi sau điều chỉnh (nếu có)
  interestStatus?: "not-applicable" | "grace-period" | "accruing" | "calculated";

  // Legacy fields (for backward compatibility)
  lateFee?: number;
  daysOverdue?: number;

  invoice?: InvoiceFile;
  adjustmentNote?: string; // Ghi chú điều chỉnh
  extensions?: PaymentExtension[]; // danh sách gia hạn (index 0 = cũ nhất, cuối = hiện tại)
  parentInstallmentId?: string; // Nếu là child installment của gia hạn
  auditLogs?: DebtAuditLog[]; // Lịch sử điều chỉnh
}

export interface PaymentStage {
  id: string;
  stageNumber: number;
  name: string;
  description: string;
  period: string;
  totalAmount: number;
  paidAmount: number;
  stageStatus: StageStatus;
  records: PaymentRecord[];
}

export interface Contract {
  id: string;
  contractCode: string; // Mã hợp đồng
  projectName: string;
  tower?: string; // Tòa/block
  unit: string; // Mã căn
  productType?: string; // Loại sản phẩm (Sky Garden, etc.)
  paymentMethod?: string; // Phương thức thanh toán
  contractValue: number;
  paidAmount: number;
  paymentProgress: number;
  dueDate: string;
  status: PaymentStatus;
  debtStatus?: DebtStatus;
  overdueAmount?: number;
  latePenaltyRate?: number;
  daysOverdue?: number;
  lateFee?: number;
  stages?: PaymentStage[];
  salesperson?: string; // Nhân viên phụ trách
}

export interface Customer {
  id: string;
  customerCode: string; // Mã khách hàng
  name: string;
  initials: string;
  email: string;
  phone?: string;
  avatarColor: string;
  contracts: Contract[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatVND(amount: number): string {
  if (amount >= 1) {
    const fixed = amount.toFixed(3).replace(/\.?0+$/, "");
    return `${fixed} tỷ`;
  }
  const mil = (amount * 1000).toFixed(1).replace(/\.0$/, "");
  return `${mil} triệu`;
}

export function calcLateFee(amount: number, ratePercent: number, days: number): number {
  return (amount * ratePercent) / 100 / 365 * days;
}

// ─── Payment & Interest Calculation Helpers ───────────────────────────────────

/**
 * Calculate days after due date
 */
export function calculateDaysAfterDue(dueDate: string, currentDate: string = new Date().toISOString()): number {
  const due = new Date(dueDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate interest days (excluding grace period)
 * CORRECT RULE: If daysAfterDue <= 10, no interest. If > 10, interest = daysAfterDue (from due date).
 * @param daysAfterDue - days after due date
 * @param gracePeriodDays - grace period days (default 10)
 * @returns interest days (0 if within grace period, otherwise daysAfterDue)
 */
export function calculateInterestDays(daysAfterDue: number, gracePeriodDays: number = 10): number {
  if (daysAfterDue <= gracePeriodDays) return 0;
  return daysAfterDue; // Interest calculated from due date, not after grace period
}

/**
 * Calculate late interest with grace period
 * @param principalAmount - remaining principal (tỷ VND)
 * @param dailyRatePercent - daily interest rate (e.g., 0.05 for 0.05%/day)
 * @param daysAfterDue - days after due date
 * @param gracePeriodDays - grace period days (default 10)
 * @param installmentNumber - installment number (1-based). If 1, no interest.
 * @returns late interest amount (tỷ VND)
 */
export function calculateLateInterest(
  principalAmount: number,
  dailyRatePercent: number,
  daysAfterDue: number,
  gracePeriodDays: number = 10,
  installmentNumber: number = 2
): number {
  // Rule: No late interest for Installment 1 (deposit forfeited instead)
  if (installmentNumber === 1) return 0;

  // Calculate interest days (after grace period)
  const interestDays = calculateInterestDays(daysAfterDue, gracePeriodDays);
  if (interestDays <= 0) return 0;

  // Calculate late interest (tỷ VND)
  return (principalAmount * dailyRatePercent * interestDays) / 100;
}

/**
 * Allocate payment across installment principal
 * @param paidAmount - amount paid (tỷ VND)
 * @param principalDue - principal due (tỷ VND)
 * @returns allocation result
 */
export function allocatePayment(paidAmount: number, principalDue: number) {
  if (paidAmount >= principalDue) {
    // Exact or overpayment
    return {
      allocatedToPrincipal: principalDue,
      overpaid: paidAmount - principalDue,
      remaining: 0,
      status: paidAmount === principalDue ? "paid" as PaymentStatus : "overpaid" as PaymentStatus,
    };
  } else {
    // Underpayment
    return {
      allocatedToPrincipal: paidAmount,
      overpaid: 0,
      remaining: principalDue - paidAmount,
      status: "partial" as PaymentStatus,
    };
  }
}

/**
 * Normalize payment record with new fields (for backward compatibility)
 */
export function normalizePaymentRecord(record: Partial<PaymentRecord>): PaymentRecord {
  const baseAmount = record.baseAmount ?? 0;
  const paidAmount = record.paidAmount ?? (record.status === "paid" && record.paidDate ? baseAmount : 0);
  const remainingAmount = record.remainingAmount ?? baseAmount - paidAmount;

  // Calculate days after due
  const daysAfterDue = record.daysAfterDue ?? record.daysOverdue ?? 0;

  // Calculate interest days (excluding grace period)
  const gracePeriodDays = record.gracePeriodDays ?? 10;
  const interestDays = calculateInterestDays(daysAfterDue, gracePeriodDays);

  // Calculate interest start date (always due date if overdue, but interest only applies after grace)
  const interestStartDate = record.interestStartDate ?? (() => {
    if (daysAfterDue > gracePeriodDays && record.dueDate) {
      return record.dueDate; // Interest starts from due date
    }
    return undefined;
  })();

  // Determine interest status
  const interestStatus = record.interestStatus ?? (() => {
    if (record.status === "paid") return "not-applicable";
    if (daysAfterDue === 0) return "not-applicable";
    if (daysAfterDue <= gracePeriodDays) return "grace-period";
    return "accruing";
  })();

  // Determine debt status
  const debtStatus = record.debtStatus ?? (() => {
    if (record.status === "paid") return "current";
    if (record.status === "extended") return "extended";
    if (record.status === "deposit-forfeited") return "forfeited";
    if (daysAfterDue > 0 && daysAfterDue <= gracePeriodDays) return "grace-period";
    if (daysAfterDue > gracePeriodDays) return "overdue";
    return "current";
  })() as DebtStatus;

  return {
    id: record.id!,
    installmentCode: record.installmentCode ?? record.label?.replace(/[^\w]/g, "") ?? "DOT1",
    label: record.label!,
    dueDate: record.dueDate!,
    paidDate: record.paidDate,
    baseAmount,
    paidAmount,
    remainingAmount,
    overpaidAmount: record.overpaidAmount,
    status: record.status!,
    debtStatus,
    gracePeriodDays,
    daysAfterDue,
    interestStartDate,
    interestDays,
    dailyInterestRate: record.dailyInterestRate ?? 0.05, // Default 0.05%/day
    lateInterest: record.lateInterest ?? record.lateFee,
    interestStatus: interestStatus as any,
    lateFee: record.lateFee,
    daysOverdue: record.daysOverdue,
    invoice: record.invoice ? normalizeInvoice(record.invoice, baseAmount) : undefined,
    adjustmentNote: record.adjustmentNote,
    extensions: record.extensions,
    parentInstallmentId: record.parentInstallmentId,
  };
}

/**
 * Normalize invoice with new fields (for backward compatibility)
 */
export function normalizeInvoice(invoice: Partial<InvoiceFile>, principalAmount: number): InvoiceFile {
  return {
    invoiceNumber: invoice.invoiceNumber!,
    invoiceDate: invoice.invoiceDate ?? invoice.uploadDate,
    invoiceStatus: invoice.invoiceStatus ?? "issued",
    fileName: invoice.fileName!,
    fileSize: invoice.fileSize!,
    uploadDate: invoice.uploadDate!,
    issuedBy: invoice.issuedBy!,
    bankName: invoice.bankName!,
    bankAccount: invoice.bankAccount!,
    transactionRef: invoice.transactionRef!,
    principalAmount: invoice.principalAmount ?? principalAmount,
    nonInvoiceInterest: invoice.nonInvoiceInterest,
    pendingInvoiceAmount: invoice.pendingInvoiceAmount,
  };
}

// ─── Aggregation Helpers ──────────────────────────────────────────────────────

export function getCustomerTotalValue(c: Customer): number {
  return c.contracts.reduce((s, ct) => s + ct.contractValue, 0);
}
export function getCustomerTotalPaid(c: Customer): number {
  return c.contracts.reduce((s, ct) => s + ct.paidAmount, 0);
}
export function getCustomerProgress(c: Customer): number {
  const total = getCustomerTotalValue(c);
  const paid = getCustomerTotalPaid(c);
  return total > 0 ? Math.round((paid / total) * 100) : 0;
}
export function getCustomerWorstStatus(c: Customer): PaymentStatus {
  if (c.contracts.some((ct) => ct.status === "overdue")) return "overdue";
  if (c.contracts.some((ct) => ct.status === "upcoming")) return "upcoming";
  return "paid";
}
export function getCustomerNextDue(c: Customer): { date: string; contract: Contract } | null {
  const overdue = c.contracts
    .filter((ct) => ct.status === "overdue")
    .sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0));
  if (overdue.length > 0) return { date: overdue[0].dueDate, contract: overdue[0] };
  const upcoming = c.contracts
    .filter((ct) => ct.status === "upcoming")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  if (upcoming.length > 0) return { date: upcoming[0].dueDate, contract: upcoming[0] };
  return null;
}
export function getCustomerTotalLateFee(c: Customer): number {
  return c.contracts.reduce((s, ct) => s + getContractTotalLateFee(ct), 0);
}
export function getContractTotalLateFee(ct: Contract): number {
  if (ct.stages) {
    return ct.stages.flatMap((st) => st.records).reduce((acc, r) => acc + (r.lateFee ?? 0), 0);
  }
  return ct.lateFee ?? 0;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const customers: Customer[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // 1. Nguyễn Văn An — 1 hợp đồng · Vinhomes Grand Park · 75% paid
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "1",
    name: "Nguyễn Văn An",
    initials: "NA",
    email: "nguyenvanan@email.com",
    phone: "0901 234 567",
    avatarColor: "bg-violet-100 text-violet-700",
    contracts: [
      {
        id: "c1-1",
        projectName: "Vinhomes Grand Park",
        unit: "S1.05-12",
        contractValue: 4.5,
        paidAmount: 3.375,
        paymentProgress: 75,
        dueDate: "2025-12-20",
        status: "paid",
        stages: [
          {
            id: "c1s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T3/2022 – T6/2022",
            totalAmount: 0.45,
            paidAmount: 0.45,
            stageStatus: "completed",
            records: [
              {
                id: "c1r1-1",
                label: "Phí đặt cọc giữ chỗ (3%)",
                dueDate: "2022-03-10",
                paidDate: "2022-03-08",
                baseAmount: 0.135,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2022-001",
                  fileName: "hoa-don-dat-coc-vgp-2022.pdf",
                  fileSize: "98 KB",
                  uploadDate: "2022-03-09",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "Vietcombank – CN TP.HCM",
                  bankAccount: "0071003920481",
                  transactionRef: "VCB20220308-11203",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.135,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c1r1-2",
                label: "Ký HĐMB – Đợt 1 (7%)",
                dueDate: "2022-06-25",
                paidDate: "2022-06-20",
                baseAmount: 0.315,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2022-008",
                  fileName: "hoa-don-ky-hdmb-dot1-vgp.pdf",
                  fileSize: "187 KB",
                  uploadDate: "2022-06-21",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "Vietcombank – CN TP.HCM",
                  bankAccount: "0071003920481",
                  transactionRef: "VCB20220620-29814",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.315,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c1s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T12/2022 – T1/2025",
            totalAmount: 2.925,
            paidAmount: 2.925,
            stageStatus: "completed",
            records: [
              {
                id: "c1r2-1",
                label: "Đợt 2 – Xong phần móng (15%)",
                dueDate: "2022-12-15",
                paidDate: "2022-12-05",
                baseAmount: 0.675,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2022-031",
                  fileName: "hoa-don-dot2-mong-vgp.pdf",
                  fileSize: "164 KB",
                  uploadDate: "2022-12-06",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "MB Bank – CN Quận 9",
                  bankAccount: "0912034871203",
                  transactionRef: "MBB20221205-48201",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.675,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c1r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2023-08-25",
                paidDate: "2023-08-10",
                baseAmount: 0.675,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2023-014",
                  fileName: "hoa-don-dot3-tang5-vgp.pdf",
                  fileSize: "172 KB",
                  uploadDate: "2023-08-11",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "MB Bank – CN Quận 9",
                  bankAccount: "0912034871203",
                  transactionRef: "MBB20230810-61042",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.675,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c1r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2024-04-20",
                paidDate: "2024-04-08",
                baseAmount: 0.675,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2024-006",
                  fileName: "hoa-don-dot4-tang10-vgp.pdf",
                  fileSize: "158 KB",
                  uploadDate: "2024-04-09",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "MB Bank – CN Quận 9",
                  bankAccount: "0912034871203",
                  transactionRef: "MBB20240408-77390",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.675,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c1r2-4",
                label: "Đợt 5 – Hoàn thành tầng 15 (20%)",
                dueDate: "2025-01-15",
                paidDate: "2025-01-08",
                baseAmount: 0.9,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2025-001",
                  fileName: "hoa-don-dot5-tang15-vgp.pdf",
                  fileSize: "181 KB",
                  uploadDate: "2025-01-09",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "MB Bank – CN Quận 9",
                  bankAccount: "0912034871203",
                  transactionRef: "MBB20250108-90211",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.9,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c1s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T12/2025 – T6/2026",
            totalAmount: 1.125,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c1r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (20%)",
                dueDate: "2025-12-20",
                baseAmount: 0.9,
                status: "upcoming",
              },
              {
                id: "c1r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2026-06-20",
                baseAmount: 0.225,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. Trần Thị Bích — 2 hợp đồng
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "2",
    name: "Trần Thị Bích",
    initials: "TB",
    email: "tranthilich@email.com",
    phone: "0912 345 678",
    avatarColor: "bg-sky-100 text-sky-700",
    contracts: [
      // ── c2-1: The Sun Avenue · 40% paid · upcoming ──────────────────────
      {
        id: "c2-1",
        projectName: "The Sun Avenue",
        unit: "B3.08-22",
        contractValue: 3.2,
        paidAmount: 1.28,
        paymentProgress: 40,
        dueDate: "2026-04-30",
        status: "upcoming",
        stages: [
          {
            id: "c2-1-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T1/2023 – T1/2023",
            totalAmount: 0.32,
            paidAmount: 0.32,
            stageStatus: "completed",
            records: [
              {
                id: "c2-1-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2023-01-20",
                paidDate: "2023-01-18",
                baseAmount: 0.32,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-TSA-2023-001",
                  fileName: "hoa-don-dat-coc-tsa-2023.pdf",
                  fileSize: "121 KB",
                  uploadDate: "2023-01-19",
                  issuedBy: "The Sun Avenue – Phòng Tài chính",
                  bankName: "BIDV – CN Quận 2",
                  bankAccount: "12310004819201",
                  transactionRef: "BIDV20230118-30041",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.32,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c2-1-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T9/2023 – T11/2026",
            totalAmount: 1.92,
            paidAmount: 0.96,
            stageStatus: "in-progress",
            records: [
              {
                id: "c2-1-r2",
                label: "Đợt 2 – Xong phần móng (15%)",
                dueDate: "2023-09-15",
                paidDate: "2023-09-12",
                baseAmount: 0.48,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-TSA-2023-018",
                  fileName: "hoa-don-dot2-mong-tsa.pdf",
                  fileSize: "148 KB",
                  uploadDate: "2023-09-13",
                  issuedBy: "The Sun Avenue – Phòng Tài chính",
                  bankName: "BIDV – CN Quận 2",
                  bankAccount: "12310004819201",
                  transactionRef: "BIDV20230912-58203",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.48,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c2-1-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2024-05-15",
                paidDate: "2024-05-12",
                baseAmount: 0.48,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-TSA-2024-009",
                  fileName: "hoa-don-dot3-tang5-tsa.pdf",
                  fileSize: "153 KB",
                  uploadDate: "2024-05-13",
                  issuedBy: "The Sun Avenue – Phòng Tài chính",
                  bankName: "BIDV – CN Quận 2",
                  bankAccount: "12310004819201",
                  transactionRef: "BIDV20240512-71904",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.48,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c2-1-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2026-04-30",
                baseAmount: 0.48,
                status: "upcoming",
              },
              {
                id: "c2-1-r5",
                label: "Đợt 5 – Hoàn thành tầng 15 (15%)",
                dueDate: "2026-11-15",
                baseAmount: 0.48,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c2-1-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T5/2027 – T11/2027",
            totalAmount: 0.96,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c2-1-r6",
                label: "Bàn giao căn hộ & nghiệm thu (25%)",
                dueDate: "2027-05-30",
                baseAmount: 0.8,
                status: "upcoming",
              },
              {
                id: "c2-1-r7",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2027-11-30",
                baseAmount: 0.16,
                status: "upcoming",
              },
            ],
          },
        ],
      },

      // ── c2-2: Akari City · 25% paid · upcoming ──────────────────────────
      {
        id: "c2-2",
        projectName: "Akari City",
        unit: "B1.09-03",
        contractValue: 2.8,
        paidAmount: 0.7,
        paymentProgress: 25,
        dueDate: "2026-07-15",
        status: "upcoming",
        stages: [
          {
            id: "c2-2-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T6/2023 – T6/2023",
            totalAmount: 0.28,
            paidAmount: 0.28,
            stageStatus: "completed",
            records: [
              {
                id: "c2-2-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2023-06-10",
                paidDate: "2023-06-08",
                baseAmount: 0.28,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-AKC-2023-001",
                  fileName: "hoa-don-dat-coc-akari-2023.pdf",
                  fileSize: "115 KB",
                  uploadDate: "2023-06-09",
                  issuedBy: "Akari City – Phòng Tài chính",
                  bankName: "Sacombank – CN Bình Tân",
                  bankAccount: "060137492830",
                  transactionRef: "SCB20230608-40921",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.28,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c2-2-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T2/2024 – T7/2027",
            totalAmount: 1.82,
            paidAmount: 0.42,
            stageStatus: "in-progress",
            records: [
              {
                id: "c2-2-r2",
                label: "Đợt 2 – Xong phần móng (15%)",
                dueDate: "2024-02-20",
                paidDate: "2024-02-18",
                baseAmount: 0.42,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-AKC-2024-003",
                  fileName: "hoa-don-dot2-mong-akari.pdf",
                  fileSize: "139 KB",
                  uploadDate: "2024-02-19",
                  issuedBy: "Akari City – Phòng Tài chính",
                  bankName: "Sacombank – CN Bình Tân",
                  bankAccount: "060137492830",
                  transactionRef: "SCB20240218-52104",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.42,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c2-2-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2026-07-15",
                baseAmount: 0.42,
                status: "upcoming",
              },
              {
                id: "c2-2-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2027-01-15",
                baseAmount: 0.42,
                status: "upcoming",
              },
              {
                id: "c2-2-r5",
                label: "Đợt 5 – Hoàn thiện thô (20%)",
                dueDate: "2027-07-15",
                baseAmount: 0.56,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c2-2-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T1/2028 – T7/2028",
            totalAmount: 0.7,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c2-2-r6",
                label: "Bàn giao căn hộ & nghiệm thu (20%)",
                dueDate: "2028-01-15",
                baseAmount: 0.56,
                status: "upcoming",
              },
              {
                id: "c2-2-r7",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2028-07-15",
                baseAmount: 0.14,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. Lê Minh Cường — 2 hợp đồng
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "3",
    name: "Lê Minh Cường",
    initials: "LC",
    email: "leminhcuong@email.com",
    phone: "0933 456 789",
    avatarColor: "bg-amber-100 text-amber-700",
    contracts: [
      // ── c3-1: Masteri Thảo Điền · 52% paid · OVERDUE (full stages + invoices)
      {
        id: "c3-1",
        projectName: "Masteri Thảo Điền",
        unit: "T4.12-08",
        contractValue: 6.8,
        paidAmount: 3.536,
        paymentProgress: 52,
        dueDate: "2026-02-15",
        status: "overdue",
        overdueAmount: 0.952,
        latePenaltyRate: 14,
        daysOverdue: 59,
        lateFee: calcLateFee(0.952, 14, 59),
        stages: [
          {
            id: "s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T3/2022 – T6/2022",
            totalAmount: 0.68,
            paidAmount: 0.68,
            stageStatus: "completed",
            records: [
              {
                id: "r1-1",
                label: "Phí đặt cọc giữ chỗ",
                dueDate: "2022-03-10",
                paidDate: "2022-03-10",
                baseAmount: 0.2,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-2022-0001",
                  fileName: "hoa-don-dat-coc-2022.pdf",
                  fileSize: "118 KB",
                  uploadDate: "2022-03-11",
                  issuedBy: "Masteri Thảo Điền – Phòng Tài chính",
                  bankName: "Vietcombank – CN Quận 2",
                  bankAccount: "0071003748291",
                  transactionRef: "VCB20220310-84732",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.2,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "r1-2",
                label: "Ký HĐMB – Đợt 1 (8%)",
                dueDate: "2022-06-15",
                paidDate: "2022-06-14",
                baseAmount: 0.48,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-2022-0012",
                  fileName: "hoa-don-ky-hdmb-dot1-2022.pdf",
                  fileSize: "245 KB",
                  uploadDate: "2022-06-15",
                  issuedBy: "Masteri Thảo Điền – Phòng Tài chính",
                  bankName: "Vietcombank – CN Quận 2",
                  bankAccount: "0071003748291",
                  transactionRef: "VCB20220614-19283",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.48,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng dự án",
            period: "T12/2022 – T8/2026",
            totalAmount: 4.76,
            paidAmount: 2.856,
            stageStatus: "in-progress",
            records: [
              {
                id: "r2-1",
                label: "Đợt 2 – Xong phần móng (15%)",
                dueDate: "2022-12-20",
                paidDate: "2022-12-19",
                baseAmount: 0.952,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-2022-0031",
                  fileName: "hoa-don-dot2-mong-2022.pdf",
                  fileSize: "203 KB",
                  uploadDate: "2022-12-20",
                  issuedBy: "Masteri Thảo Điền – Phòng Tài chính",
                  bankName: "Techcombank – CN Bình Thạnh",
                  bankAccount: "19033781823015",
                  transactionRef: "TCB20221219-55021",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.952,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2023-09-15",
                paidDate: "2023-09-14",
                baseAmount: 0.952,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-2023-0018",
                  fileName: "hoa-don-dot3-tang5-2023.pdf",
                  fileSize: "198 KB",
                  uploadDate: "2023-09-15",
                  issuedBy: "Masteri Thảo Điền – Phòng Tài chính",
                  bankName: "Techcombank – CN Bình Thạnh",
                  bankAccount: "19033781823015",
                  transactionRef: "TCB20230914-77340",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.952,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2024-05-10",
                paidDate: "2024-05-09",
                baseAmount: 0.952,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-2024-0009",
                  fileName: "hoa-don-dot4-tang10-2024.pdf",
                  fileSize: "211 KB",
                  uploadDate: "2024-05-10",
                  issuedBy: "Masteri Thảo Điền – Phòng Tài chính",
                  bankName: "Techcombank – CN Bình Thạnh",
                  bankAccount: "19033781823015",
                  transactionRef: "TCB20240509-30184",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.952,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "r2-4",
                installmentCode: "DOT5",
                label: "Đợt 5 – Hoàn thành tầng 15 (15%)",
                dueDate: "2026-02-15",
                baseAmount: 0.952,
                paidAmount: 0,
                remainingAmount: 0.952,
                status: "overdue",
                debtStatus: "overdue",
                daysOverdue: 59,
                daysAfterDue: 115,
                gracePeriodDays: 10,
                dailyInterestRate: 0.05,
                lateFee: calcLateFee(0.952, 14, 59),
                extensions: [
                  {
                    id: "ext-c3-r24-v1",
                    requestDate: "2026-02-10",
                    approvedDate: "2026-02-12",
                    approvedBy: "Nguyễn Thành Long",
                    type: "with-penalty",
                    penaltyRatePercent: 14,
                    reason: "Khách hàng tạm thời gặp khó khăn tài chính do điều chuyển công tác sang tỉnh. Dự kiến ổn định tài chính trong tháng 3/2026. Yêu cầu gia hạn 2 đợt.",
                    notes: "Đã xác nhận với phòng tài chính.",
                    installments: [
                      {
                        id: "ext-c3-r24-v1-i1",
                        label: "Đợt gia hạn 1/2",
                        dueDate: "2026-03-31",
                        amount: 0.476,
                        status: "overdue",
                      },
                      {
                        id: "ext-c3-r24-v1-i2",
                        label: "Đợt gia hạn 2/2",
                        dueDate: "2026-04-30",
                        amount: 0.476,
                        status: "overdue",
                      },
                    ],
                  },
                  {
                    id: "ext-c3-r24-v2",
                    requestDate: "2026-05-01",
                    approvedDate: "2026-05-03",
                    approvedBy: "Trần Hoài Nam",
                    type: "no-penalty",
                    penaltyRatePercent: 0,
                    reason: "Khách hàng đã cung cấp bằng chứng chuyển khoản bị trì hoãn từ phía ngân hàng. BGĐ đồng ý miễn phí phạt cho đợt gia hạn thứ 2 này.",
                    notes: "BGĐ phê duyệt miễn phạt ngày 03/05/2026. Lưu email xác nhận.",
                    installments: [
                      {
                        id: "ext-c3-r24-v2-i1",
                        label: "Đợt gia hạn 1/2",
                        dueDate: "2026-05-31",
                        amount: 0.476,
                        status: "upcoming",
                      },
                      {
                        id: "ext-c3-r24-v2-i2",
                        label: "Đợt gia hạn 2/2",
                        dueDate: "2026-06-30",
                        amount: 0.476,
                        status: "upcoming",
                      },
                    ],
                  },
                ],
                adjustedLateInterest: 0.005, // Reduced from calculated ~0.01 to 0.005
                auditLogs: [
                  {
                    id: "audit-001",
                    target: "late-interest",
                    targetId: "r2-4",
                    fieldName: "Lãi trễ hạn",
                    oldValue: "~0.01 tỷ VNĐ",
                    newValue: "0.005 tỷ VNĐ",
                    reason: "Khách hàng đã có cam kết thanh toán toàn bộ trong tháng 6/2026 và đã nộp đơn xin giảm lãi. BGĐ đồng ý giảm 50% lãi trễ hạn.",
                    requestedBy: "Nguyễn Thành Long",
                    approvedBy: "Trần Hoài Nam - BGĐ",
                    createdAt: "2026-05-10T14:30:00.000Z",
                    note: "Đơn xin giảm lãi đã được BGĐ phê duyệt ngày 10/05/2026",
                  },
                ],
              },
              {
                id: "r2-5",
                label: "Đợt 6 – Hoàn thiện thô (10%)",
                dueDate: "2026-08-15",
                baseAmount: 0.952,
                status: "upcoming",
              },
            ],
          },
          {
            id: "s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T12/2026 – T6/2027",
            totalAmount: 1.36,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (15%)",
                dueDate: "2026-12-30",
                baseAmount: 1.02,
                status: "upcoming",
              },
              {
                id: "r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2027-06-30",
                baseAmount: 0.34,
                status: "upcoming",
              },
            ],
          },
        ],
      },

      // ── c3-2: Vinhomes Grand Park · 30% paid · upcoming ─────────────────
      {
        id: "c3-2",
        projectName: "Vinhomes Grand Park",
        unit: "A3.07-15",
        contractValue: 3.5,
        paidAmount: 1.05,
        paymentProgress: 30,
        dueDate: "2026-06-20",
        status: "upcoming",
        stages: [
          {
            id: "c3-2-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T4/2023 – T4/2023",
            totalAmount: 0.35,
            paidAmount: 0.35,
            stageStatus: "completed",
            records: [
              {
                id: "c3-2-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2023-04-15",
                paidDate: "2023-04-13",
                baseAmount: 0.35,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2023-004",
                  fileName: "hoa-don-dat-coc-vgp-a3-2023.pdf",
                  fileSize: "127 KB",
                  uploadDate: "2023-04-14",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "Vietcombank – CN TP.HCM",
                  bankAccount: "0071003920481",
                  transactionRef: "VCB20230413-38201",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.35,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c3-2-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T3/2024 – T6/2027",
            totalAmount: 2.275,
            paidAmount: 0.7,
            stageStatus: "in-progress",
            records: [
              {
                id: "c3-2-r2",
                label: "Đợt 2 – Xong phần móng (20%)",
                dueDate: "2024-03-15",
                paidDate: "2024-03-13",
                baseAmount: 0.7,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-VGP-2024-002",
                  fileName: "hoa-don-dot2-mong-vgp-a3.pdf",
                  fileSize: "156 KB",
                  uploadDate: "2024-03-14",
                  issuedBy: "Vinhomes Grand Park – Phòng Tài chính",
                  bankName: "Vietcombank – CN TP.HCM",
                  bankAccount: "0071003920481",
                  transactionRef: "VCB20240313-50192",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.7,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c3-2-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2026-06-20",
                baseAmount: 0.525,
                status: "upcoming",
              },
              {
                id: "c3-2-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2026-12-20",
                baseAmount: 0.525,
                status: "upcoming",
              },
              {
                id: "c3-2-r5",
                label: "Đợt 5 – Hoàn thiện thô (15%)",
                dueDate: "2027-06-20",
                baseAmount: 0.525,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c3-2-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T12/2027 – T6/2028",
            totalAmount: 0.875,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c3-2-r6",
                label: "Bàn giao căn hộ & nghiệm thu (20%)",
                dueDate: "2027-12-20",
                baseAmount: 0.7,
                status: "upcoming",
              },
              {
                id: "c3-2-r7",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2028-06-20",
                baseAmount: 0.175,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. Phạm Thị Dung — 1 hợp đồng · Riverpark Premier · 85% paid
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "4",
    name: "Phạm Thị Dung",
    initials: "PD",
    email: "phamthidung@email.com",
    phone: "0944 567 890",
    avatarColor: "bg-emerald-100 text-emerald-700",
    contracts: [
      {
        id: "c4-1",
        projectName: "Riverpark Premier",
        unit: "A2.10-14",
        contractValue: 5.1,
        paidAmount: 4.335,
        paymentProgress: 85,
        dueDate: "2025-11-10",
        status: "paid",
        stages: [
          {
            id: "c4s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T5/2021 – T5/2021",
            totalAmount: 0.51,
            paidAmount: 0.51,
            stageStatus: "completed",
            records: [
              {
                id: "c4r1-1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2021-05-10",
                paidDate: "2021-05-08",
                baseAmount: 0.51,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2021-001",
                  fileName: "hoa-don-dat-coc-rpr-2021.pdf",
                  fileSize: "109 KB",
                  uploadDate: "2021-05-09",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20210508-18203",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.51,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c4s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T1/2022 – T1/2025",
            totalAmount: 3.825,
            paidAmount: 3.825,
            stageStatus: "completed",
            records: [
              {
                id: "c4r2-1",
                label: "Đợt 2 – Xong phần móng (15%)",
                dueDate: "2022-01-15",
                paidDate: "2022-01-13",
                baseAmount: 0.765,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2022-002",
                  fileName: "hoa-don-dot2-mong-rpr.pdf",
                  fileSize: "145 KB",
                  uploadDate: "2022-01-14",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20220113-34021",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.765,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c4r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2022-09-10",
                paidDate: "2022-09-08",
                baseAmount: 0.765,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2022-019",
                  fileName: "hoa-don-dot3-tang5-rpr.pdf",
                  fileSize: "151 KB",
                  uploadDate: "2022-09-09",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20220908-49301",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.765,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c4r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2023-05-10",
                paidDate: "2023-05-08",
                baseAmount: 0.765,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2023-007",
                  fileName: "hoa-don-dot4-tang10-rpr.pdf",
                  fileSize: "163 KB",
                  uploadDate: "2023-05-09",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20230508-61920",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.765,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c4r2-4",
                label: "Đợt 5 – Hoàn thành tầng 15 (15%)",
                dueDate: "2024-01-10",
                paidDate: "2024-01-08",
                baseAmount: 0.765,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2024-001",
                  fileName: "hoa-don-dot5-tang15-rpr.pdf",
                  fileSize: "158 KB",
                  uploadDate: "2024-01-09",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20240108-73401",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.765,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c4r2-5",
                label: "Đợt 6 – Hoàn thiện thô (15%)",
                dueDate: "2025-01-10",
                paidDate: "2025-01-08",
                baseAmount: 0.765,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-RPR-2025-001",
                  fileName: "hoa-don-dot6-hoan-thien-rpr.pdf",
                  fileSize: "167 KB",
                  uploadDate: "2025-01-09",
                  issuedBy: "Riverpark Premier – Phòng Tài chính",
                  bankName: "ACB – CN Quận 7",
                  bankAccount: "9180038291034",
                  transactionRef: "ACB20250108-85021",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.765,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c4s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T11/2025 – T5/2026",
            totalAmount: 0.765,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c4r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (10%)",
                dueDate: "2025-11-10",
                baseAmount: 0.51,
                status: "upcoming",
              },
              {
                id: "c4r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2026-05-10",
                baseAmount: 0.255,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. Hoàng Văn Em — 1 hợp đồng · Midtown Phú Mỹ Hưng · 20% paid · OVERDUE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "5",
    name: "Hoàng Văn Em",
    initials: "HE",
    email: "hoangvanem@email.com",
    phone: "0955 678 901",
    avatarColor: "bg-rose-100 text-rose-700",
    contracts: [
      {
        id: "c5-1",
        projectName: "Midtown Phú Mỹ Hưng",
        unit: "M1.06-03",
        contractValue: 7.3,
        paidAmount: 1.46,
        paymentProgress: 20,
        dueDate: "2026-03-08",
        status: "overdue",
        overdueAmount: 1.1,
        latePenaltyRate: 14,
        daysOverdue: 38,
        lateFee: calcLateFee(1.1, 14, 38),
        stages: [
          {
            id: "c5s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T1/2024 – T1/2024",
            totalAmount: 0.73,
            paidAmount: 0.73,
            stageStatus: "completed",
            records: [
              {
                id: "c5r1-1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2024-01-15",
                paidDate: "2024-01-13",
                baseAmount: 0.73,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-MPH-2024-001",
                  fileName: "hoa-don-dat-coc-midtown-2024.pdf",
                  fileSize: "133 KB",
                  uploadDate: "2024-01-14",
                  issuedBy: "Midtown Phú Mỹ Hưng – Phòng Tài chính",
                  bankName: "Vietinbank – CN Phú Mỹ Hưng",
                  bankAccount: "113000384920",
                  transactionRef: "VTB20240113-22041",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.73,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c5s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T1/2025 – T9/2027",
            totalAmount: 5.11,
            paidAmount: 0.73,
            stageStatus: "in-progress",
            records: [
              {
                id: "c5r2-1",
                label: "Đợt 2 – Xong phần móng (10%)",
                dueDate: "2025-01-10",
                paidDate: "2025-01-08",
                baseAmount: 0.73,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-MPH-2025-001",
                  fileName: "hoa-don-dot2-mong-midtown.pdf",
                  fileSize: "141 KB",
                  uploadDate: "2025-01-09",
                  issuedBy: "Midtown Phú Mỹ Hưng – Phòng Tài chính",
                  bankName: "Vietinbank – CN Phú Mỹ Hưng",
                  bankAccount: "113000384920",
                  transactionRef: "VTB20250108-41092",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.73,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c5r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2026-03-08",
                baseAmount: 1.1,
                status: "overdue",
                daysOverdue: 38,
                lateFee: calcLateFee(1.1, 14, 38),
                extensions: [
                  {
                    id: "ext-c5-r22",
                    requestDate: "2026-03-01",
                    approvedDate: "2026-03-05",
                    approvedBy: "Trần Minh Tuấn",
                    type: "no-penalty",
                    penaltyRatePercent: 0,
                    reason: "Khách hàng VIP hạng A, lịch sử thanh toán tốt. Áp dụng chính sách ưu đãi miễn phí phạt theo quyết định của Ban Giám Đốc.",
                    notes: "Đã có xác nhận từ BGĐ (email ngày 05/03/2026). Lưu hồ sơ tại phòng CSKH.",
                    installments: [
                      {
                        id: "ext-c5-r22-i1",
                        label: "Đợt gia hạn 1/1",
                        dueDate: "2026-05-30",
                        amount: 1.1,
                        status: "upcoming",
                      },
                    ],
                  },
                ],
              },
              {
                id: "c5r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2026-09-08",
                baseAmount: 1.095,
                status: "upcoming",
              },
              {
                id: "c5r2-4",
                label: "Đợt 5 – Hoàn thành tầng 15 (15%)",
                dueDate: "2027-03-08",
                baseAmount: 1.095,
                status: "upcoming",
              },
              {
                id: "c5r2-5",
                label: "Đợt 6 – Hoàn thiện thô (10%)",
                dueDate: "2027-09-08",
                baseAmount: 0.73,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c5s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T3/2028 – T9/2028",
            totalAmount: 1.46,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c5r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (15%)",
                dueDate: "2028-03-08",
                baseAmount: 1.095,
                status: "upcoming",
              },
              {
                id: "c5r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2028-09-08",
                baseAmount: 0.365,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. Vũ Thị Phương — 3 hợp đồng
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "6",
    name: "Vũ Thị Phương",
    initials: "VP",
    email: "vuthiphuong@email.com",
    phone: "0966 789 012",
    avatarColor: "bg-indigo-100 text-indigo-700",
    contracts: [
      // ── c6-1: Palm City · 60% paid · upcoming ───────────────────────────
      {
        id: "c6-1",
        projectName: "Palm City",
        unit: "P3.09-17",
        contractValue: 4.0,
        paidAmount: 2.4,
        paymentProgress: 60,
        dueDate: "2026-05-20",
        status: "upcoming",
        stages: [
          {
            id: "c6-1-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T8/2022 – T8/2022",
            totalAmount: 0.4,
            paidAmount: 0.4,
            stageStatus: "completed",
            records: [
              {
                id: "c6-1-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2022-08-10",
                paidDate: "2022-08-08",
                baseAmount: 0.4,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-PLC-2022-001",
                  fileName: "hoa-don-dat-coc-palmcity-2022.pdf",
                  fileSize: "112 KB",
                  uploadDate: "2022-08-09",
                  issuedBy: "Palm City – Phòng Tài chính",
                  bankName: "Sacombank – CN Quận 7",
                  bankAccount: "060218403920",
                  transactionRef: "SCB20220808-29041",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.4,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c6-1-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T5/2023 – T5/2026",
            totalAmount: 2.6,
            paidAmount: 2.0,
            stageStatus: "in-progress",
            records: [
              {
                id: "c6-1-r2",
                label: "Đợt 2 – Xong phần móng (12.5%)",
                dueDate: "2023-05-10",
                paidDate: "2023-05-08",
                baseAmount: 0.5,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-PLC-2023-006",
                  fileName: "hoa-don-dot2-mong-palmcity.pdf",
                  fileSize: "138 KB",
                  uploadDate: "2023-05-09",
                  issuedBy: "Palm City – Phòng Tài chính",
                  bankName: "Sacombank – CN Quận 7",
                  bankAccount: "060218403920",
                  transactionRef: "SCB20230508-41203",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.5,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-1-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (12.5%)",
                dueDate: "2024-02-15",
                paidDate: "2024-02-13",
                baseAmount: 0.5,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-PLC-2024-002",
                  fileName: "hoa-don-dot3-tang5-palmcity.pdf",
                  fileSize: "144 KB",
                  uploadDate: "2024-02-14",
                  issuedBy: "Palm City – Phòng Tài chính",
                  bankName: "Sacombank – CN Quận 7",
                  bankAccount: "060218403920",
                  transactionRef: "SCB20240213-55301",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.5,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-1-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (12.5%)",
                dueDate: "2024-10-10",
                paidDate: "2024-10-08",
                baseAmount: 0.5,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-PLC-2024-011",
                  fileName: "hoa-don-dot4-tang10-palmcity.pdf",
                  fileSize: "149 KB",
                  uploadDate: "2024-10-09",
                  issuedBy: "Palm City – Phòng Tài chính",
                  bankName: "Sacombank – CN Quận 7",
                  bankAccount: "060218403920",
                  transactionRef: "SCB20241008-68401",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.5,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-1-r5",
                label: "Đợt 5 – Hoàn thành tầng 15 (12.5%)",
                dueDate: "2025-07-10",
                paidDate: "2025-07-08",
                baseAmount: 0.5,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-PLC-2025-007",
                  fileName: "hoa-don-dot5-tang15-palmcity.pdf",
                  fileSize: "155 KB",
                  uploadDate: "2025-07-09",
                  issuedBy: "Palm City – Phòng Tài chính",
                  bankName: "Sacombank – CN Quận 7",
                  bankAccount: "060218403920",
                  transactionRef: "SCB20250708-79201",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.5,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-1-r6",
                label: "Đợt 6 – Hoàn thiện thô (15%)",
                dueDate: "2026-05-20",
                baseAmount: 0.6,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c6-1-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T12/2026 – T6/2027",
            totalAmount: 1.0,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c6-1-r7",
                label: "Bàn giao căn hộ & nghiệm thu (20%)",
                dueDate: "2026-12-20",
                baseAmount: 0.8,
                status: "upcoming",
              },
              {
                id: "c6-1-r8",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2027-06-20",
                baseAmount: 0.2,
                status: "upcoming",
              },
            ],
          },
        ],
      },

      // ── c6-2: The Sun Avenue C2 · 10% paid · OVERDUE ────────────────────
      {
        id: "c6-2",
        projectName: "The Sun Avenue",
        unit: "C2.08-14",
        contractValue: 5.5,
        paidAmount: 0.55,
        paymentProgress: 10,
        dueDate: "2026-04-10",
        status: "overdue",
        overdueAmount: 0.55,
        latePenaltyRate: 14,
        daysOverdue: 10,
        lateFee: calcLateFee(0.55, 14, 10),
        stages: [
          {
            id: "c6-2-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T4/2024 – T4/2024",
            totalAmount: 0.55,
            paidAmount: 0.55,
            stageStatus: "completed",
            records: [
              {
                id: "c6-2-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2024-04-10",
                paidDate: "2024-04-08",
                baseAmount: 0.55,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-TSA-C2-2024-001",
                  fileName: "hoa-don-dat-coc-tsa-c2-2024.pdf",
                  fileSize: "125 KB",
                  uploadDate: "2024-04-09",
                  issuedBy: "The Sun Avenue – Phòng Tài chính",
                  bankName: "BIDV – CN Quận 2",
                  bankAccount: "12310004819201",
                  transactionRef: "BIDV20240408-62091",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.55,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c6-2-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T4/2026 – T3/2028",
            totalAmount: 3.575,
            paidAmount: 0,
            stageStatus: "in-progress",
            records: [
              {
                id: "c6-2-r2",
                label: "Đợt 2 – Xong phần móng (10%)",
                dueDate: "2026-04-10",
                baseAmount: 0.55,
                status: "overdue",
                daysOverdue: 10,
                lateFee: calcLateFee(0.55, 14, 10),
              },
              {
                id: "c6-2-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2026-10-10",
                baseAmount: 0.825,
                status: "upcoming",
              },
              {
                id: "c6-2-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2027-04-10",
                baseAmount: 0.825,
                status: "upcoming",
              },
              {
                id: "c6-2-r5",
                label: "Đợt 5 – Hoàn thành tầng 15 (15%)",
                dueDate: "2027-10-10",
                baseAmount: 0.825,
                status: "upcoming",
              },
              {
                id: "c6-2-r6",
                label: "Đợt 6 – Hoàn thiện thô (10%)",
                dueDate: "2028-03-10",
                baseAmount: 0.55,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c6-2-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T9/2028 – T3/2029",
            totalAmount: 1.375,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c6-2-r7",
                label: "Bàn giao căn hộ & nghiệm thu (20%)",
                dueDate: "2028-09-10",
                baseAmount: 1.1,
                status: "upcoming",
              },
              {
                id: "c6-2-r8",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2029-03-10",
                baseAmount: 0.275,
                status: "upcoming",
              },
            ],
          },
        ],
      },

      // ── c6-3: Lumiere Riverside · 90% paid · paid ────────────────────────
      {
        id: "c6-3",
        projectName: "Lumiere Riverside",
        unit: "L1.05-09",
        contractValue: 2.1,
        paidAmount: 1.89,
        paymentProgress: 90,
        dueDate: "2025-12-15",
        status: "paid",
        stages: [
          {
            id: "c6-3-s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T7/2021 – T7/2021",
            totalAmount: 0.21,
            paidAmount: 0.21,
            stageStatus: "completed",
            records: [
              {
                id: "c6-3-r1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2021-07-10",
                paidDate: "2021-07-08",
                baseAmount: 0.21,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L1-2021-001",
                  fileName: "hoa-don-dat-coc-lumiere-l1-2021.pdf",
                  fileSize: "104 KB",
                  uploadDate: "2021-07-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20210708-19201",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.21,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c6-3-s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T3/2022 – T3/2024",
            totalAmount: 1.68,
            paidAmount: 1.68,
            stageStatus: "completed",
            records: [
              {
                id: "c6-3-r2",
                label: "Đợt 2 – Xong phần móng (20%)",
                dueDate: "2022-03-10",
                paidDate: "2022-03-08",
                baseAmount: 0.42,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L1-2022-003",
                  fileName: "hoa-don-dot2-mong-lumiere-l1.pdf",
                  fileSize: "128 KB",
                  uploadDate: "2022-03-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20220308-31204",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.42,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-3-r3",
                label: "Đợt 3 – Hoàn thành tầng 5 (20%)",
                dueDate: "2022-11-10",
                paidDate: "2022-11-08",
                baseAmount: 0.42,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L1-2022-018",
                  fileName: "hoa-don-dot3-tang5-lumiere-l1.pdf",
                  fileSize: "134 KB",
                  uploadDate: "2022-11-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20221108-44021",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.42,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-3-r4",
                label: "Đợt 4 – Hoàn thành tầng 10 (20%)",
                dueDate: "2023-07-10",
                paidDate: "2023-07-08",
                baseAmount: 0.42,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L1-2023-009",
                  fileName: "hoa-don-dot4-tang10-lumiere-l1.pdf",
                  fileSize: "141 KB",
                  uploadDate: "2023-07-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20230708-57190",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.42,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c6-3-r5",
                label: "Đợt 5 – Hoàn thiện thô (20%)",
                dueDate: "2024-03-10",
                paidDate: "2024-03-08",
                baseAmount: 0.42,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L1-2024-003",
                  fileName: "hoa-don-dot5-hoan-thien-lumiere-l1.pdf",
                  fileSize: "147 KB",
                  uploadDate: "2024-03-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20240308-69302",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.42,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c6-3-s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T12/2025 – T6/2026",
            totalAmount: 0.21,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c6-3-r6",
                label: "Bàn giao căn hộ & nghiệm thu (5%)",
                dueDate: "2025-12-15",
                baseAmount: 0.105,
                status: "upcoming",
              },
              {
                id: "c6-3-r7",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2026-06-15",
                baseAmount: 0.105,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. Đặng Văn Giang — 1 hợp đồng · Lumiere Riverside · 90% paid
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "7",
    name: "Đặng Văn Giang",
    initials: "DG",
    email: "dangvangiang@email.com",
    phone: "0977 890 123",
    avatarColor: "bg-teal-100 text-teal-700",
    contracts: [
      {
        id: "c7-1",
        projectName: "Lumiere Riverside",
        unit: "L2.11-06",
        contractValue: 5.5,
        paidAmount: 4.95,
        paymentProgress: 90,
        dueDate: "2025-10-05",
        status: "paid",
        stages: [
          {
            id: "c7s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T4/2021 – T4/2021",
            totalAmount: 0.55,
            paidAmount: 0.55,
            stageStatus: "completed",
            records: [
              {
                id: "c7r1-1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (10%)",
                dueDate: "2021-04-10",
                paidDate: "2021-04-08",
                baseAmount: 0.55,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L2-2021-001",
                  fileName: "hoa-don-dat-coc-lumiere-l2-2021.pdf",
                  fileSize: "118 KB",
                  uploadDate: "2021-04-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20210408-20183",
                  invoiceStatus: "issued" as const,
                  principalAmount: 0.55,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c7s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T2/2022 – T2/2024",
            totalAmount: 4.4,
            paidAmount: 4.4,
            stageStatus: "completed",
            records: [
              {
                id: "c7r2-1",
                label: "Đợt 2 – Xong phần móng (20%)",
                dueDate: "2022-02-10",
                paidDate: "2022-02-08",
                baseAmount: 1.1,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L2-2022-002",
                  fileName: "hoa-don-dot2-mong-lumiere-l2.pdf",
                  fileSize: "168 KB",
                  uploadDate: "2022-02-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20220208-38201",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.1,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c7r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (20%)",
                dueDate: "2022-10-10",
                paidDate: "2022-10-08",
                baseAmount: 1.1,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L2-2022-019",
                  fileName: "hoa-don-dot3-tang5-lumiere-l2.pdf",
                  fileSize: "174 KB",
                  uploadDate: "2022-10-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20221008-52094",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.1,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c7r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (20%)",
                dueDate: "2023-06-10",
                paidDate: "2023-06-08",
                baseAmount: 1.1,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L2-2023-008",
                  fileName: "hoa-don-dot4-tang10-lumiere-l2.pdf",
                  fileSize: "179 KB",
                  uploadDate: "2023-06-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20230608-64102",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.1,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
              {
                id: "c7r2-4",
                label: "Đợt 5 – Hoàn thiện thô (20%)",
                dueDate: "2024-02-10",
                paidDate: "2024-02-08",
                baseAmount: 1.1,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-LMR-L2-2024-002",
                  fileName: "hoa-don-dot5-hoan-thien-lumiere-l2.pdf",
                  fileSize: "183 KB",
                  uploadDate: "2024-02-09",
                  issuedBy: "Lumiere Riverside – Phòng Tài chính",
                  bankName: "OCB – CN Thủ Đức",
                  bankAccount: "0069038291004",
                  transactionRef: "OCB20240208-77302",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.1,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c7s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T10/2025 – T4/2026",
            totalAmount: 0.55,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c7r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (5%)",
                dueDate: "2025-10-05",
                baseAmount: 0.275,
                status: "upcoming",
              },
              {
                id: "c7r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2026-04-05",
                baseAmount: 0.275,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. Bùi Thị Hoa — 1 hợp đồng · Empire City · 15% paid · OVERDUE
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "8",
    name: "Bùi Thị Hoa",
    initials: "BH",
    email: "buithihoa@email.com",
    phone: "0988 901 234",
    avatarColor: "bg-orange-100 text-orange-700",
    contracts: [
      {
        id: "c8-1",
        projectName: "Empire City",
        unit: "E1.14-21",
        contractValue: 8.0,
        paidAmount: 1.2,
        paymentProgress: 15,
        dueDate: "2026-01-30",
        status: "overdue",
        overdueAmount: 1.6,
        latePenaltyRate: 14,
        daysOverdue: 75,
        lateFee: calcLateFee(1.6, 14, 75),
        stages: [
          {
            id: "c8s1",
            stageNumber: 1,
            name: "Đặt cọc & Ký hợp đồng",
            description: "Hoàn tất thủ tục đặt cọc và ký kết hợp đồng mua bán",
            period: "T8/2024 – T8/2024",
            totalAmount: 1.2,
            paidAmount: 1.2,
            stageStatus: "completed",
            records: [
              {
                id: "c8r1-1",
                label: "Đặt cọc & Ký HĐMB – Đợt 1 (15%)",
                dueDate: "2024-08-10",
                paidDate: "2024-08-08",
                baseAmount: 1.2,
                status: "paid",
                invoice: {
                  invoiceNumber: "HĐ-EPC-2024-001",
                  fileName: "hoa-don-dat-coc-empirecity-2024.pdf",
                  fileSize: "144 KB",
                  uploadDate: "2024-08-09",
                  issuedBy: "Empire City – Phòng Tài chính",
                  bankName: "HSBC – CN TP.HCM",
                  bankAccount: "001-848291-838",
                  transactionRef: "HSBC20240808-30192",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.2,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                },
              },
            ],
          },
          {
            id: "c8s2",
            stageNumber: 2,
            name: "Tiến độ xây dựng",
            description: "Thanh toán theo tiến độ xây dựng từng tầng",
            period: "T1/2026 – T9/2028",
            totalAmount: 5.2,
            paidAmount: 0,
            stageStatus: "in-progress",
            records: [
              {
                id: "c8r2-1",
                label: "Đợt 2 – Xong phần móng (20%)",
                dueDate: "2026-01-30",
                baseAmount: 1.6,
                status: "overdue",
                daysOverdue: 75,
                lateFee: calcLateFee(1.6, 14, 75),
                extensions: [
                  {
                    id: "ext-c8-r21",
                    requestDate: "2026-01-25",
                    approvedDate: "2026-02-03",
                    approvedBy: "Lê Thanh Hà",
                    type: "with-penalty",
                    penaltyRatePercent: 14,
                    reason: "Khách hàng đang chờ giải ngân khoản vay từ ngân hàng Vietinbank. Dự kiến giải ngân trong tháng 3-4/2026. Yêu cầu gia hạn chia 3 đợt để giảm áp lực tài chính.",
                    notes: "Đã có cam kết bằng văn bản từ phía khách hàng và xác nhận từ ngân hàng Vietinbank về lịch giải ngân.",
                    installments: [
                      {
                        id: "ext-c8-r21-i1",
                        label: "Đợt gia hạn 1/3",
                        dueDate: "2026-03-15",
                        amount: 0.534,
                        status: "paid",
                        paidDate: "2026-03-14",
                        invoice: {
                          invoiceNumber: "EXT-C8-2026-001",
                          fileName: "hoadon-gahan-dot1-empirecity.pdf",
                          fileSize: "1.8 MB",
                          uploadDate: "2026-03-14",
                          issuedBy: "Empire City – Ban Quản lý Dự án",
                          bankName: "Vietinbank",
                          bankAccount: "106-000-000-789",
                          transactionRef: "VTB20260314-879234",
                  invoiceStatus: "issued" as const,
                  principalAmount: 1.6,
                  nonInvoiceInterest: 0,
                  pendingInvoiceAmount: 0,
                        },
                      },
                      {
                        id: "ext-c8-r21-i2",
                        label: "Đợt gia hạn 2/3",
                        dueDate: "2026-04-30",
                        amount: 0.533,
                        status: "overdue",
                      },
                      {
                        id: "ext-c8-r21-i3",
                        label: "Đợt gia hạn 3/3",
                        dueDate: "2026-05-31",
                        amount: 0.533,
                        status: "upcoming",
                      },
                    ],
                  },
                ],
              },
              {
                id: "c8r2-2",
                label: "Đợt 3 – Hoàn thành tầng 5 (15%)",
                dueDate: "2026-09-30",
                baseAmount: 1.2,
                status: "upcoming",
              },
              {
                id: "c8r2-3",
                label: "Đợt 4 – Hoàn thành tầng 10 (15%)",
                dueDate: "2027-05-30",
                baseAmount: 1.2,
                status: "upcoming",
              },
              {
                id: "c8r2-4",
                label: "Đợt 5 – Hoàn thiện thô (15%)",
                dueDate: "2028-01-30",
                baseAmount: 1.2,
                status: "upcoming",
              },
            ],
          },
          {
            id: "c8s3",
            stageNumber: 3,
            name: "Bàn giao & Pháp lý",
            description: "Nhận bàn giao căn hộ và hoàn tất hồ sơ pháp lý",
            period: "T7/2028 – T1/2029",
            totalAmount: 1.6,
            paidAmount: 0,
            stageStatus: "pending",
            records: [
              {
                id: "c8r3-1",
                label: "Bàn giao căn hộ & nghiệm thu (15%)",
                dueDate: "2028-07-30",
                baseAmount: 1.2,
                status: "upcoming",
              },
              {
                id: "c8r3-2",
                label: "Hoàn tất hồ sơ sổ đỏ (5%)",
                dueDate: "2029-01-30",
                baseAmount: 0.4,
                status: "upcoming",
              },
            ],
          },
        ],
      },
    ],
  },
];
