import type { CustomerBooking } from "../../types/booking";
import type { RefundRecord } from "../../mock/mockRefunds";
import { mockTimeseries } from "../../mock/mockTimeseries";

export interface FilterState {
  timePreset: string;
  donViPhanPhoi: string;
  trangThaiThanhToan: string;
  tinhTrangGiaoDich: string;
  fromDate?: string;
  toDate?: string;
}

export function filterBookings(bookings: CustomerBooking[], filters: FilterState): CustomerBooking[] {
  return bookings.filter((b) => {
    if (filters.donViPhanPhoi !== "ALL" && b.donViPhanPhoi !== filters.donViPhanPhoi) {
      return false;
    }

    if (filters.trangThaiThanhToan === "DA_THANH_TOAN" && b.conBoSung > 0) {
      return false;
    }
    if (filters.trangThaiThanhToan === "CHUA_THANH_TOAN" && b.conBoSung <= 0) {
      return false;
    }

    if (filters.tinhTrangGiaoDich !== "ALL" && b.tinhTrang !== filters.tinhTrangGiaoDich) {
      return false;
    }

    return true;
  });
}

export function filterRefunds(refunds: RefundRecord[], filters: FilterState): RefundRecord[] {
  return refunds.filter((r) => {
    if (filters.donViPhanPhoi !== "ALL" && r.donViPhanPhoi !== filters.donViPhanPhoi) {
      return false;
    }

    if (filters.tinhTrangGiaoDich !== "ALL" && filters.tinhTrangGiaoDich !== "HOAN_TIEN") {
      return false;
    }

    return true;
  });
}

// ----------------------------------------------------
// Tab 1: GQUT Metrics
// ----------------------------------------------------
export interface GqutKpiData {
  tongSoGqut: number;
  tongSoKhachHang: number;
  tongPhaiThu: number;
  tongDaThu: number;
  daThuTienMat: number;
  daThuChuyenKhoan: number;
  tongConThieu: number;
  tyLeHoanThanhChiTieu: number; // %
  tyLeChuyenCoc: number;       // %
}

export function computeGqutKpis(bookings: CustomerBooking[]): GqutKpiData {
  const tongSoGqut = bookings.length;
  const uniqueNames = new Set(bookings.map((b) => b.tenKhachHang));
  const tongSoKhachHang = uniqueNames.size;

  const tongPhaiThu = bookings.reduce((sum, b) => sum + b.phaiThu, 0);
  const tongDaThu = bookings.reduce((sum, b) => sum + b.daThu, 0);

  const daThuTienMat = bookings
    .filter((b) => b.hinhThucThanhToan === "TIEN_MAT")
    .reduce((sum, b) => sum + b.daThu, 0);

  const daThuChuyenKhoan = bookings
    .filter((b) => b.hinhThucThanhToan === "CHUYEN_KHOAN")
    .reduce((sum, b) => sum + b.daThu, 0);

  const tongConThieu = bookings.reduce((sum, b) => sum + (b.conBoSung > 0 ? b.conBoSung : 0), 0);

  const targetCount = 100;
  const tyLeHoanThanhChiTieu = Math.min(100, Math.round((tongSoGqut / targetCount) * 100 * 10) / 10);

  const chuyenCocCount = bookings.filter((b) => b.tinhTrang === "CHUYEN_COC").length;
  const tyLeChuyenCoc = tongSoGqut > 0 ? Math.round((chuyenCocCount / tongSoGqut) * 100 * 10) / 10 : 0;

  return {
    tongSoGqut,
    tongSoKhachHang,
    tongPhaiThu,
    tongDaThu,
    daThuTienMat,
    daThuChuyenKhoan,
    tongConThieu,
    tyLeHoanThanhChiTieu,
    tyLeChuyenCoc,
  };
}

