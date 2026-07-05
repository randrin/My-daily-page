"use client";

import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AreaDataPoint {
  label: string;
  value: number;
}

interface AreaSeries {
  name: string;
  data: AreaDataPoint[];
  color: string;
}

interface AreaChartProps {
  series: AreaSeries[];
  title?: string;
  description?: string;
  className?: string;
  timeRange?: "7" | "30";
  onTimeRangeChange?: (range: "7" | "30") => void;
}

export function AreaChart({
  series,
  title,
  description,
  className,
  timeRange = "30",
  onTimeRangeChange,
}: AreaChartProps) {
  const [visibleSeries, setVisibleSeries] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredX, setHoveredX] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize visible series after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setVisibleSeries(new Set(series.map((_, index) => index)));
  }, [series]);
  
  const dataPoints = series[0]?.data || [];
  
  const toggleSeries = (index: number) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(index)) {
      newVisible.delete(index);
    } else {
      newVisible.add(index);
    }
    setVisibleSeries(newVisible);
  };

  // Calculate max value for stacked areas (sum of visible series at each point)
  const maxValue = Math.max(
    ...dataPoints.map((_, index) => {
      return series.reduce((sum, serie, serieIndex) => {
        if (visibleSeries.has(serieIndex)) {
          return sum + (serie.data[index]?.value || 0);
        }
        return sum;
      }, 0);
    }),
    1
  );
  const minValue = 0;

  const width = 1200;
  const height = 350;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (dataPoints.length === 0) return padding.left;
    return padding.left + (chartWidth / (dataPoints.length - 1 || 1)) * index;
  };

  const getY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalizedValue = (value - minValue) / range;
    return padding.top + chartHeight - normalizedValue * chartHeight;
  };

  // Create stacked area paths
  const createStackedPaths = () => {
    const paths: Array<{ 
      topPath: string; 
      fullAreaPath: string;
      color: string; 
      name: string;
      accumulatedData: Array<{ label: string; value: number; originalValue: number }>;
      serieIndex: number;
    }> = [];
    
    series.forEach((serie, serieIndex) => {
      if (!visibleSeries.has(serieIndex)) {
        return;
      }

      // Calculate accumulated values (stacked from bottom)
      const accumulatedData = serie.data.map((point, index) => {
        let accumulated = point.value;
        // Add all previous visible series values at this index
        for (let i = 0; i < serieIndex; i++) {
          if (visibleSeries.has(i)) {
            accumulated += series[i].data[index]?.value || 0;
          }
        }
        return { 
          label: point.label, 
          value: accumulated,
          originalValue: point.value
        };
      });
      
      // Create top path (the line)
      const topPoints: string[] = [];
      accumulatedData.forEach((point, index) => {
        const x = getX(index);
        const y = getY(point.value);
        if (index === 0) {
          topPoints.push(`M ${x} ${y}`);
        } else {
          topPoints.push(`L ${x} ${y}`);
        }
      });
      const topPath = topPoints.join(" ");
      
      // Create bottom path (previous series accumulated or baseline) - reversed
      const bottomPoints: string[] = [];
      for (let idx = accumulatedData.length - 1; idx >= 0; idx--) {
        const x = getX(idx);
        let bottomValue = 0;
        // Sum all previous visible series at this index
        for (let i = 0; i < serieIndex; i++) {
          if (visibleSeries.has(i)) {
            bottomValue += series[i].data[idx]?.value || 0;
          }
        }
        const y = getY(bottomValue);
        bottomPoints.push(`L ${x} ${y}`);
      }
      const bottomPath = bottomPoints.join(" ");
      
      // Create full area path
      const fullAreaPath = `${topPath} ${bottomPath} Z`;
      
      paths.push({
        topPath,
        fullAreaPath,
        color: serie.color,
        name: serie.name,
        accumulatedData,
        serieIndex
      });
    });
    
    return paths;
  };

  const stackedPaths = createStackedPaths();

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * width;
    
    // Find closest data point
    let closestIndex = 0;
    let minDistance = Infinity;
    dataPoints.forEach((_, index) => {
      const pointX = getX(index);
      const distance = Math.abs(svgX - pointX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    setHoveredIndex(closestIndex);
    setHoveredX(getX(closestIndex));
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setHoveredX(null);
  };

  const timeRangeLabel = timeRange === "7" ? "Last 7 days" : "Last 30 days";

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted || series.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center h-[350px]">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div className="relative">
        <div className="overflow-x-auto w-full">
          <svg
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible min-w-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
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
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.3}
                  />
                  <text
                    x={padding.left - 15}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="hsl(var(--muted-foreground))"
                    className="font-medium"
                  >
                    {Math.round(value)}
                  </text>
                </g>
              );
            })}

            {/* Render stacked areas (from bottom to top) */}
            {stackedPaths.map((area) => {
              const serie = series[area.serieIndex];
              const isVisible = visibleSeries.has(area.serieIndex);
              
              return (
                <g key={area.serieIndex} opacity={isVisible ? 1 : 0.2}>
                  {/* Area fill */}
                  <path
                    d={area.fullAreaPath}
                    fill={area.color}
                    opacity={0.7}
                    className="transition-all duration-300"
                    style={{
                      pointerEvents: "all",
                      cursor: "pointer"
                    }}
                  />
                  
                  {/* Line on top of area */}
                  <path
                    d={area.topPath}
                    fill="none"
                    stroke={area.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />

                  {/* Data points */}
                  {area.accumulatedData.map((point, pointIndex) => {
                    const x = getX(pointIndex);
                    const y = getY(point.value);
                    const isPointHovered = hoveredIndex === pointIndex;
                    
                    return (
                      <g key={pointIndex}>
                        {/* Invisible larger circle for easier interaction */}
                        <circle
                          cx={x}
                          cy={y}
                          r="10"
                          fill="transparent"
                          className="cursor-pointer"
                        />
                        {/* Visible data point */}
                        {isPointHovered && (
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill={area.color}
                            stroke="hsl(var(--background))"
                            strokeWidth="3"
                            className="transition-all duration-200"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Vertical line on hover */}
            {hoveredX !== null && (
              <line
                x1={hoveredX}
                y1={padding.top}
                x2={hoveredX}
                y2={padding.top + chartHeight}
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity={0.4}
                className="pointer-events-none"
              />
            )}

            {/* Hover highlights showing all values at hovered index */}
            {hoveredIndex !== null && hoveredX !== null && (
              <g>
                {stackedPaths.map((area) => {
                  const point = area.accumulatedData[hoveredIndex];
                  if (!point) return null;
                  
                  const x = hoveredX;
                  const y = getY(point.value);
                  
                  return (
                    <g key={area.serieIndex}>
                      {/* Highlight circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r="6"
                        fill={area.color}
                        stroke="hsl(var(--background))"
                        strokeWidth="3"
                        className="pointer-events-none"
                        opacity={0.9}
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Y-axis line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.5}
            />

            {/* X-axis line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.5}
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
                  y={padding.top + chartHeight + 25}
                  textAnchor="middle"
                  fontSize="11"
                  fill="hsl(var(--muted-foreground))"
                  className="font-medium"
                >
                  {point.label}
                </text>
              );
            })}

            {/* Hover tooltip */}
            {hoveredIndex !== null && (
              <g>
                <rect
                  x={getX(hoveredIndex) - 60}
                  y={padding.top - 35}
                  width="120"
                  height="25"
                  fill="hsl(var(--popover))"
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                  rx="4"
                  className="pointer-events-none"
                />
                <text
                  x={getX(hoveredIndex)}
                  y={padding.top - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill="hsl(var(--popover-foreground))"
                  className="font-semibold pointer-events-none"
                >
                  {dataPoints[hoveredIndex]?.label}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Time Range Selector */}
        {onTimeRangeChange && (
          <div className="absolute top-2 right-2">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange(e.target.value as "7" | "30")}
              className="px-3 py-1.5 text-sm border rounded-md bg-background text-foreground cursor-pointer hover:bg-accent transition-colors"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        )}
      </div>

      {/* Interactive Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
        {series.map((serie, index) => {
          const isVisible = visibleSeries.has(index);
          return (
            <button
              key={index}
              onClick={() => toggleSeries(index)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                "hover:bg-accent hover:scale-105",
                !isVisible && "opacity-40"
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-sm transition-all",
                  !isVisible && "opacity-50"
                )}
                style={{ backgroundColor: serie.color }}
              />
              <span className={cn(
                "text-sm font-medium transition-all",
                isVisible ? "text-foreground" : "text-muted-foreground line-through"
              )}>
                {serie.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
