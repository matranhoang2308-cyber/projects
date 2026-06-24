import type { CSSProperties, ReactNode } from "react";
import { Download, Trash2, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle, Clock, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Contract } from "@/data/mockDataHopDong";
import { customers } from "@/data/mockDataHopDong";
import * as XLSX from "xlsx";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() ?? "FILE";
  return ext;
}

function getPropertyDetails(property: string): {
  loaiBDS: string;
  dienTich: string;
  canChinh: string;
  gacLung: string;
  sanVuon: string;
  soPhongNgu: string;
  soWC: string;
  loaiLo: string;
  huong: string;
  giayTo: string;
  noiThat: string;
} {
  const lower = property.toLowerCase();
  if (lower.includes("studio")) {
    return {
      loaiBDS: "Căn hộ Studio",
      dienTich: "30 m²",
      canChinh: "30 m²",
      gacLung: "—",
      sanVuon: "—",
      soPhongNgu: "—",
      soWC: "1",
      loaiLo: "—",
      huong: "Đông",
      giayTo: "Sổ hồng",
      noiThat: "Bàn giao cơ bản",
    };
  }
  if (lower.includes("biệt thự")) {
    return {
      loaiBDS: "Biệt thự",
      dienTich: "250 m²",
      canChinh: "180 m²",
      gacLung: "—",
      sanVuon: "120 m²",
      soPhongNgu: "4",
      soWC: "3",
      loaiLo: "Góc",
      huong: "Tây Nam",
      giayTo: "Sổ hồng",
      noiThat: "Bàn giao thô",
    };
  }
  if (lower.includes("shophouse")) {
    return {
      loaiBDS: "Shophouse",
      dienTich: "120 m²",
      canChinh: "120 m²",
      gacLung: "Có (20 m²)",
      sanVuon: "—",
      soPhongNgu: "—",
      soWC: "2",
      loaiLo: "Mặt tiền",
      huong: "Đông Bắc",
      giayTo: "Sổ hồng",
      noiThat: "Bàn giao thô",
    };
  }
  if (lower.includes("liền kề")) {
    return {
      loaiBDS: "Nhà liền kề",
      dienTich: "150 m²",
      canChinh: "150 m²",
      gacLung: "—",
      sanVuon: "—",
      soPhongNgu: "3",
      soWC: "2",
      loaiLo: "Giữa",
      huong: "Nam",
      giayTo: "Sổ hồng",
      noiThat: "Bàn giao thô",
    };
  }
  if (lower.includes("kiot") || lower.includes("mặt bằng") || lower.includes("bán lẻ")) {
    return {
      loaiBDS: "Mặt bằng thương mại",
      dienTich: "80 m²",
      canChinh: "80 m²",
      gacLung: "—",
      sanVuon: "—",
      soPhongNgu: "—",
      soWC: "1",
      loaiLo: "Góc",
      huong: "—",
      giayTo: "Hợp đồng thuê",
      noiThat: "Bàn giao thô",
    };
  }
  if (lower.includes("văn phòng") || lower.includes("floor") || lower.includes("sàn")) {
    return {
      loaiBDS: "Văn phòng",
      dienTich: "500 m²",
      canChinh: "500 m²",
      gacLung: "—",
      sanVuon: "—",
      soPhongNgu: "—",
      soWC: "4",
      loaiLo: "—",
      huong: "—",
      giayTo: "Hợp đồng thuê",
      noiThat: "Bàn giao thô",
    };
  }
  if (lower.includes("kho")) {
    return {
      loaiBDS: "Kho xưởng",
      dienTich: "2,000 m²",
      canChinh: "2,000 m²",
      gacLung: "—",
      sanVuon: "—",
      soPhongNgu: "—",
      soWC: "—",
      loaiLo: "—",
      huong: "—",
      giayTo: "Hợp đồng thuê",
      noiThat: "Bàn giao thô",
    };
  }
  // Default: căn hộ chung cư
  return {
    loaiBDS: "Căn hộ chung cư",
    dienTich: "70 m²",
    canChinh: "65 m²",
    gacLung: "—",
    sanVuon: "—",
    soPhongNgu: "2",
    soWC: "2",
    loaiLo: "—",
    huong: "Đông Nam",
    giayTo: "Sổ hồng",
    noiThat: "Bàn giao thô",
  };
}