export function computeGqutCharts(bookings: CustomerBooking[]) {
  // 1. Group by Don vi ban
  const byDistributorMap: Record<string, { count: number; amount: number; conThieu: number }> = {};
  bookings.forEach((b) => {
    const key = b.donViPhanPhoi || "Khác";
    if (!byDistributorMap[key]) {
      byDistributorMap[key] = { count: 0, amount: 0, conThieu: 0 };
    }
    byDistributorMap[key].count += 1;
    byDistributorMap[key].amount += b.phaiThu;
    byDistributorMap[key].conThieu += b.conBoSung > 0 ? b.conBoSung : 0;
  });

  const distributorCountList = Object.entries(byDistributorMap)
    .map(([name, val]) => ({ name, count: val.count }))
    .sort((a, b) => b.count - a.count);

  const distributorAmountList = Object.entries(byDistributorMap)
    .map(([name, val]) => ({ name, amount: val.amount }))
    .sort((a, b) => b.amount - a.amount);

  const distributorDebtList = Object.entries(byDistributorMap)
    .map(([name, val]) => ({ name, conThieu: val.conThieu }))
    .filter((item) => item.conThieu > 0)
    .sort((a, b) => b.conThieu - a.conThieu);

  // 2. Top 10 NVTV
  const byNvtvMap: Record<string, number> = {};
  bookings.forEach((b) => {
    const key = b.nvtv || "Chưa phân công";
    byNvtvMap[key] = (byNvtvMap[key] || 0) + 1;
  });
  const topNvtvList = Object.entries(byNvtvMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 3. Customer group & demographics
  const customerGroupMap: Record<string, { count: number; amount: number }> = {
    "VIP Platinum": { count: 0, amount: 0 },
    "VIP Gold": { count: 0, amount: 0 },
    "Đối tác chiến lược": { count: 0, amount: 0 },
    "Khách hàng cá nhân": { count: 0, amount: 0 },
    "Khách hàng mới": { count: 0, amount: 0 },
  };

  bookings.forEach((b, idx) => {
    const groups = ["VIP Platinum", "VIP Gold", "Đối tác chiến lược", "Khách hàng cá nhân", "Khách hàng mới"];
    const g = groups[idx % groups.length];
    customerGroupMap[g].count += 1;
    customerGroupMap[g].amount += b.phaiThu;
  });

  const customerGroupCount = Object.entries(customerGroupMap).map(([name, val]) => ({
    name,
    value: val.count,
  }));

  const customerGroupAmount = Object.entries(customerGroupMap).map(([name, val]) => ({
    name,
    amount: val.amount,
  }));

  const genderAgeData = [
    { age: "25 - 34", nam: Math.round(bookings.length * 0.25), nu: Math.round(bookings.length * 0.2) },
    { age: "35 - 44", nam: Math.round(bookings.length * 0.2), nu: Math.round(bookings.length * 0.18) },
    { age: "45 - 54", nam: Math.round(bookings.length * 0.1), nu: Math.round(bookings.length * 0.05) },
    { age: "Over 55", nam: Math.round(bookings.length * 0.01), nu: Math.round(bookings.length * 0.01) },
  ];

  const provinceMap: Record<string, number> = {};
  bookings.forEach((b) => {
    let p = "TP. Hồ Chí Minh";
    if (b.diaChiLienHeMoi.includes("Hà Nội")) p = "Hà Nội";
    else if (b.diaChiLienHeMoi.includes("Đà Nẵng")) p = "Đà Nẵng";
    else if (b.diaChiLienHeMoi.includes("Bình Dương")) p = "Bình Dương";
    else if (b.diaChiLienHeMoi.includes("Đồng Nai")) p = "Đồng Nai";
    else if (b.diaChiLienHeMoi.includes("Cần Thơ")) p = "Cần Thơ";
    else if (b.diaChiLienHeMoi.includes("Vũng Tàu")) p = "Bà Rịa - Vũng Tàu";
    provinceMap[p] = (provinceMap[p] || 0) + 1;
  });

  const provinceList = Object.entries(provinceMap)
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);

  const cashAmount = bookings.filter((b) => b.hinhThucThanhToan === "TIEN_MAT").reduce((s, b) => s + b.daThu, 0);
  const transferAmount = bookings.filter((b) => b.hinhThucThanhToan === "CHUYEN_KHOAN").reduce((s, b) => s + b.daThu, 0);
  const paymentMethodData = [
    { name: "Chuyển khoản", value: transferAmount, fill: "#2563eb" },
    { name: "Tiền mặt", value: cashAmount, fill: "#16a34a" },
  ];

  const topDebtCustomers = bookings
    .filter((b) => b.conBoSung > 0)
    .map((b) => ({ name: b.tenKhachHang, conBoSung: b.conBoSung, donVi: b.donViPhanPhoi }))
    .sort((a, b) => b.conBoSung - a.conBoSung)
    .slice(0, 10);

  return {
    timeseries: mockTimeseries,
    distributorCountList,
    distributorAmountList,
    distributorDebtList,
    topNvtvList,
    customerGroupCount,
    customerGroupAmount,
    genderAgeData,
    provinceList,
    paymentMethodData,
    topDebtCustomers,
  };
}

