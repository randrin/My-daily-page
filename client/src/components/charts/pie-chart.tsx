"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
  description?: string;
  className?: string;
}

export function PieChart({ data, title, description, className }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const center = size / 2;
  const outerRadius = 80;
  const innerRadius = 50; // Inner radius for donut chart
  const strokeWidth = 2;

  let currentAngle = -90; // Start from top

  const segments = data.map((item, index) => {
    if (item.value === 0) return null;
    
    const percentage = item.value / total;
    const angle = percentage * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Outer arc coordinates
    const x1 = center + outerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + outerRadius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + outerRadius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + outerRadius * Math.sin((endAngle * Math.PI) / 180);
    
    // Inner arc coordinates (for donut)
    const x3 = center + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const y3 = center + innerRadius * Math.sin((endAngle * Math.PI) / 180);
    const x4 = center + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y4 = center + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    
    // Create donut segment path
    const pathData = [
      `M ${x1} ${y1}`, // Move to outer start point
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Outer arc
      `L ${x3} ${y3}`, // Line to inner end point
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Inner arc (reverse direction)
      "Z", // Close path
    ].join(" ");
    
    currentAngle += angle;
    
    return {
      pathData,
      percentage: (percentage * 100).toFixed(1),
      ...item,
    };
  }).filter(Boolean) as Array<PieChartData & { pathData: string; percentage: string }>;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
              {segments.map((segment, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <g>
                      <path
                        d={segment.pathData}
                        fill={segment.color}
                        stroke="var(--background)"
                        strokeWidth={strokeWidth}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                      />
                    </g>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">{segment.label}</div>
                      <div className="text-xs">
                        <div>Value: {segment.value}</div>
                        <div>Percentage: {segment.percentage}%</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
          
          <div className="w-full space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium">{segment.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{segment.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({segment.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
