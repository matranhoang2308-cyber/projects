import React from "react";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  fill?: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
}

const DEFAULT_FUNNEL_COLORS = ["#2563eb", "#0284c7", "#8b5cf6", "#16a34a", "#ef4444"];

export function FunnelChartGqut({ data }: FunnelChartProps) {
  if (!data || data.length === 0) return null;

  const totalStages = data.length;
  const svgWidth = 340;
  const svgHeight = 180;
  const topWidth = 240;
  const centerX = 130;
  const gap = 3;

  const sliceHeight = (svgHeight - (totalStages - 1) * gap) / totalStages;

  // Conversion rate: stage 1 to stage 2 or overall ratio
  const conversionRate =
    data.length > 1 && data[0].count > 0
      ? ((data[1].count / data[0].count) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="flex flex-col items-center justify-between h-full pt-1 pb-1">
      {/* SVG Inverted Funnel Chart matching Image 2 */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[180px]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-h-[200px] overflow-visible">
          {data.map((item, idx) => {
            const yTop = idx * (sliceHeight + gap);
            const yBottom = yTop + sliceHeight;

            // Width radii at top and bottom of slice
            const rTop = (topWidth / 2) * (1 - yTop / (svgHeight + 20));
            const rBottom = (topWidth / 2) * (1 - yBottom / (svgHeight + 20));

            const xTopLeft = centerX - rTop;
            const xTopRight = centerX + rTop;
            const xBottomLeft = centerX - rBottom;
            const xBottomRight = centerX + rBottom;

            const color = item.fill || DEFAULT_FUNNEL_COLORS[idx % DEFAULT_FUNNEL_COLORS.length];

            const isLast = idx === totalStages - 1;
            const points = isLast
              ? `${xTopLeft},${yTop} ${xTopRight},${yTop} ${centerX},${yBottom}`
              : `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`;

            const labelY = yTop + sliceHeight / 2 - (isLast ? 4 : 0);
            const labelX = Math.max(xTopRight, xBottomRight) + 16;

            return (
              <g key={item.stage} className="transition-all hover:opacity-95">
                <polygon points={points} fill={color} className="drop-shadow-xs" />
                <text
                  x={labelX}
                  y={labelY}
                  dominantBaseline="middle"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="600"
                >
                  {item.stage}
                </text>
                <text
                  x={labelX}
                  y={labelY + 14}
                  dominantBaseline="middle"
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="500"
                >
                  {item.count.toLocaleString("vi-VN")} ({item.percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Conversion Badge matching Image 2 */}
      <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-start">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Tỷ lệ chuyển đổi: {conversionRate}%
        </span>
      </div>
    </div>
  );
}