// ----------------------------------------------------
// Tab 2: Refund Metrics
// ----------------------------------------------------
export interface RefundKpiData {
  tongSoGiaoDichHoan: number;
  tongSoKhachHangHoan: number;
  tongSoHoSoDaHoan: number;
  tongTienHoan: number;
  tongTienDaHoan: number;
  tongTienChoHoan: number;
  giaTriHoanBinhQuan: number;
  tyLeHoanGqut: number;        // %
  tyLeGiuChanKh: number;       // %
  tyLeChuyenCoc: number;       // %
}

export function computeRefundKpis(refunds: RefundRecord[], totalBookingsCount: number): RefundKpiData {
  const tongSoGiaoDichHoan = refunds.length;
  const uniqueNames = new Set(refunds.map((r) => r.tenKhachHang));
  const tongSoKhachHangHoan = uniqueNames.size;
  const tongSoHoSoDaHoan = refunds.filter((r) => r.trangThaiHoan === "DA_HOAN").length;

  const tongTienHoan = refunds.reduce((sum, r) => sum + r.soTienHoan, 0);
  const tongTienDaHoan = refunds.filter((r) => r.trangThaiHoan === "DA_HOAN").reduce((sum, r) => sum + r.soTienHoan, 0);
  const tongTienChoHoan = refunds.filter((r) => r.trangThaiHoan === "CHO_HOAN").reduce((sum, r) => sum + r.soTienHoan, 0);

  const giaTriHoanBinhQuan = tongSoKhachHangHoan > 0 ? Math.round(tongTienHoan / tongSoKhachHangHoan) : 0;

  const tyLeHoanGqut = totalBookingsCount > 0 ? Math.round((tongSoGiaoDichHoan / totalBookingsCount) * 100 * 10) / 10 : 0;
  const tyLeGiuChanKh = Math.round((100 - tyLeHoanGqut) * 10) / 10;
  const tyLeChuyenCoc = 25.0; // standard mock ratio

  return {
    tongSoGiaoDichHoan,
    tongSoKhachHangHoan,
    tongSoHoSoDaHoan,
    tongTienHoan,
    tongTienDaHoan,
    tongTienChoHoan,
    giaTriHoanBinhQuan,
    tyLeHoanGqut,
    tyLeGiuChanKh,
    tyLeChuyenCoc,
  };
}

