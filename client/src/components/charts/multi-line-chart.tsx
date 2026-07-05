"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LineDataPoint {
  label: string;
  value: number;
}

interface LineSeries {
  name: string;
  data: LineDataPoint[];
  color: string;
}

interface MultiLineChartProps {
  series: LineSeries[];
  title: string;
  description?: string;
  className?: string;
  timeRange?: "7" | "30";
  onTimeRangeChange?: (range: "7" | "30") => void;
}

export function MultiLineChart({
  series,
  title,
  description,
  className,
  timeRange = "30",
  onTimeRangeChange,
}: MultiLineChartProps) {
  const width = 1200;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Get all data points (assuming all series have the same labels)
  const dataPoints = series[0]?.data || [];
  const maxValue = Math.max(
    ...series.flatMap((s) => s.data.map((d) => d.value)),
    1
  );
  const minValue = 0;

  const getX = (index: number) => {
    if (dataPoints.length === 0) return padding.left;
    return padding.left + (chartWidth / (dataPoints.length - 1 || 1)) * index;
  };

  const getY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalizedValue = (value - minValue) / range;
    return padding.top + chartHeight - normalizedValue * chartHeight;
  };

  const createPath = (data: LineDataPoint[]) => {
    return data
      .map((point, index) => {
        const x = getX(index);
        const y = getY(point.value);
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className={cn("w-full", className)}>
      <div>
        <div className="overflow-x-auto w-full">
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible min-w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = padding.top + chartHeight * (1 - ratio);
              const value = minValue + (maxValue - minValue) * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity={0.5}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--muted-foreground)"
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Draw lines for each series */}
            {series.map((serie, serieIndex) => {
              const pathData = createPath(serie.data);
              
              return (
                <g key={serieIndex}>
                  {/* Area fill */}
                  <path
                    d={
                      pathData +
                      ` L ${getX(dataPoints.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`
                    }
                    fill={serie.color}
                    opacity={0.1}
                  />
                  
                  {/* Line */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={serie.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {serie.data.map((point, index) => {
                    const x = getX(index);
                    const y = getY(point.value);
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <g>
                            <circle
                              cx={x}
                              cy={y}
                              r="4"
                              fill={serie.color}
                              stroke="var(--background)"
                              strokeWidth="2"
                              className="hover:r-6 transition-all cursor-pointer"
                            />
                          </g>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold">{serie.name}</div>
                            <div className="text-xs">
                              <div>Date: {point.label}</div>
                              <div>Value: {point.value}</div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </g>
              );
            })}

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* X-axis labels */}
            {dataPoints.map((point, index) => {
              const x = getX(index);
              // Show every Nth label to avoid crowding
              const showLabel = dataPoints.length <= 15 || index % Math.ceil(dataPoints.length / 15) === 0;
              
              if (!showLabel) return null;
              
              return (
                <text
                  key={index}
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted-foreground)"
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          {series.map((serie, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: serie.color }}
              />
              <span className="text-sm text-muted-foreground">{serie.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