function deriveFromAddress(address: string): {
  tang: string;
  phanKhu: string;
  duAn: string;
  block: string;
} {
  const tangMatch = address.match(/Tầng (\d+)/i);
  const tang = tangMatch ? tangMatch[1] : "—";

  const duAnMatch = address.match(/KĐT ([^,]+)/i) || address.match(/Khu Công [Nn]ghiệp ([^,]+)/i);
  const duAn = duAnMatch
    ? duAnMatch[1].trim()
    : address.split(",").pop()?.trim() ?? "—";

  const parts = address.split(",").map((p) => p.trim());
  const phanKhu =
    parts.find(
      (p) => /Tháp|Block|Khu|Sàn|Lô|Zone/i.test(p) && !/KĐT/i.test(p)
    ) ?? "—";

  const blockMatch = phanKhu.match(/[A-Z]\d+/) || phanKhu.match(/Tháp ([A-Z]\d+)/i);
  const block = blockMatch ? blockMatch[0] : phanKhu.replace(/^Tháp\s*/i, "").replace(/^Block\s*/i, "") || "—";

  return { tang, phanKhu, duAn, block };
}

function paymentStatusLabel(status: string): string {
  return (
    {
      "on-time": "Đã thanh toán",
      late: "Trễ hạn",
      overdue: "Quá hạn",
      pending: "Chưa đến hạn",
    }[status] ?? status
  );
}

// ─── Table cell styles ────────────────────────────────────────────────────────
const groupNameCellStyle: CSSProperties = {
  background: "#e8f5e9",
  fontWeight: 600,
  fontSize: "11px",
  textAlign: "center",
  verticalAlign: "middle",
  writingMode: "vertical-rl",
  textOrientation: "mixed",
  letterSpacing: "0.08em",
  width: "36px",
  minWidth: "36px",
  maxWidth: "36px",
  color: "#2e7d32",
  position: "sticky",
  left: 0,
  zIndex: 1,
  borderRight: "1px solid #c8e6c9",
  padding: "12px 6px",
};

const transferGroupNameCellStyle: CSSProperties = {
  ...groupNameCellStyle,
  background: "#e8eaf6",
  color: "#283593",
  borderRight: "1px solid #c5cae9",
};
const fieldCellStyle: CSSProperties = {
  color: "#5a6175",
  width: "180px",
  minWidth: "160px",
  padding: "9px 14px",
  fontSize: "12px",
  borderBottom: "1px solid #e0e0e0",
  borderRight: "1px solid #e0e0e0",
};
const valueCellStyle: CSSProperties = {
  color: "#1a2035",
  fontWeight: 500,
  padding: "9px 14px",
  fontSize: "12px",
  borderBottom: "1px solid #e0e0e0",
};
const groupHeaderStyle: CSSProperties = {
  background: "#f0f4f0",
  fontWeight: 700,
  fontSize: "11px",
  color: "#344054",
  padding: "8px 14px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  borderBottom: "1px solid #d0d8d0",
  borderTop: "1px solid #d0d8d0",
};
const subHeaderStyle: CSSProperties = {
  background: "#f7f8fa",
  fontWeight: 600,
  fontSize: "11px",
  color: "#475467",
  padding: "8px 14px",
  borderBottom: "1px solid #e0e0e0",
  borderRight: "1px solid #e0e0e0",
};