export function computeRefundCharts(refunds: RefundRecord[], bookings: CustomerBooking[]) {
  // Distributor refund stacked bars (Phai hoan vs Chua hoan - 2 CATEGORIES)
  const distMap: Record<string, { phaiHoanCount: number; chuaHoanCount: number; phaiHoanAmount: number; chuaHoanAmount: number }> = {};
  refunds.forEach((r) => {
    const key = r.donViPhanPhoi || "Khác";
    if (!distMap[key]) {
      distMap[key] = { phaiHoanCount: 0, chuaHoanCount: 0, phaiHoanAmount: 0, chuaHoanAmount: 0 };
    }
    if (r.trangThaiHoan === "DA_HOAN") {
      distMap[key].phaiHoanCount += 1;
      distMap[key].phaiHoanAmount += r.soTienHoan;
    } else {
      distMap[key].chuaHoanCount += 1;
      distMap[key].chuaHoanAmount += r.soTienHoan;
    }
  });

  const distributorRefundCount = Object.entries(distMap).map(([name, val]) => ({
    name,
    phaiHoan: val.phaiHoanCount,
    chuaHoan: val.chuaHoanCount,
  }));

  const distributorRefundAmount = Object.entries(distMap).map(([name, val]) => ({
    name,
    phaiHoan: val.phaiHoanAmount,
    chuaHoan: val.chuaHoanAmount,
  }));

  const topDistributorRefundList = Object.entries(distMap)
    .map(([name, val]) => ({ name, totalCount: val.phaiHoanCount + val.chuaHoanCount }))
    .sort((a, b) => b.totalCount - a.totalCount);

  // Customer Refund Demographics
  const refundCustomerGroupMap: Record<string, { count: number; amount: number }> = {};
  refunds.forEach((r) => {
    const key = r.nhomKH || "Khác";
    if (!refundCustomerGroupMap[key]) refundCustomerGroupMap[key] = { count: 0, amount: 0 };
    refundCustomerGroupMap[key].count += 1;
    refundCustomerGroupMap[key].amount += r.soTienHoan;
  });

  const refundGroupCount = Object.entries(refundCustomerGroupMap).map(([name, val]) => ({ name, value: val.count }));
  const refundGroupAmount = Object.entries(refundCustomerGroupMap).map(([name, val]) => ({ name, amount: val.amount }));

  const refundGenderData = [
    { gender: "Nam", count: refunds.filter((r) => r.gioiTinh === "NAM").length },
    { gender: "Nữ", count: refunds.filter((r) => r.gioiTinh === "NU").length },
  ];

  const refundAgeData = [
    { age: "25 - 34", count: refunds.filter((r) => r.nhomTuoi === "25 - 34").length },
    { age: "35 - 44", count: refunds.filter((r) => r.nhomTuoi === "35 - 44").length },
    { age: "45 - 54", count: refunds.filter((r) => r.nhomTuoi === "45 - 54").length },
    { age: "Over 55", count: refunds.filter((r) => r.nhomTuoi === "Over 55").length },
  ];

  // Risk Control & Top Refunds
  const topRefundCustomers = refunds
    .map((r) => ({ name: r.tenKhachHang, amount: r.soTienHoan, donVi: r.donViPhanPhoi }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Conversion Funnel (3 stages)
  const totalGqut = Math.max(bookings.length, 20);
  const totalChuyenCoc = Math.round(totalGqut * 0.35);
  const totalHoan = refunds.length;

  const funnelData = [
    { stage: "Giao dịch GQUT", count: totalGqut, percentage: 100, fill: "#2563eb" },
    { stage: "Chuyển cọc", count: totalChuyenCoc, percentage: Math.round((totalChuyenCoc / totalGqut) * 100), fill: "#16a34a" },
    { stage: "Hoàn GQUT", count: totalHoan, percentage: Math.round((totalHoan / totalGqut) * 100), fill: "#ef4444" },
  ];

  const conversionProportions = [
    { name: "GQUT giữ nguyên", value: totalGqut - totalChuyenCoc - totalHoan, fill: "#2563eb" },
    { name: "Chuyển cọc", value: totalChuyenCoc, fill: "#16a34a" },
    { name: "Hoàn GQUT", value: totalHoan, fill: "#ef4444" },
  ];

  return {
    refundTimeseries: mockTimeseries,
    distributorRefundCount,
    distributorRefundAmount,
    topDistributorRefundList,
    refundGroupCount,
    refundGroupAmount,
    refundGenderData,
    refundAgeData,
    topRefundCustomers,
    funnelData,
    conversionProportions,
  };
}

// Full currency format: 3.000.000 VND
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN") + " VND";
}

export function formatCurrencyFull(amount: number): string {
  return amount.toLocaleString("vi-VN") + " VND";
}

// Compact currency format for Chart Y-Axes: 1,8 tỷ, 500 tr
export function formatCurrencyShort(amount: number): string {
  const absVal = Math.abs(amount);
  if (absVal >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  }
  if (absVal >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 0 })} tr`;
  }
  return amount.toLocaleString("vi-VN") + " VND";
}
