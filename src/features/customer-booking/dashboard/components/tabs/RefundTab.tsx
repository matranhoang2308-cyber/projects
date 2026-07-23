import React from "react";
import {
  RotateCcw,
  Users,
  CheckCircle2,
  DollarSign,
  Clock,
  PieChart as PieIcon,
  ShieldAlert,
  Percent,
  CheckCheck,
} from "lucide-react";
import { MetricCard } from "../KpiCard";
import { ChartSection } from "../ChartSection";
import { ChartCard } from "../ChartCard";
import { LineChartGqut } from "../charts/LineChartGqut";
import { BarChartGqut } from "../charts/BarChartGqut";
import { DonutChartGqut } from "../charts/DonutChartGqut";
import { StackedColumn } from "../charts/StackedColumn";
import { FunnelChartGqut } from "../charts/FunnelChartGqut";
import { ProvinceMapStub } from "../charts/ProvinceMapStub";

import type { CustomerBooking } from "../../../types/booking";
import { mockRefunds } from "../../../mock/mockRefunds";
import {
  computeRefundKpis,
  computeRefundCharts,
  formatCurrency,
  filterRefunds,
  type FilterState,
} from "../../utils/computeMetrics";

interface RefundTabProps {
  bookings: CustomerBooking[];
  filters: FilterState;
}

