import React from "react";
import {
  FileText,
  Users,
  DollarSign,
  Wallet,
  AlertCircle,
  Target,
  ArrowRightLeft,
  Banknote,
  CreditCard,
} from "lucide-react";
import { MetricCard } from "../KpiCard";
import { ChartSection } from "../ChartSection";
import { ChartCard } from "../ChartCard";
import { LineChartGqut } from "../charts/LineChartGqut";
import { BarChartGqut } from "../charts/BarChartGqut";
import { DonutChartGqut } from "../charts/DonutChartGqut";
import { StackedColumn } from "../charts/StackedColumn";
import { ProvinceMapStub } from "../charts/ProvinceMapStub";

import type { CustomerBooking } from "../../../types/booking";
import {
  computeGqutKpis,
  computeGqutCharts,
  formatCurrency,
} from "../../utils/computeMetrics";

interface GqutTabProps {
  bookings: CustomerBooking[];
}

export function GqutTab({ bookings }: GqutTabProps) {
  const kpi = computeGqutKpis(bookings);
  const charts = computeGqutCharts(bookings);

  return (
    <div className="space-y-7">
      {/* ========================================================= */}
      {/* METRIC CARDS SECTIONS - 3 NHÓM                           */}
      {/* ========================================================= */}

      {/* Nhóm 1: Số lượng */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="text-base font-semibold text-slate-950">Số lượng & Khách hàng</h2>
        </div>
        <p className="text-xs text-slate-500 pl-3">Quy mô phiếu đặt chỗ và đối tượng khách hàng giao dịch</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Tổng số GQUT"
            value={kpi.tongSoGqut.toLocaleString("vi-VN")}
            hint="Số phiếu đặt chỗ đã tạo"
            icon={FileText}
            tone="inventory"
          />
          <MetricCard
            label="Tổng số khách hàng"
            value={kpi.tongSoKhachHang.toLocaleString("vi-VN")}
            hint="Khách hàng có giao dịch"
            icon={Users}
            tone="customer"
          />
          <MetricCard
            label="% Hoàn thành chỉ tiêu"
            value={`${kpi.tyLeHoanThanhChiTieu}%`}
            hint="Target: 100 phiếu"
            icon={Target}
            tone="purple"
            progress={kpi.tyLeHoanThanhChiTieu}
          />
          <MetricCard
            label="Tỷ lệ chuyển GQUT → Cọc"
            value={`${kpi.tyLeChuyenCoc}%`}
            hint="Chuyển cọc thành công"
            icon={ArrowRightLeft}
            tone="teal"
          />
        </div>
      </div>

      {/* Nhóm 2: Số tiền & Dòng tiền */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-green-600 rounded-full" />
          <h2 className="text-base font-semibold text-slate-950">Doanh thu & Dòng tiền thu</h2>
        </div>
        <p className="text-xs text-slate-500 pl-3">Khối lượng tiền thu, chuyển khoản và nợ bổ sung</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Tổng phải thu"
            value={formatCurrency(kpi.tongPhaiThu)}
            hint="SUM(phaiThu)"
            icon={DollarSign}
            tone="revenue"
          />
          <MetricCard
            label="Tổng đã thu"
            value={formatCurrency(kpi.tongDaThu)}
            hint="Tỷ lệ thu thành công"
            icon={Wallet}
            tone="inventory"
          />
          <MetricCard
            label="Đã thu Tiền mặt"
            value={formatCurrency(kpi.daThuTienMat)}
            hint="Thanh toán trực tiếp"
            icon={Banknote}
            tone="revenue"
          />
          <MetricCard
            label="Đã thu Chuyển khoản"
            value={formatCurrency(kpi.daThuChuyenKhoan)}
            hint="Chuyển khoản ngân hàng"
            icon={CreditCard}
            tone="inventory"
          />
          <MetricCard
            label="Tổng còn thiếu"
            value={formatCurrency(kpi.tongConThieu)}
            hint="Nợ chưa bổ sung đủ"
            icon={AlertCircle}
            tone="warning"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHARTS SECTIONS                                          */}
      {/* ========================================================= */}

      {/* Nhóm 1: Xu hướng theo thời gian (3 charts) */}
      <ChartSection
        title="Xu hướng theo thời gian"
        description="Theo dõi biến động số lượng, giá trị và lũy kế GQUT so với kế hoạch"
        badgeText="Time Series"
        columns={3}
      >
        <ChartCard
          title="Số lượng GQUT theo thời gian"
          description="Số phiếu đặt chỗ phát sinh qua các tháng"
        >
          <LineChartGqut
            data={charts.timeseries}
            xKey="month"
            lines={[{ key: "soLuongGQUT", name: "Số lượng GQUT", color: "#2563eb" }]}
          />
        </ChartCard>

        <ChartCard
          title="Số tiền GQUT theo thời gian"
          description="Tổng giá trị phải thu đặt chỗ theo thời gian"
        >
          <LineChartGqut
            data={charts.timeseries}
            xKey="month"
            formatType="currency"
            lines={[{ key: "giaTriGQUT", name: "Giá trị GQUT", color: "#16a34a" }]}
          />
        </ChartCard>

        <ChartCard
          title="Lũy kế GQUT so với Kế hoạch"
          description="So sánh lũy kế thực tế (Actual) vs Chỉ tiêu (Target)"
        >
          <LineChartGqut
            data={charts.timeseries}
            xKey="month"
            lines={[
              { key: "luyKeThucTeCount", name: "Thực tế", color: "#2563eb" },
              { key: "luyKeKeHoachCount", name: "Kế hoạch", color: "#f59e0b", dash: "4 4" },
            ]}
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 2: Theo đơn vị bán (3 charts) */}
      <ChartSection
        title="Theo đơn vị bán & Nhân sự"
        description="Hiệu suất phân phối và bán hàng theo sàn giao dịch & chuyên viên tư vấn"
        badgeText="Distributor & Sales"
        columns={3}
      >
        <ChartCard
          title="Số lượng GQUT theo Đơn vị bán"
          description="Sắp xếp theo thứ tự giảm dần"
        >
          <BarChartGqut
            data={charts.distributorCountList}
            xKey="name"
            yKey="count"
            layout="vertical"
            color="#2563eb"
            barName="Số lượng"
          />
        </ChartCard>

        <ChartCard
          title="Giá trị GQUT theo Đơn vị bán"
          description="Tổng doanh số đặt chỗ theo từng sàn"
        >
          <BarChartGqut
            data={charts.distributorAmountList}
            xKey="name"
            yKey="amount"
            formatType="currency"
            color="#16a34a"
            barName="Giá trị"
          />
        </ChartCard>

        <ChartCard
          title="Top 10 NVTV xuất sắc nhất"
          description="Xếp hạng NVTV có số lượng GQUT cao nhất"
        >
          <BarChartGqut
            data={charts.topNvtvList}
            xKey="name"
            yKey="count"
            layout="vertical"
            color="#8b5cf6"
            barName="Số phiếu"
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 3: Theo khách hàng (4 charts) */}
      <ChartSection
        title="Theo phân khúc & Chân dung khách hàng"
        description="Phân bổ khách hàng theo nhóm, giới tính, độ tuổi và vị trí địa lý"
        badgeText="Customer Demographics"
        columns={2}
      >
        <ChartCard
          title="Tỷ trọng GQUT theo Nhóm khách hàng"
          description="Phân bổ phiếu đặt chỗ theo nhóm đối tượng KH"
        >
          <DonutChartGqut
            data={charts.customerGroupCount}
            centerLabel="Khách hàng"
          />
        </ChartCard>

        <ChartCard
          title="Giá trị GQUT theo Nhóm khách hàng"
          description="Tổng doanh thu phân bổ theo nhóm khách hàng"
        >
          <BarChartGqut
            data={charts.customerGroupAmount}
            xKey="name"
            yKey="amount"
            formatType="currency"
            color="#06b6d4"
            barName="Giá trị"
          />
        </ChartCard>

        <ChartCard
          title="Phân bổ Khách hàng Nam/Nữ & Nhóm tuổi"
          description="Cơ cấu giới tính và độ tuổi của khách hàng đặt chỗ"
        >
          <StackedColumn
            data={charts.genderAgeData}
            xKey="age"
            bars={[
              { key: "nam", name: "Nam", color: "#2563eb" },
              { key: "nu", name: "Nữ", color: "#ec4899" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Khách hàng theo Tỉnh / Thành"
          description="Bản đồ phân bổ vị trí liên hệ chính của khách hàng (Top 10)"
        >
          <ProvinceMapStub data={charts.provinceList} />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 4: Theo thanh toán (2 charts) */}
      <ChartSection
        title="Hình thức & Tiến độ thanh toán"
        description="Cơ cấu dòng tiền thu qua Chuyển khoản vs Tiền mặt theo thời gian"
        badgeText="Payment Breakdown"
        columns={2}
      >
        <ChartCard
          title="Tỷ trọng Chuyển khoản vs Tiền mặt"
          description="Tổng tiền thực thu phân bổ theo hình thức giao dịch"
        >
          <DonutChartGqut
            data={charts.paymentMethodData}
            formatType="currency"
            centerLabel="Đã thu"
          />
        </ChartCard>

        <ChartCard
          title="Số tiền thu theo Hình thức × Tháng"
          description="Diễn biến dòng tiền chuyển khoản và tiền mặt qua 12 tháng"
        >
          <StackedColumn
            data={charts.timeseries}
            xKey="month"
            formatType="currency"
            bars={[
              { key: "soTienChuyenKhoan", name: "Chuyển khoản", color: "#2563eb" },
              { key: "soTienTienMat", name: "Tiền mặt", color: "#16a34a" },
            ]}
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 5: Kiểm soát công nợ (2 charts) */}
      <ChartSection
        title="Kiểm soát công nợ"
        description="Theo dõi khoản công nợ chưa bổ sung đủ theo khách hàng và đơn vị phân phối"
        badgeText="Debt Control"
        columns={2}
      >
        <ChartCard
          title="Top 10 Khách hàng chưa thanh toán đủ"
          description="Danh sách khách hàng còn thiếu số tiền bổ sung lớn nhất"
          isEmpty={charts.topDebtCustomers.length === 0}
        >
          <BarChartGqut
            data={charts.topDebtCustomers}
            xKey="name"
            yKey="conBoSung"
            layout="vertical"
            formatType="currency"
            color="#ef4444"
            barName="Còn thiếu"
          />
        </ChartCard>

        <ChartCard
          title="Số tiền còn thiếu nhiều nhất theo Đơn vị bán"
          description="Tổng giá trị nợ đọng chưa nộp đủ phân bổ theo sàn"
          isEmpty={charts.distributorDebtList.length === 0}
        >
          <BarChartGqut
            data={charts.distributorDebtList}
            xKey="name"
            yKey="conThieu"
            formatType="currency"
            color="#f59e0b"
            barName="Còn thiếu"
          />
        </ChartCard>
      </ChartSection>
    </div>
  );
}
