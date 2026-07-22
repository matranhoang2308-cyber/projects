import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatCurrencyShort } from "../../utils/computeMetrics";

const axisStyle = { fontSize: 11, fill: "#64748b" };

interface LineChartProps {
  data: any[];
  xKey: string;
  lines: Array<{
    key: string;
    name: string;
    color: string;
    dash?: string;
  }>;
  formatType?: "number" | "currency";
}

const renderPillLegend = (props: any) => {
  const { payload } = props;
  if (!payload || !payload.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      {payload.map((entry: any, index: number) => (
        <span
          key={`item-${index}`}
          className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200/90 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs"
        >
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
};

export function LineChartGqut({ data, xKey, lines, formatType = "number" }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <XAxis
          dataKey={xKey}
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={18}
        />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => (formatType === "currency" ? formatCurrencyShort(val) : val.toLocaleString("vi-VN"))}
        />
        <Tooltip
          cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
          contentStyle={{
            backgroundColor: "#ffffff",
            borderColor: "#e2e8f0",
            borderRadius: "0.5rem",
            fontSize: "12px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
          }}
          formatter={(value: any, name: any) => [
            formatType === "currency" ? formatCurrency(Number(value)) : Number(value).toLocaleString("vi-VN"),
            name,
          ]}
        />
        {lines.length > 1 && <Legend content={renderPillLegend} />}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeDasharray={line.dash}
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