export function RefundTab({ bookings, filters }: RefundTabProps) {
  const filteredRefundList = filterRefunds(mockRefunds, filters);
  const kpi = computeRefundKpis(filteredRefundList, bookings.length);
  const charts = computeRefundCharts(filteredRefundList, bookings);

  return (
    <div className="space-y-7">
      {/* ========================================================= */}
      {/* METRIC CARDS SECTIONS - 3 NHÓM KPI                      */}
      {/* ========================================================= */}

      {/* Nhóm 1: Số lượng */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-amber-500 rounded-full" />
          <h2 className="text-base font-semibold text-slate-950">Số lượng & Hồ sơ hoàn</h2>
        </div>
        <p className="text-xs text-slate-500 pl-3">Khối lượng lượt hoàn tiền và số hồ sơ giải quyết</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Tổng số giao dịch hoàn"
            value={kpi.tongSoGiaoDichHoan.toLocaleString("vi-VN")}
            hint="Số lượt yêu cầu hoàn tiền"
            icon={RotateCcw}
            tone="warning"
          />
          <MetricCard
            label="Tổng số khách hàng hoàn"
            value={kpi.tongSoKhachHangHoan.toLocaleString("vi-VN")}
            hint="Khách hàng duy nhất rút vốn"
            icon={Users}
            tone="customer"
          />
          <MetricCard
            label="Hồ sơ đã hoàn tiền"
            value={kpi.tongSoHoSoDaHoan.toLocaleString("vi-VN")}
            hint="Trạng thái: Đã hoàn"
            icon={CheckCircle2}
            tone="revenue"
          />
        </div>
      </div>

      {/* Nhóm 2: Số tiền */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-red-600 rounded-full" />
          <h2 className="text-base font-semibold text-slate-950">Giá trị dòng tiền hoàn</h2>
        </div>
        <p className="text-xs text-slate-500 pl-3">Tổng số tiền chi hoàn, giải ngân thực tế và số tiền chờ xử lý</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Tổng tiền hoàn GQUT"
            value={formatCurrency(kpi.tongTienHoan)}
            hint="Tổng số tiền yêu cầu hoàn"
            icon={DollarSign}
            tone="danger"
          />
          <MetricCard
            label="Tổng tiền đã hoàn"
            value={formatCurrency(kpi.tongTienDaHoan)}
            hint="Đã chi trả thành công"
            icon={CheckCircle2}
            tone="revenue"
          />
          <MetricCard
            label="Giá trị hoàn bình quân / KH"
            value={formatCurrency(kpi.giaTriHoanBinhQuan)}
            hint="Trung bình mỗi khách hàng"
            icon={PieIcon}
            tone="inventory"
          />
        </div>
      </div>

      {/* Nhóm 3: Kinh doanh */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-violet-600 rounded-full" />
          <h2 className="text-base font-semibold text-slate-950">Tỷ lệ chuyển đổi & Giữ chân</h2>
        </div>
        <p className="text-xs text-slate-500 pl-3">Tỷ lệ rút tiền đặt chỗ so với khả năng giữ chân khách hàng</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="Tỷ lệ hoàn GQUT (%)"
            value={`${kpi.tyLeHoanGqut}%`}
            hint="So với tổng số GQUT"
            icon={ShieldAlert}
            tone="danger"
          />
          <MetricCard
            label="Tỷ lệ giữ chân KH (%)"
            value={`${kpi.tyLeGiuChanKh}%`}
            hint="Khách hàng không rút vốn"
            icon={Percent}
            tone="revenue"
          />
          <MetricCard
            label="Tỷ lệ chuyển GQUT → Cọc (%)"
            value={`${kpi.tyLeChuyenCoc}%`}
            hint="Chuyển cọc thành công"
            icon={CheckCheck}
            tone="teal"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHARTS SECTIONS                                          */}
      {/* ========================================================= */}

      {/* Nhóm 1: Xu hướng hoàn GQUT (3 charts) */}
      <ChartSection
        title="Xu hướng hoàn GQUT theo thời gian"
        description="Theo dõi diễn biến số lượng, giá trị và lũy kế các giao dịch hoàn trả tiền đặt chỗ"
        badgeText="Refund Time Series"
        columns={3}
      >
        <ChartCard title="Số lượng hoàn GQUT theo thời gian" description="Số lượt giao dịch hoàn qua các tháng">
          <LineChartGqut
            data={charts.refundTimeseries || []}
            xKey="month"
            lines={[{ key: "soLuongHoan", name: "Số lượt hoàn", color: "#f59e0b" }]}
          />
        </ChartCard>

        <ChartCard title="Giá trị hoàn GQUT theo thời gian" description="Tổng dòng tiền chi trả hoàn tiền theo mốc thời gian">
          <LineChartGqut
            data={charts.refundTimeseries || []}
            xKey="month"
            formatType="currency"
            lines={[{ key: "giaTriHoan", name: "Giá trị hoàn", color: "#ef4444" }]}
          />
        </ChartCard>

        <ChartCard title="Lũy kế hoàn GQUT theo thời gian" description="Dòng tiền hoàn tích lũy theo chuỗi thời gian">
          <LineChartGqut
            data={charts.refundTimeseries || []}
            xKey="month"
            formatType="currency"
            lines={[{ key: "luyKeHoan", name: "Lũy kế hoàn", color: "#8b5cf6" }]}
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 2: Theo đơn vị bán (3 charts) */}
      <ChartSection
        title="Theo đơn vị bán"
        description="Phân tích số lượng và giá trị hoàn tiền theo từng sàn phân phối"
        badgeText="Distributors Refund"
        columns={3}
      >
        <ChartCard
          title="Số lượng hoàn tiền theo Đơn vị PP"
          description="Số lượt hoàn tiền phát sinh theo từng sàn phân phối"
        >
          <BarChartGqut
            data={(charts.distributorRefundCount || []).map((item: any) => ({
              name: item.name,
              count: item.phaiHoan ?? item.count ?? 0,
            }))}
            xKey="name"
            yKey="count"
            layout="vertical"
            color="#16a34a"
            barName="Số lượt hoàn"
          />
        </ChartCard>

        <ChartCard
          title="Giá trị tiền hoàn theo Đơn vị PP"
          description="Tổng giá trị tiền hoàn phân bổ theo từng sàn phân phối"
        >
          <BarChartGqut
            data={(charts.distributorRefundAmount || []).map((item: any) => ({
              name: item.name,
              amount: item.phaiHoan ?? item.amount ?? 0,
            }))}
            xKey="name"
            yKey="amount"
            layout="vertical"
            formatType="currency"
            color="#16a34a"
            barName="Giá trị hoàn"
          />
        </ChartCard>

        <ChartCard
          title="Top Đơn vị có số lượng hoàn cao nhất"
          description="Xếp hạng các sàn có phát sinh lượt hoàn nhiều nhất"
        >
          <BarChartGqut
            data={charts.topDistributorRefundList || []}
            xKey="name"
            yKey="totalCount"
            layout="vertical"
            color="#2563eb"
            barName="Số lượt hoàn"
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 3: Theo khách hàng (5 charts) */}
      <ChartSection
        title="Theo phân khúc khách hàng hoàn tiền"
        description="Chân dung đối tượng khách hàng thực hiện rút tiền đặt chỗ"
        badgeText="Demographics"
        columns={2}
      >
        <ChartCard title="Tỷ trọng Hoàn GQUT theo Nhóm KH" description="Cơ cấu nhóm đối tượng khách hàng rút tiền">
          <DonutChartGqut data={charts.refundGroupCount || []} centerLabel="Lượt hoàn" />
        </ChartCard>

        <ChartCard title="Giá trị hoàn theo Nhóm KH" description="Tổng số tiền hoàn theo từng nhóm khách hàng">
          <BarChartGqut
            data={charts.refundGroupAmount || []}
            xKey="name"
            yKey="amount"
            layout="vertical"
            formatType="currency"
            color="#f59e0b"
            barName="Giá trị hoàn"
          />
        </ChartCard>

        <ChartCard title="Khách hàng hoàn theo Nhóm tuổi" description="Phân bổ độ tuổi các khách hàng rút tiền đặt chỗ">
          <BarChartGqut
            data={charts.refundAgeData || []}
            xKey="age"
            yKey="count"
            color="#8b5cf6"
            barName="Số lượt"
          />
        </ChartCard>

        <ChartCard title="Khách hàng hoàn theo Giới tính" description="Phân bổ Nam / Nữ thực hiện hoàn phiếu">
          <BarChartGqut
            data={(charts.refundGenderData || []).map((d) => ({ ...d, fill: d.gender === "Nam" ? "#2563eb" : "#ec4899" }))}
            xKey="gender"
            yKey="count"
            barName="Số lượt"
          />
        </ChartCard>

        <div className="md:col-span-2">
          <ChartCard title="Khách hàng hoàn theo Tỉnh / Thành" description="Vị trí địa lý nơi phát sinh nhiều hồ sơ hoàn trả tiền nhất (Top 10 stub)">
            <ProvinceMapStub
              data={[
                { province: "TP. Hồ Chí Minh", count: 4 },
                { province: "Hà Nội", count: 2 },
                { province: "Đà Nẵng", count: 1 },
                { province: "Bình Dương", count: 1 },
                { province: "Đồng Nai", count: 1 },
                { province: "Cần Thơ", count: 1 },
              ]}
            />
          </ChartCard>
        </div>
      </ChartSection>

      {/* Nhóm 4: Theo thanh toán (2 charts) */}
      <ChartSection
        title="Hình thức thanh toán hoàn tiền"
        description="Phân bổ dòng tiền chi trả hoàn qua Chuyển khoản vs Tiền mặt"
        badgeText="Payment Methods"
        columns={2}
      >
        <ChartCard title="Tiền mặt vs Chuyển khoản (Giao dịch hoàn)" description="Tỷ trọng hình thức nhận lại tiền của khách hàng">
          <DonutChartGqut
            data={[
              { name: "Chuyển khoản", value: 775000000, fill: "#2563eb" },
              { name: "Tiền mặt", value: 280000000, fill: "#16a34a" },
            ]}
            formatType="currency"
            centerLabel="Tổng hoàn"
          />
        </ChartCard>

        <ChartCard title="Giá trị hoàn theo Hình thức × Thời gian" description="Biến động dòng tiền chi hoàn trả qua các tháng">
          <StackedColumn
            data={(charts.refundTimeseries || []).map((item) => ({
              month: item.month,
              chuyenKhoan: Math.round((item.giaTriHoan || 0) * 0.75),
              tienMat: Math.round((item.giaTriHoan || 0) * 0.25),
            }))}
            xKey="month"
            formatType="currency"
            bars={[
              { key: "chuyenKhoan", name: "Chuyển khoản", color: "#2563eb" },
              { key: "tienMat", name: "Tiền mặt", color: "#16a34a" },
            ]}
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 5: Kiểm soát rủi ro (2 charts) */}
      <ChartSection
        title="Kiểm soát rủi ro hoàn tiền"
        description="Phân tích các sàn có tỷ lệ hoàn bất thường & các khoản tiền hoàn giá trị lớn"
        badgeText="Risk Control"
        columns={2}
      >
        <ChartCard title="Đơn vị bán có tỷ lệ hoàn cao nhất" description="Xếp hạng sàn phân phối có tỷ lệ hoàn tiền/tổng GQUT lớn nhất">
          <BarChartGqut
            data={charts.topDistributorRefundList || []}
            xKey="name"
            yKey="totalCount"
            layout="vertical"
            color="#ef4444"
            barName="Lượt hoàn"
          />
        </ChartCard>

        <ChartCard title="Giá trị hoàn lớn nhất theo Khách hàng (Top 10)" description="Danh sách giao dịch hoàn tiền có số tiền lớn nhất">
          <BarChartGqut
            data={charts.topRefundCustomers || []}
            xKey="name"
            yKey="amount"
            layout="vertical"
            formatType="currency"
            color="#f59e0b"
            barName="Giá trị hoàn"
          />
        </ChartCard>
      </ChartSection>

      {/* Nhóm 6: Chuyển đổi (2 charts) */}
      <ChartSection
        title="Phễu chuyển đổi & Tỷ trọng quy trình"
        description="Mô hình chuyển đổi 3 giai đoạn: GQUT → Chuyển cọc → Hoàn GQUT"
        badgeText="Conversion Funnel"
        columns={2}
      >
        <ChartCard title="Funnel Chuyển đổi 3 Giai đoạn" description="Tỷ lệ rơi vãi và chuyển cọc thành công từ tổng giữ chỗ">
          <FunnelChartGqut data={charts.funnelData || []} />
        </ChartCard>

        <ChartCard title="Tỷ trọng GQUT / Hoàn GQUT / Chuyển cọc" description="Phân bổ trạng thái cuối cùng của toàn bộ phiếu đặt chỗ">
          <DonutChartGqut data={charts.conversionProportions || []} centerLabel="Tổng phiếu" />
        </ChartCard>
      </ChartSection>
    </div>
  );
}
