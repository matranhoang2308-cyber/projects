import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatCurrency, formatCurrencyShort } from "../../utils/computeMetrics";

const axisStyle = { fontSize: 11, fill: "#64748b" };

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  layout?: "horizontal" | "vertical";
  color?: string;
  formatType?: "number" | "currency";
  barName?: string;
}

export function BarChartGqut({
  data,
  xKey,
  yKey,
  layout = "horizontal",
  color = "#2563eb",
  formatType = "number",
  barName = "Giá trị",
}: BarChartProps) {
  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, left: 8, bottom: 4 }}>
          <XAxis
            type="number"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (formatType === "currency" ? formatCurrencyShort(val) : val.toLocaleString("vi-VN"))}
          />
          <YAxis
            dataKey={xKey}
            type="category"
            width={125}
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#e2e8f0",
              borderRadius: "0.5rem",
              fontSize: "12px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
            formatter={(val: any) => [
              formatType === "currency" ? formatCurrency(Number(val)) : Number(val).toLocaleString("vi-VN"),
              barName,
            ]}
          />
          <Bar dataKey={yKey} fill={color} radius={[0, 6, 6, 0]} maxBarSize={26} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 4 }}>
        <XAxis dataKey={xKey} tick={axisStyle} tickLine={false} axisLine={false} minTickGap={12} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => (formatType === "currency" ? formatCurrencyShort(val) : val.toLocaleString("vi-VN"))}
        />
        <Tooltip
          cursor={{ fill: "#f8fafc" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            borderRadius: "0.5rem",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
          formatter={(val: any) => [
            formatType === "currency" ? formatCurrency(Number(val)) : Number(val).toLocaleString("vi-VN"),
            barName,
          ]}
        />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={42} isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill || color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
