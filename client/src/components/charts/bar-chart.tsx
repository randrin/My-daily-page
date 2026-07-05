"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BarDataPoint {
  label: string;
  value: number;
}

interface BarSeries {
  name: string;
  data: BarDataPoint[];
  color: string;
}

interface BarChartProps {
  series: BarSeries[];
  title: string;
  description?: string;
  className?: string;
  timeRange?: "7" | "30";
  onTimeRangeChange?: (range: "7" | "30") => void;
}

export function BarChart({
  series,
  title,
  description,
  className,
  timeRange = "30",
  onTimeRangeChange,
}: BarChartProps) {
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
    const barWidth = chartWidth / dataPoints.length;
    return padding.left + barWidth * index + barWidth / 2;
  };

  const getBarWidth = () => {
    if (dataPoints.length === 0) return 0;
    const barGroupWidth = chartWidth / dataPoints.length;
    return (barGroupWidth * 0.8) / series.length;
  };

  const getY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalizedValue = (value - minValue) / range;
    return padding.top + chartHeight - normalizedValue * chartHeight;
  };

  const getBarHeight = (value: number) => {
    if (value === 0) return 0;
    const range = maxValue - minValue || 1;
    const normalizedValue = (value - minValue) / range;
    return normalizedValue * chartHeight;
  };

  const barWidth = getBarWidth();
  const barGroupWidth = dataPoints.length > 0 ? chartWidth / dataPoints.length : 0;
  const barSpacing = (barGroupWidth - barWidth * series.length) / (series.length + 1);

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

            {/* Draw bars for each series */}
            {dataPoints.map((point, pointIndex) => {
              const baseX = getX(pointIndex) - (barGroupWidth / 2) + barSpacing;
              
              return series.map((serie, serieIndex) => {
                const barValue = serie.data[pointIndex]?.value || 0;
                const barHeight = getBarHeight(barValue);
                const barY = getY(barValue);
                const barX = baseX + (barWidth + barSpacing) * serieIndex;
                
                return (
                  <Tooltip key={`${pointIndex}-${serieIndex}`}>
                    <TooltipTrigger asChild>
                      <g>
                        <rect
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={serie.color}
                          opacity={0.8}
                          className="hover:opacity-100 transition-opacity cursor-pointer"
                        />
                      </g>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold">{serie.name}</div>
                        <div className="text-xs">
                          <div>Date: {point.label}</div>
                          <div>Value: {barValue}</div>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              });
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
                className="h-3 w-3 rounded-sm"
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
