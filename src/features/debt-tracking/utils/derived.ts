import { TrangThaiDot, NhomTuoiNo, Installment } from "../types/contract";

/**
 * Tính số ngày quá hạn:
 * - Nếu đã thanh toán (conLai <= 0): Trả về 0 (để hiển thị "—" trên giao diện).
 * - Nếu chưa thanh toán (conLai > 0):
 *   + Nếu chưa đến ngày đến hạn (today <= dueDate): Trả về số ngày âm hoặc 0.
 *   + Nếu đã quá ngày đến hạn (today > dueDate): Trả về số ngày quá hạn (số dương).
 */
export function computeDaysOverdue(
  dueDate: string | null,
  conLai: number,
  todayStr = "2026-07-21"
): number {
  if (!dueDate || conLai <= 0) return 0;

  const due = new Date(dueDate);
  const today = new Date(todayStr);

  // Đặt giờ về 0 để so sánh chính xác theo ngày
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Xác định trạng thái đợt thanh toán (TrangThaiDot):
 * - DA_THANH_TOAN: khi conLai <= 0
 * - QUA_HAN: khi conLai > 0 và quá hạn (today > dueDate)
 * - SAP_TOI_HAN: khi conLai > 0 và chưa quá hạn (today <= dueDate)
 */
export function computeStatus(
  dueDate: string | null,
  conLai: number,
  todayStr = "2026-07-21"
): TrangThaiDot {
  if (conLai <= 0) return "DA_THANH_TOAN";
  if (!dueDate) return "SAP_TOI_HAN";

  const due = new Date(dueDate);
  const today = new Date(todayStr);

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (today > due) {
    return "QUA_HAN";
  }

  return "SAP_TOI_HAN";
}

/**
 * Phân nhóm tuổi nợ (NhomTuoiNo) dựa trên số ngày quá hạn:
 * - CHUA_QUA_HAN: <= 0 ngày
 * - QH_1_30: 1-30 ngày
 * - QH_31_60: 31-60 ngày
 * - QH_61_90: 61-90 ngày
 * - QH_TREN_90: > 90 ngày
 */
export function computeAgingBucket(daysOverdue: number): NhomTuoiNo {
  if (daysOverdue <= 0) return "CHUA_QUA_HAN";
  if (daysOverdue <= 30) return "QH_1_30";
  if (daysOverdue <= 60) return "QH_31_60";
  if (daysOverdue <= 90) return "QH_61_90";
  return "QH_TREN_90";
}
