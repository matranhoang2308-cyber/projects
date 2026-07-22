/**
 * Định dạng số tiền sang chuẩn VND (ví dụ: 1.234.567.890 ₫)
 */
export function formatCurrency(n: number): string {
  if (isNaN(n) || n === null || n === undefined) return "—";
  return new Intl.NumberFormat("vi-VN").format(n);
}

/**
 * Định dạng số tỷ lệ sang phần trăm (ví dụ: 0.155 -> 15.5%)
 */
export function formatPercent(n: number, digits = 1): string {
  if (isNaN(n) || n === null || n === undefined) return "—";
  return `${(n * 100).toFixed(digits)}%`;
}

/**
 * Định dạng ngày ISO (yyyy-MM-dd) sang dd/MM/yyyy
 */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const parts = iso.split("-");
    if (parts.length === 3) {
      // Đảm bảo lấy đúng YYYY-MM-DD không bị lệch múi giờ
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "—";
  }
}

/**
 * Định dạng ngày sang MM/yyyy (cho đối chiếu tháng)
 */
export function formatDateMonthYear(iso: string | null): string {
  if (!iso) return "—";
  try {
    const parts = iso.split("-");
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${year}`;
  } catch {
    return "—";
  }
}
