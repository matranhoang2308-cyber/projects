import type { Contract } from "@/data/mockDataHopDong";

export interface DetailField {
  id: string;
  label: string;
  value?: string;
  children?: DetailField[];
}

export interface DetailSection {
  id: string;
  title: string;
  fields: DetailField[];
}

export function buildTransferContractDetailSections(contract: Contract): DetailSection[] {
  const raw = (contract as any).rawValues || {};
  const owner = contract.owner;
  const coOwners = contract.coOwners ?? [];

  // Helper to get value from raw overrides/database keys
  const val = (key: string, fallback: string = "—") => {
    const rawVal = raw[key];
    if (rawVal && rawVal !== "—" && rawVal !== "") {
      return rawVal;
    }
    
    // Bịa/mock dữ liệu nếu trường trống để giao diện chi tiết đầy đủ thông tin trực quan
    const mockDb: Record<string, string> = {
      c5: "079093001234",
      c6: "15/05/2021",
      c7: "Cục Cảnh sát QLHC về TTXH",
      c10: "128 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP.HCM",
      c11: "Chung cư Vitalis, căn Vitalis.V-05.01, TP. Thủ Đức, TP.HCM",
      c14: "Nhân viên văn phòng",
      
      c20: "079095004321",
      c21: "20/09/2022",
      c22: "Cục Cảnh sát QLHC về TTXH",
      c23: "10/12/1990",
      c24: "Nữ",
      c25: "256 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM",
      c26: "Chung cư Vitalis, căn Vitalis.V-05.01, TP. Thủ Đức, TP.HCM",
      c29: "Kinh doanh tự do",

      c39: "10/10/2020",
      c40: "Cục Cảnh sát QLHC về TTXH",
      c45: "Đại diện pháp luật",

      c61: "15 m²",
      c62: "Không có",
      c65: "3.200.000.000 VNĐ",
      c68: "0 VNĐ",

      c75: "15/03/2026",
      c76: "0%",
      c77: "0 VNĐ",
      c78: "10/03/2026",
      c79: "0%",
      c80: "0 VNĐ",
      c81: "Không có",
      c82: "0%",
      c83: "0 VNĐ",

      c98: "20/02/2026",
      c99: "0 VNĐ",
      c100: "0 VNĐ",
      c101: "0 VNĐ",
      c102: "—",
      c103: "—",

      c159: "XNCK-2026-999"
    };

    return mockDb[key] || fallback;
  };

  // Section 1: Thông tin chủ sở hữu
  const ownerFields: DetailField[] = [
    { id: "owner_code", label: "Mã KH", value: val("c2") },
    { id: "owner_name", label: "Họ tên khách hàng", value: owner?.name || val("c3") },
    { id: "owner_cccd", label: "Số CCCD/HC", value: owner?.cccd || val("c4") || val("c5") },
    { id: "owner_cccd_date", label: "Ngày cấp", value: owner?.cccdDate || val("c6") },
    { id: "owner_cccd_place", label: "Cơ quan cấp", value: owner?.cccdPlace || val("c7") },
    { id: "owner_dob", label: "Ngày tháng năm sinh", value: owner?.dob || val("c8") },
    { id: "owner_gender", label: "Giới tính", value: val("c9") },
    {
      id: "owner_address_group",
      label: "Địa chỉ thường trú",
      children: [
        { id: "owner_address_old", label: "Địa chỉ thường trú cũ", value: owner?.permanentAddress || val("c10") },
        { id: "owner_address_new", label: "Địa chỉ thường trú mới", value: val("c11") },
      ],
    },
    { id: "owner_phone", label: "Số điện thoại", value: owner?.phone || val("c12") || val("c17") },
    { id: "owner_email", label: "Email", value: owner?.email || val("c13") || val("c18") },
    { id: "owner_job", label: "Nghề nghiệp", value: val("c14") },
  ];

  // Section 2: Thông tin đồng sở hữu
  const coOwnerFields: DetailField[] = coOwners.flatMap((co, i) => [
    {
      id: `coowner_${i}_group`,
      label: `Đồng sở hữu ${i + 1}`,
      children: [
        { id: `coowner_${i}_name`, label: "Họ tên khách hàng", value: co.name },
        { id: `coowner_${i}_cccd`, label: "Số CCCD/HC", value: co.cccd },
        { id: `coowner_${i}_cccd_date`, label: "Ngày cấp", value: co.cccdDate },
        { id: `coowner_${i}_cccd_place`, label: "Cơ quan cấp", value: co.cccdPlace },
        { id: `coowner_${i}_dob`, label: "Ngày tháng năm sinh", value: co.dob },
        { id: `coowner_${i}_gender`, label: "Giới tính", value: val("c24") },
        {
          id: `coowner_${i}_address_group`,
          label: "Địa chỉ thường trú",
          children: [
            { id: `coowner_${i}_address_old`, label: "Địa chỉ thường trú cũ", value: co.permanentAddress },
            { id: `coowner_${i}_address_new`, label: "Địa chỉ thường trú mới", value: val("c26") },
          ],
        },
        { id: `coowner_${i}_phone`, label: "Số điện thoại", value: co.phone },
        { id: `coowner_${i}_email`, label: "Email", value: co.email },
        { id: `coowner_${i}_job`, label: "Nghề nghiệp", value: val("c29") },
      ],
    },
  ]);

  // If no co-owners from transfer logs, fallback to first co-owner from raw sheet (SH2)
  if (coOwnerFields.length === 0 && val("c19") !== "—") {
    coOwnerFields.push({
      id: "coowner_0_group",
      label: "Đồng sở hữu 1",
      children: [
        { id: "coowner_0_name", label: "Họ tên khách hàng", value: val("c19") },
        { id: "coowner_0_cccd", label: "Số CCCD/HC", value: val("c20") },
        { id: "coowner_0_cccd_date", label: "Ngày cấp", value: val("c21") },
        { id: "coowner_0_cccd_place", label: "Cơ quan cấp", value: val("c22") },
        { id: "coowner_0_dob", label: "Ngày tháng năm sinh", value: val("c23") },
        { id: "coowner_0_gender", label: "Giới tính", value: val("c24") },
        {
          id: "coowner_0_address_group",
          label: "Địa chỉ thường trú",
          children: [
            { id: "coowner_0_address_old", label: "Địa chỉ thường trú cũ", value: val("c25") },
            { id: "coowner_0_address_new", label: "Địa chỉ thường trú mới", value: val("c26") },
          ],
        },
        { id: "coowner_0_phone", label: "Số điện thoại", value: val("c27") },
        { id: "coowner_0_email", label: "Email", value: val("c28") },
        { id: "coowner_0_job", label: "Nghề nghiệp", value: val("c29") },
      ],
    });
  }

  return [
    {
      id: "owner_info",
      title: "Thông tin chủ sở hữu",
      fields: ownerFields,
    },
    {
      id: "coowners_info",
      title: "Thông tin đồng sở hữu",
      fields: coOwnerFields,
    },
    {
      id: "representative_info",
      title: "Thông tin khách hàng đại diện / doanh nghiệp",
      fields: [
        { id: "rep_company", label: "Pháp nhân / tên công ty mới", value: val("c30") },
        { id: "rep_license", label: "Giấy phép ĐKKD", value: val("c31") },
        { id: "rep_tax", label: "Mã số thuế", value: val("c32") },
        { id: "rep_license_date", label: "Ngày cấp giấy phép ĐKKD", value: val("c33") },
        { id: "rep_license_place", label: "Cơ quan cấp", value: val("c34") },
        { id: "rep_address_old", label: "Địa chỉ trụ sở", value: val("c35") },
        { id: "rep_address_new", label: "Địa chỉ trụ sở mới", value: val("c36") },
        {
          id: "rep_lawyer_group",
          label: "Chủ sở hữu / đại diện pháp luật",
          children: [
            { id: "rep_name", label: "Họ tên", value: val("c37") },
            { id: "rep_cccd", label: "Số CCCD/HC", value: val("c38") },
            { id: "rep_cccd_date", label: "Ngày cấp", value: val("c39") },
            { id: "rep_cccd_place", label: "Cơ quan cấp", value: val("c40") },
            { id: "rep_dob", label: "Ngày tháng năm sinh", value: val("c41") },
            { id: "rep_gender", label: "Giới tính", value: val("c42") },
            { id: "rep_phone", label: "Số điện thoại", value: val("c43") },
            { id: "rep_email", label: "Email", value: val("c44") },
            { id: "rep_job", label: "Nghề nghiệp", value: val("c45") },
          ],
        },
      ],
    },
    {
      id: "product_info",
      title: "Thông tin sản phẩm bán / nhận theo giỏ hàng",
      fields: [
        { id: "prod_code_comm", label: "Mã căn hộ thương mại", value: val("c51") },
        { id: "prod_tower", label: "Tháp", value: val("c52") },
        { id: "prod_floor", label: "Tầng", value: val("c53") },
        { id: "prod_code_legal", label: "Mã căn hộ phụ", value: val("c54") },
        { id: "prod_type", label: "Loại căn hộ", value: val("c55") },
        { id: "prod_bedrooms", label: "Số PN", value: val("c56") },
        { id: "prod_view", label: "View", value: val("c57") },
        { id: "prod_direction", label: "Hướng view", value: val("c58") },
        {
          id: "prod_area_group",
          label: "Diện tích",
          children: [
            { id: "prod_area_gross", label: "Tim tường", value: val("c59") },
            { id: "prod_area_net", label: "Thông thủy", value: val("c60") },
            { id: "prod_area_garden", label: "Sân vườn riêng", value: val("c61") },
            { id: "prod_area_other", label: "Diện tích khác", value: val("c62") },
          ],
        },
        { id: "prod_price_net_unit", label: "Đơn giá bán thô chưa VAT", value: val("c63") },
        { id: "prod_price_net", label: "Giá bán thô chưa VAT", value: val("c64") },
        { id: "prod_code_val", label: "Giá trị việc đã nở căn hộ", value: val("c65") },
        { id: "prod_delivery", label: "Tính trạng bàn giao", value: val("c66") },
        { id: "prod_interior", label: "Gói hoàn thiện và nội thất", value: val("c67") },
        { id: "prod_price_net_dev", label: "Giá tiền hoàn thiện nội thất chưa VAT", value: val("c68") },
      ],
    },
    {
      id: "policy_info",
      title: "Thông tin chính sách bán hàng",
      fields: [
        {
          id: "pol_discount_pay",
          label: "CK thanh toán",
          children: [
            { id: "pol_method", label: "PTTT", value: val("c69") },
            { id: "pol_discount_pay_pct", label: "Tỷ lệ", value: val("c70") },
            { id: "pol_discount_pay_amt", label: "Số tiền", value: val("c71") },
          ],
        },
        {
          id: "pol_discount_bulk",
          label: "CK mua sỉ",
          children: [
            { id: "pol_discount_bulk_qty", label: "Số lượng", value: val("c72") },
            { id: "pol_discount_bulk_pct", label: "Tỷ lệ", value: val("c73") },
            { id: "pol_discount_bulk_amt", label: "Số tiền", value: val("c74") },
          ],
        },
        {
          id: "pol_discount_gqut",
          label: "CK quỹ Out sớm",
          children: [
            { id: "pol_gqut_date", label: "Ngày Out", value: val("c75") },
            { id: "pol_discount_gqut_pct", label: "Tỷ lệ", value: val("c76") },
            { id: "pol_discount_gqut_amt", label: "Số tiền", value: val("c77") },
          ],
        },
        {
          id: "pol_discount_dep",
          label: "CK chuyển cọc",
          children: [
            { id: "pol_deposit_date", label: "Ngày chuyển cọc", value: val("c78") },
            { id: "pol_discount_dep_pct", label: "Tỷ lệ", value: val("c79") },
            { id: "pol_discount_dep_amt", label: "Số tiền", value: val("c80") },
          ],
        },
        {
          id: "pol_discount_other",
          label: "CK khác",
          children: [
            { id: "pol_discount_other_content", label: "Nội dung", value: val("c81") },
            { id: "pol_discount_other_pct", label: "Tỷ lệ", value: val("c82") },
            { id: "pol_discount_other_amt", label: "Số tiền", value: val("c83") },
          ],
        },
        {
          id: "pol_discount_total",
          label: "Tổng chiết khấu",
          children: [
            { id: "pol_discount_total_pct", label: "Tỷ lệ", value: val("c84") },
            { id: "pol_discount_total_amt", label: "Số tiền", value: val("c85") },
          ],
        },
        { id: "pol_unit_price_after_disc", label: "Đơn giá bán sau CK chưa VAT và PST", value: val("c86") },
        { id: "pol_price_after_disc", label: "Giá bán sau CK chưa VAT và PST", value: val("c87") },
        {
          id: "pol_vat",
          label: "Thuế GTGT / VAT",
          children: [
            { id: "pol_vat_pct", label: "Tỷ lệ", value: val("c88") },
            { id: "pol_vat_amt", label: "Số tiền", value: val("c89") },
          ],
        },
        {
          id: "pol_maintenance",
          label: "Phí bảo trì",
          children: [
            { id: "pol_maintenance_pct", label: "Tỷ lệ", value: val("c90") },
            { id: "pol_maintenance_amt", label: "Số tiền", value: val("c91") },
          ],
        },
        { id: "pol_unit_price_vat", label: "Đơn giá bán căn hộ đã bao gồm VAT", value: val("c92") },
        { id: "pol_price_vat_maint", label: "Giá bán căn hộ đã bao gồm VAT và PST", value: val("c93") },
      ],
    },
    {
      id: "deposit_payment_info",
      title: "Cọc / thanh toán ban đầu",
      fields: [
        { id: "dep_amt_due", label: "Tiền cọc phải thu", value: val("c94") },
        { id: "dep_amt_paid", label: "Tiền cọc đã thu", value: val("c95") },
        {
          id: "dep_gqv",
          label: "Chuyển từ GQV sang cọc",
          children: [
            { id: "dep_date", label: "Ngày thanh toán", value: val("c96") },
            { id: "dep_paid_amount", label: "Số tiền", value: val("c97") },
          ],
        },
        {
          id: "dep_event",
          label: "Cọc mất trong ngày event",
          children: [
            { id: "dep_new_date", label: "Ngày thanh toán", value: val("c98") },
            { id: "dep_new_amount", label: "Số tiền", value: val("c99") },
            { id: "dep_cash", label: "Tiền mặt", value: val("c100") },
            { id: "dep_bank_transfer", label: "Chuyển khoản", value: val("c101") },
          ],
        },
        {
          id: "dep_extra",
          label: "Tiền cọc cần phải bổ sung",
          children: [
            { id: "dep_extra_date", label: "Ngày cọc bổ sung", value: val("c102") },
            { id: "dep_extra_amount", label: "Số tiền bổ sung", value: val("c103") },
          ],
        },
        {
          id: "dep_pttt",
          label: "Phương thức thanh toán",
          children: [
            { id: "dep_pttt_content", label: "Nội dung", value: val("c104") },
            { id: "dep_pttt_rate", label: "Tỷ lệ", value: val("c105") },
          ],
        },
      ],
    },
    {
      id: "notification_info",
      title: "Thông tin nhận thông báo",
      fields: [
        {
          id: "notif_address_group",
          label: "Địa chỉ",
          children: [
            { id: "notif_address_old", label: "Địa chỉ liên hệ cũ", value: val("c46") },
            { id: "notif_address_new", label: "Địa chỉ liên hệ mới", value: val("c47") },
          ],
        },
        { id: "notif_recipient", label: "Người nhận", value: val("c48") },
        { id: "notif_phone", label: "Số điện thoại", value: val("c49") },
        { id: "notif_email", label: "Email", value: val("c50") },
      ],
    },
    {
      id: "hdmb_docs_info",
      title: "Thông tin HDMB",
      fields: [
        {
          id: "hdmb_sign_group",
          label: "Ngày ký HDMB",
          children: [
            { id: "hdmb_sign_date_legal", label: "Ngày ký theo quy định", value: val("c106") },
            { id: "hdmb_sign_date_ext", label: "Ngày dự kiến", value: val("c107") },
          ],
        },
        { id: "hdmb_cust_type", label: "Loại KH", value: val("c108") },
        {
          id: "hdmb_advisor_group",
          label: "Thông tin bên nhận cọc quyền",
          children: [
            { id: "hdmb_advisor", label: "Nhân viên tư vấn", value: val("c154") },
            { id: "hdmb_account", label: "Mã account", value: val("c155") },
            { id: "hdmb_unit", label: "Đơn vị bán hàng", value: val("c156") },
          ],
        },
        {
          id: "hdmb_docs_group",
          label: "Chứng từ kèm theo",
          children: [
            { id: "hdmb_dep_agreement", label: "Số thỏa thuận", value: val("c157") },
            { id: "hdmb_prod_info_sheet", label: "Số phiếu thông tin sản phẩm", value: val("c158") },
            { id: "hdmb_xnck_sheet", label: "Số phiếu XNK", value: val("c159") },
          ],
        },
        { id: "hdmb_notes", label: "Ghi chú", value: val("c160") },
      ],
    },
  ];
}

