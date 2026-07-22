import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartLegendList } from "../ChartCard";
import { formatCurrency } from "../../utils/computeMetrics";

const DEFAULT_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface DonutChartProps {
  data: Array<{ name: string; value: number; fill?: string }>;
  formatType?: "number" | "currency";
  centerLabel?: string;
}

export function DonutChartGqut({ data, formatType = "number", centerLabel }: DonutChartProps) {
  const total = data.reduce((s, item) => s + (item.value || 0), 0);

  const chartData = data.map((item, idx) => ({
    ...item,
    fill: item.fill || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
  }));

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_210px] items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(value: any, _name: any, item: any) => {
              const pct = total ? (Number(value) / total) * 100 : 0;
              const formattedVal =
                formatType === "currency"
                  ? formatCurrency(Number(value))
                  : Number(value).toLocaleString("vi-VN");
              return [
                `${formattedVal} (${pct.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%)`,
                item.payload.name,
              ];
            }}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {chartData.map((item, index) => (
              <Cell key={`cell-${index}`} fill={item.fill} />
            ))}
          </Pie>
          {centerLabel && (
            <>
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#0f172a"
                fontSize="16"
                fontWeight="700"
              >
                {formatType === "currency" ? formatCurrency(total) : total.toLocaleString("vi-VN")}
              </text>
              <text
                x="50%"
                y="56%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#64748b"
                fontSize="11"
              >
                {centerLabel}
              </text>
            </>
          )}
        </PieChart>
      </ResponsiveContainer>
      <ChartLegendList
        items={chartData.map((item) => ({
          name: item.name,
          amount: formatType === "currency" ? item.value : undefined,
          count: formatType === "number" ? item.value : undefined,
          fill: item.fill,
        }))}
        valueLabel={formatType === "currency" ? "amount" : "count"}
        formatFn={(val) => (formatType === "currency" ? formatCurrency(val) : val.toLocaleString("vi-VN"))}
      />
    </div>
  );
}
