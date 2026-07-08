import { addendumList, contractOptions, type AddendumListItem, type AddendumStatus } from "./addendumData";

// ─── Generic field/section shape — mirrors transferContractDetailSchema.ts so
// the addendum Block/Table views can reuse the same rendering conventions
// already established by TransferContractBlockView / TransferContractTableView. ──
export interface AddendumDetailField {
  id: string;
  label: string;
  value?: string;
}

export interface AddendumDoc {
  name: string;
  size: string;
  date: string;
}

export interface AddendumDetail {
  id: string;
  title: string;
  code: string;
  status: AddendumStatus;
  createdDate: string;
  createdBy: string;
  effectiveDate: string;
  contract: { code: string; ownerName: string; property: string; value: string; status: string };
  reason: string;
  oldOwner: AddendumDetailField[];
  newOwner: AddendumDetailField[];
  notary: AddendumDetailField[];
  docs: AddendumDoc[];
}

const ownerFieldLabels = [
  "Họ và tên", "Ngày sinh", "CMND/CCCD", "Ngày cấp", "Nơi cấp",
  "Địa chỉ thường trú", "Địa chỉ liên hệ", "Số điện thoại", "Email",
  "Số tài khoản", "Ngân hàng", "Tên tài khoản",
];

const notaryFieldLabels = [
  "Thông tin VBCN công chứng", "Ngày ký", "Số VBCN", "Lần CN",
  "Thông tin VBCN công chứng và XNCN", "Ngày nhận hồ sơ XNCN từ KH",
  "Ngày XCCN", "Số Chứng từ", "Trạng thái chuyển nhượng",
];

function fields(prefix: string, labels: string[], values: string[]): AddendumDetailField[] {
  return labels.map((label, i) => ({ id: `${prefix}_${i}`, label, value: values[i] ?? "-" }));
}

function buildDetail(item: AddendumListItem, seed: number): AddendumDetail {
  const contract = contractOptions.find((c) => c.value === item.maHopDong);
  const oldValues = [
    item.khachHang.name, "24/02/1993", `0${290000000 + seed}`, "24/02/2025", "CTCCS",
    "929 Hart St, Brooklyn, NY 11237", "929 Hart St, Brooklyn, NY 11237", `090-987-${1000 + seed}`,
    item.khachHang.email, `1038494${28550 + seed}`, "Vietcombank", item.khachHang.name,
  ];
  const newValues = [
    ["Thay đổi TT khách hàng", "Thay đổi TT đồng sở hữu"].includes(item.loaiPhuLuc)
      ? `${item.khachHang.name} (mới)`
      : item.khachHang.name,
    "23/08/2001", `0${348390000 + seed}`, "23/08/2001", "CA.Tp Hồ Chí Minh",
    "118 Xuân Thủy, P. Thảo Điền, Q.2, TP.HCM", "119 Xuân Thủy, P. Thảo Điền, Q.2, TP.HCM",
    `0${348390000 + seed}`, `lta.${15790 + seed}@gmail.com`, "-", "-", "-",
  ];

  return {
    id: item.id,
    title: item.loaiPhuLuc === "Thay đổi TT căn hộ" ? "Thay đổi thông tin căn hộ" : "Thay đổi thông tin người mua",
    code: `${583900 + seed}-XT`,
    status: item.trangThai,
    createdDate: item.ngayTao,
    createdBy: item.nhanVienThayDoi.name,
    effectiveDate: item.capNhatLanCuoi,
    contract: {
      code: item.maHopDong,
      ownerName: contract?.customer ?? item.khachHang.name,
      property: `${contract?.property ?? item.maCan} · ${item.duAn}`,
      value: contract?.value_str ?? "-",
      status: contract?.status ?? "Đã ký",
    },
    reason:
      "Khách hàng có nhu cầu chuyển nhượng quyền mua cho người thân theo thỏa thuận đã được xác nhận giữa hai bên. Hồ sơ pháp lý liên quan đã được bộ phận Legal kiểm tra và xác nhận hợp lệ.",
    oldOwner: fields("old", ownerFieldLabels, oldValues),
    newOwner: fields("new", ownerFieldLabels, newValues),
    notary: fields("notary", notaryFieldLabels, [
      "Đã công chứng", "15/03/2026", `VBCN-${2026000 + seed}`, "1",
      "Đầy đủ", "20/03/2026", "22/03/2026", `CT-${9000 + seed}`, contract?.status ?? "Đã ký",
    ]),
    docs: [
      { name: "Hợp đồng đặt cọc PDF", size: "118 KB", date: "11/03/2022" },
      { name: "Hợp đồng đặt cọc PDF", size: "118 KB", date: "11/03/2022" },
    ],
  };
}

export const addendumDetails: Record<string, AddendumDetail> = Object.fromEntries(
  addendumList.map((item, i) => [item.id, buildDetail(item, i)])
);