// ─── Payment status badge ─────────────────────────────────────────────────────
function PaymentBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; icon: ReactNode; label: string }> = {
    "on-time": {
      cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Đã thanh toán",
    },
    late: {
      cls: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Trễ hạn",
    },
    overdue: {
      cls: "bg-red-50 border-red-200 text-red-700",
      icon: <XCircle className="w-3 h-3" />,
      label: "Quá hạn",
    },
    pending: {
      cls: "bg-slate-100 border-slate-200 text-slate-600",
      icon: <Clock className="w-3 h-3" />,
      label: "Chưa đến hạn",
    },
  };
  const c = cfg[status] ?? cfg["pending"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-xs ${c.cls}`}
      style={{ fontWeight: 500 }}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── Export to Excel ──────────────────────────────────────────────────────────
function exportExcel(contract: Contract) {
  const cust = customers.find((c) => c.id === contract.customerId);
  const propDetails = getPropertyDetails(contract.property);
  const addrDetails = deriveFromAddress(contract.address);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: ThongTinChung
  const sheetGeneral = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN CHUNG", ""],
    ["Trường", "Giá trị"],
    ["Ngày ký kết", contract.date],
    ["Loại hợp đồng", contract.type],
    ["Trạng thái", contract.status],
    ["Giá bán", contract.value + " đ"],
    ["Chiết khấu", "5%"],
    ["VAT", "10%"],
    ["Tổng giá trị", contract.value + " đ"],
    ["Đã thanh toán", contract.paid.toLocaleString("vi-VN") + " đ"],
    ["Còn lại", (contract.total - contract.paid).toLocaleString("vi-VN") + " đ"],
    ["Tiến độ thanh toán", contract.pct + "%"],
    ["Nhân viên phụ trách", contract.salesperson],
  ]);
  XLSX.utils.book_append_sheet(wb, sheetGeneral, "ThongTinChung");

  // ── Sheet 2: KhachHang
  const sheetCustomer = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN KHÁCH HÀNG", ""],
    ["Trường", "Giá trị"],
    ["Chủ sở hữu", contract.customer],
    ["Đồng sở hữu", "—"],
    ["Số điện thoại", contract.phone],
    ["Ngày sinh", cust?.dob ?? "—"],
    ["Email", contract.email],
    ["CCCD/CMND", cust?.cccd ?? "—"],
    ["Mã số thuế", cust?.taxCode ?? "—"],
    ["Địa chỉ thường trú", cust?.address ?? "—"],
    ["Địa chỉ liên hệ", contract.address],
  ]);
  XLSX.utils.book_append_sheet(wb, sheetCustomer, "KhachHang");

  // ── Sheet 3: BatDongSan
  const sheetProperty = XLSX.utils.aoa_to_sheet([
    ["THÔNG TIN BẤT ĐỘNG SẢN", ""],
    ["Trường", "Giá trị"],
    ["Loại hình bất động sản", propDetails.loaiBDS],
    ["Dự án", addrDetails.duAn],
    ["Phân khu", addrDetails.phanKhu],
    ["Block", addrDetails.block],
    ["Tầng", addrDetails.tang],
    ["Số phòng", contract.property],
    ["Tổng diện tích", propDetails.dienTich],
    ["Căn chính", propDetails.canChinh],
    ["Gác lửng", propDetails.gacLung],
    ["Sân vườn", propDetails.sanVuon],
    ["Số phòng ngủ", propDetails.soPhongNgu],
    ["Số nhà vệ sinh", propDetails.soWC],
    ["Loại lô", propDetails.loaiLo],
    ["Hướng", propDetails.huong],
    ["Giá", contract.value + " đ"],
    ["Giấy tờ pháp lý", propDetails.giayTo],
    ["Tình trạng nội thất", propDetails.noiThat],
    ["Địa chỉ", contract.address],
  ]);
  XLSX.utils.book_append_sheet(wb, sheetProperty, "BatDongSan");

  // ── Sheet 4: ThanhToan
  const paymentRows = contract.payments.map((p) => [
    `Đợt ${p.seq}`,
    p.amount + " đ",
    p.due,
    p.paid ?? "—",
    paymentStatusLabel(p.status),
  ]);
  const sheetPayment = XLSX.utils.aoa_to_sheet([
    ["LỊCH SỬ THANH TOÁN"],
    ["Đợt", "Số tiền", "Hạn thanh toán", "Ngày TT thực tế", "Trạng thái"],
    ...paymentRows,
  ]);
  XLSX.utils.book_append_sheet(wb, sheetPayment, "ThanhToan");

  // ── Sheet 5: TaiLieu
  const docRows = contract.docs.map((d) => [
    d.name,
    getFileType(d.name),
    d.size,
    d.date,
  ]);
  const sheetDocs = XLSX.utils.aoa_to_sheet([
    ["TÀI LIỆU ĐÍNH KÈM"],
    ["Tên file", "Loại", "Dung lượng", "Ngày phát hành"],
    ...docRows,
  ]);
  XLSX.utils.book_append_sheet(wb, sheetDocs, "TaiLieu");

  XLSX.writeFile(wb, `HopDong_${contract.id}.xlsx`);
}

// ─── Main Table View Component ────────────────────────────────────────────────
interface ContractTableViewProps {
  contract: Contract;
}

export function ContractTableView({ contract }: ContractTableViewProps) {
  const cust = customers.find((c) => c.id === contract.customerId);
  const propDetails = getPropertyDetails(contract.property);
  const addrDetails = deriveFromAddress(contract.address);

  // ── Group 1 rows
  const g1Rows: [string, string][] = [
    ["Ngày ký kết", contract.date],
    ["Loại hợp đồng", contract.type],
    ["Trạng thái", contract.status],
    ["Giá bán (trước chiết khấu)", contract.value + " đ"],
    ["Chiết khấu", "5%"],
    ["VAT", "10%"],
    ["Tổng giá trị hợp đồng", contract.value + " đ"],
    ["Nhân viên phụ trách", contract.salesperson],
  ];

  // ── Group 2 rows
  const g2Rows: [string, string][] = [
    ["Chủ sở hữu", contract.customer],
    ["Đồng sở hữu", "—"],
    ["Số điện thoại", contract.phone],
    ["Ngày sinh", cust?.dob ?? "—"],
    ["Email", contract.email],
    ["CCCD / CMND", cust?.cccd ?? "—"],
    ["Mã số thuế", cust?.taxCode ?? "—"],
    ["Địa chỉ thường trú", cust?.address ?? "—"],
    ["Địa chỉ liên hệ", contract.address],
  ];

  // ── Group 3 rows
  const g3Rows: [string, string][] = [
    ["Loại hình bất động sản", propDetails.loaiBDS],
    ["Dự án", addrDetails.duAn],
    ["Phân khu", addrDetails.phanKhu],
    ["Block", addrDetails.block],
    ["Tầng", addrDetails.tang],
    ["Số phòng / Mã căn", contract.property],
    ["Tổng diện tích", propDetails.dienTich],
    ["Căn chính", propDetails.canChinh],
    ["Gác lửng", propDetails.gacLung],
    ["Sân vườn", propDetails.sanVuon],
    ["Số phòng ngủ", propDetails.soPhongNgu],
    ["Số nhà vệ sinh", propDetails.soWC],
    ["Loại lô", propDetails.loaiLo],
    ["Hướng", propDetails.huong],
    ["Giá", contract.value + " đ"],
    ["Giấy tờ pháp lý", propDetails.giayTo],
    ["Tình trạng nội thất", propDetails.noiThat],
    ["Địa chỉ bất động sản", contract.address],
  ];

  // Row alternation helper
  function rowBg(idx: number) {
    return idx % 2 === 0 ? "#ffffff" : "#f8f9fa";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable table area */}
      <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 260px)" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: "520px",
            fontSize: "12px",
            borderLeft: "1px solid #e0e0e0",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <colgroup>
            <col style={{ width: "36px" }} />
            <col style={{ width: "200px" }} />
            <col />
          </colgroup>

          {/* ── Group 1: THÔNG TIN CHUNG ── */}
          <tbody>
            <tr>
              <td colSpan={3} style={groupHeaderStyle}>
                📋&nbsp;&nbsp;THÔNG TIN CHUNG
              </td>
            </tr>
            {g1Rows.map(([field, value], idx) => (
              <tr key={field} style={{ background: rowBg(idx) }}>
                {idx === 0 && (
                  <td
                    rowSpan={g1Rows.length}
                    style={groupNameCellStyle}
                  >
                    THÔNG TIN CHUNG
                  </td>
                )}
                <td style={fieldCellStyle}>{field}</td>
                <td style={valueCellStyle}>{value}</td>
              </tr>
            ))}

            {/* ── Group 2: THÔNG TIN KHÁCH HÀNG ── */}
            <tr>
              <td colSpan={3} style={groupHeaderStyle}>
                👤&nbsp;&nbsp;THÔNG TIN KHÁCH HÀNG
              </td>
            </tr>
            {g2Rows.map(([field, value], idx) => (
              <tr key={field} style={{ background: rowBg(idx) }}>
                {idx === 0 && (
                  <td rowSpan={g2Rows.length} style={groupNameCellStyle}>
                    KHÁCH HÀNG
                  </td>
                )}
                <td style={fieldCellStyle}>{field}</td>
                <td style={valueCellStyle}>{value}</td>
              </tr>
            ))}

            {/* ── Group 3: BẤT ĐỘNG SẢN ── */}
            <tr>
              <td colSpan={3} style={groupHeaderStyle}>
                🏢&nbsp;&nbsp;THÔNG TIN BẤT ĐỘNG SẢN
              </td>
            </tr>
            {g3Rows.map(([field, value], idx) => (
              <tr key={field} style={{ background: rowBg(idx) }}>
                {idx === 0 && (
                  <td rowSpan={g3Rows.length} style={groupNameCellStyle}>
                    BẤT ĐỘNG SẢN
                  </td>
                )}
                <td style={fieldCellStyle}>{field}</td>
                <td style={valueCellStyle}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Group 4: LỊCH SỬ THANH TOÁN ── (own table, 6-col) */}
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: "520px",
            fontSize: "12px",
            borderLeft: "1px solid #e0e0e0",
          }}
        >
          <colgroup>
            <col style={{ width: "36px" }} />
            <col style={{ width: "55px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "140px" }} />
            <col />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={6} style={groupHeaderStyle}>
                💳&nbsp;&nbsp;LỊCH SỬ THANH TOÁN
              </td>
            </tr>
            {/* Sub-header */}
            <tr>
              <td
                rowSpan={contract.payments.length + 1}
                style={groupNameCellStyle}
              >
                THANH TOÁN
              </td>
              <td style={subHeaderStyle}>Đợt</td>
              <td style={subHeaderStyle}>Số tiền</td>
              <td style={subHeaderStyle}>Hạn thanh toán</td>
              <td style={subHeaderStyle}>Ngày TT thực tế</td>
              <td style={{ ...subHeaderStyle, borderRight: "none" }}>Trạng thái</td>
            </tr>
            {contract.payments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...valueCellStyle,
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "20px 14px",
                  }}
                >
                  Không có lịch sử thanh toán
                </td>
              </tr>
            ) : (
              contract.payments.map((p, idx) => (
                <tr key={p.seq} style={{ background: rowBg(idx) }}>
                  <td
                    style={{
                      ...valueCellStyle,
                      fontWeight: 600,
                      color: "#6366f1",
                      textAlign: "center",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {p.seq}
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      fontWeight: 600,
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {p.amount} đ
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      color: "#4b5563",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {p.due}
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      color: p.paid ? "#16a34a" : "#9ca3af",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {p.paid ?? "—"}
                  </td>
                  <td style={{ ...valueCellStyle, borderRight: "none" }}>
                    <PaymentBadge status={p.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Group 5: TÀI LIỆU ĐÍNH KÈM ── (own table, 6-col) */}
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: "520px",
            fontSize: "12px",
            borderLeft: "1px solid #e0e0e0",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <colgroup>
            <col style={{ width: "36px" }} />
            <col />
            <col style={{ width: "80px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
          </colgroup>
          <tbody>
            <tr>
              <td colSpan={6} style={groupHeaderStyle}>
                📎&nbsp;&nbsp;TÀI LIỆU ĐÍNH KÈM
              </td>
            </tr>
            {/* Sub-header */}
            <tr>
              <td
                rowSpan={contract.docs.length + 1}
                style={groupNameCellStyle}
              >
                TÀI LIỆU
              </td>
              <td style={subHeaderStyle}>Tên file</td>
              <td style={subHeaderStyle}>Loại</td>
              <td style={subHeaderStyle}>Dung lượng</td>
              <td style={subHeaderStyle}>Ngày phát hành</td>
              <td style={{ ...subHeaderStyle, borderRight: "none" }}>Thao tác</td>
            </tr>
            {contract.docs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...valueCellStyle,
                    color: "#9ca3af",
                    textAlign: "center",
                    padding: "20px 14px",
                  }}
                >
                  Không có tài liệu đính kèm
                </td>
              </tr>
            ) : (
              contract.docs.map((doc, idx) => (
                <tr key={doc.name} style={{ background: rowBg(idx) }}>
                  <td
                    style={{
                      ...valueCellStyle,
                      color: "#374151",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">📄</span>
                      {doc.name}
                    </div>
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    <span
                      style={{
                        background: "#f0f4ff",
                        color: "#4f46e5",
                        border: "1px solid #c7d2fe",
                        borderRadius: "4px",
                        padding: "1px 6px",
                        fontSize: "11px",
                        fontWeight: 600,
                      }}
                    >
                      {getFileType(doc.name)}
                    </span>
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      color: "#4b5563",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {doc.size}
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      color: "#4b5563",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {doc.date}
                  </td>
                  <td
                    style={{
                      ...valueCellStyle,
                      borderRight: "none",
                      padding: "6px 10px",
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 text-xs px-2 text-slate-600 hover:text-indigo-600"
                      >
                        <Download className="w-3 h-3" />
                        Tải
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Group 6: THÔNG TIN CHỦ SỞ HỮU ── */}
        {(() => {
          const owner = contract.owner;
          const coOwners = contract.coOwners ?? [];
          const ownerRows: [string, string][] = owner
            ? [
                ["Họ và tên", owner.name],
                ["Ngày sinh", owner.dob],
                ["CCCD / CMND", owner.cccd],
                ["Ngày cấp", owner.cccdDate],
                ["Nơi cấp", owner.cccdPlace],
                ["Số điện thoại", owner.phone],
                ["Email", owner.email],
                ["Địa chỉ thường trú", owner.permanentAddress],
                ["Địa chỉ liên hệ", owner.contactAddress],
                ["Số tài khoản", owner.bankAccount ?? "—"],
                ["Ngân hàng", owner.bank ?? "—"],
                ["Tên TK ngân hàng", owner.bankAccountName ?? "—"],
              ]
            : [];

          const coOwnerRows: [string, string][] = coOwners.flatMap((co, i) => [
            [`ĐSH ${i + 1} – Họ tên`, co.name],
            [`ĐSH ${i + 1} – CCCD`, co.cccd],
            [`ĐSH ${i + 1} – Điện thoại`, co.phone],
            [`ĐSH ${i + 1} – Email`, co.email],
          ]);

          const allRows = [...ownerRows, ...coOwnerRows];
          const totalRowSpan = allRows.length + (coOwners.length > 0 ? 1 : 0);

          return (
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "520px",
                fontSize: "12px",
                borderLeft: "1px solid #e0e0e0",
              }}
            >
              <colgroup>
                <col style={{ width: "36px" }} />
                <col style={{ width: "200px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td colSpan={3} style={{ ...groupHeaderStyle, background: "#ede7f6", color: "#311b92", borderTop: "1px solid #d1c4e9", borderBottom: "1px solid #d1c4e9" }}>
                    👤&nbsp;&nbsp;THÔNG TIN CHỦ SỞ HỮU
                    {(contract.transferCount ?? 0) > 0 && (
                      <span style={{ marginLeft: "10px", background: "#e8eaf6", color: "#3949ab", border: "1px solid #c5cae9", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>
                        {contract.transferCount} lần CN
                      </span>
                    )}
                  </td>
                </tr>
                {!owner ? (
                  <tr>
                    <td colSpan={3} style={{ ...valueCellStyle, color: "#9ca3af", textAlign: "center", padding: "20px 14px" }}>
                      Chưa có thông tin chủ sở hữu
                    </td>
                  </tr>
                ) : (
                  <>
                    {ownerRows.map(([field, value], idx) => (
                      <tr key={field} style={{ background: rowBg(idx) }}>
                        {idx === 0 && (
                          <td rowSpan={totalRowSpan} style={transferGroupNameCellStyle}>
                            CHỦ SỞ HỮU
                          </td>
                        )}
                        <td style={fieldCellStyle}>{field}</td>
                        <td style={valueCellStyle}>{value || "—"}</td>
                      </tr>
                    ))}
                    {coOwners.length > 0 && (
                      <>
                        <tr>
                          <td colSpan={2} style={{ ...subHeaderStyle, background: "#f3f0ff", color: "#4c1d95" }}>
                            ĐỒNG SỞ HỮU ({coOwners.length})
                          </td>
                        </tr>
                        {coOwnerRows.map(([field, value], idx) => (
                          <tr key={field} style={{ background: rowBg(idx) }}>
                            <td style={fieldCellStyle}>{field}</td>
                            <td style={valueCellStyle}>{value || "—"}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </>
                )}
              </tbody>
            </table>
          );
        })()}

        {/* ── Group 7: LỊCH SỬ CHUYỂN NHƯỢNG ── */}
        {(() => {
          const history = contract.transferHistory ?? [];
          return (
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                minWidth: "520px",
                fontSize: "12px",
                borderLeft: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <colgroup>
                <col style={{ width: "36px" }} />
                <col style={{ width: "50px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "160px" }} />
                <col style={{ width: "130px" }} />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <td colSpan={7} style={{ ...groupHeaderStyle, background: "#e8eaf6", color: "#1a237e", borderTop: "1px solid #c5cae9", borderBottom: "1px solid #c5cae9" }}>
                    🔄&nbsp;&nbsp;LỊCH SỬ CHUYỂN NHƯỢNG
                    {history.length > 0 && (
                      <span style={{ marginLeft: "10px", background: "#e8eaf6", color: "#3949ab", border: "1px solid #c5cae9", borderRadius: "9999px", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>
                        {history.length} lần
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td rowSpan={history.length + 1} style={transferGroupNameCellStyle}>
                    CHUYỂN NHƯỢNG
                  </td>
                  <td style={subHeaderStyle}>Lần</td>
                  <td style={subHeaderStyle}>Ngày CN</td>
                  <td style={subHeaderStyle}>Chủ sở hữu cũ</td>
                  <td style={subHeaderStyle}>Chủ sở hữu mới</td>
                  <td style={subHeaderStyle}>Hồ sơ</td>
                  <td style={{ ...subHeaderStyle, borderRight: "none" }}>NV thực hiện</td>
                </tr>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ ...valueCellStyle, color: "#9ca3af", textAlign: "center", padding: "20px 14px" }}
                    >
                      Chưa có lịch sử chuyển nhượng
                    </td>
                  </tr>
                ) : (
                  history.map((log, idx) => (
                    <tr key={log.id} style={{ background: rowBg(idx) }}>
                      <td style={{ ...valueCellStyle, fontWeight: 600, color: "#3949ab", textAlign: "center", borderRight: "1px solid #e0e0e0" }}>
                        #{log.seq}
                      </td>
                      <td style={{ ...valueCellStyle, borderRight: "1px solid #e0e0e0" }}>{log.transferDate}</td>
                      <td style={{ ...valueCellStyle, borderRight: "1px solid #e0e0e0" }}>
                        <div>
                          <div style={{ fontWeight: 500 }}>{log.previousOwner.name}</div>
                          {log.previousCoOwners.length > 0 && (
                            <div style={{ color: "#6b7280", fontSize: "11px" }}>
                              ĐSH: {log.previousCoOwners.map(c => c.name).join(", ")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...valueCellStyle, borderRight: "1px solid #e0e0e0" }}>
                        <div>
                          <div style={{ fontWeight: 500, color: "#1e40af" }}>
                            <ArrowLeftRight style={{ display: "inline", width: "10px", height: "10px", marginRight: "4px", color: "#6366f1" }} />
                            {log.newOwner.name}
                          </div>
                          {log.newCoOwners.length > 0 && (
                            <div style={{ color: "#6b7280", fontSize: "11px" }}>
                              ĐSH: {log.newCoOwners.map(c => c.name).join(", ")}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...valueCellStyle, color: "#374151", borderRight: "1px solid #e0e0e0" }}>{log.file}</td>
                      <td style={{ ...valueCellStyle, borderRight: "none" }}>{log.performedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          );
        })()}
      </div>

      {/* ── Action bar (table view) ── */}
      <div className="flex items-center gap-2 px-6 pt-3 pb-4 border-t border-slate-100 mt-auto shrink-0">
        <Button className="flex-1 gap-2 text-xs h-8" size="sm">
          <Download className="w-3.5 h-3.5" />
          Xuất PDF
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 text-xs h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          size="sm"
          onClick={() => exportExcel(contract)}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Xuất Excel
        </Button>
      </div>
    </div>
  );
}