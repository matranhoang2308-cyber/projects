import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency, formatCurrencyShort } from "../../utils/computeMetrics";

const axisStyle = { fontSize: 11, fill: "#64748b" };

interface StackedColumnProps {
  data: any[];
  xKey: string;
  bars: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  formatType?: "number" | "currency";
  layout?: "horizontal" | "vertical";
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

export function StackedColumn({
  data,
  xKey,
  bars,
  formatType = "number",
  layout = "horizontal",
}: StackedColumnProps) {
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
            formatter={(val: any, name: any) => [
              formatType === "currency" ? formatCurrency(Number(val)) : Number(val).toLocaleString("vi-VN"),
              name,
            ]}
          />
          <Legend content={renderPillLegend} />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              stackId="stacked"
              fill={bar.color}
              maxBarSize={28}
              isAnimationActive={false}
            />
          ))}
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
          formatter={(val: any, name: any) => [
            formatType === "currency" ? formatCurrency(Number(val)) : Number(val).toLocaleString("vi-VN"),
            name,
          ]}
        />
        <Legend content={renderPillLegend} />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            stackId="stacked"
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={38}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
