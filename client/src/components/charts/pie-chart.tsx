"use client";

import { Localized } from "@/i18n/provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { firstLetterUppercase } from "@/utils";

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

/** SVG cannot draw a 360° arc (start === end), so a full ring is two 180° slices. */
export function donutSegmentPath({
  center,
  outerRadius,
  innerRadius,
  startAngle,
  angle,
}: {
  center: number;
  outerRadius: number;
  innerRadius: number;
  startAngle: number;
  angle: number;
}): string {
  if (angle <= 0) return "";
  if (angle >= 359.999) {
    return [
      donutSegmentPath({
        center,
        outerRadius,
        innerRadius,
        startAngle,
        angle: 180,
      }),
      donutSegmentPath({
        center,
        outerRadius,
        innerRadius,
        startAngle: startAngle + 180,
        angle: 180,
      }),
    ].join(" ");
  }

  const largeArcFlag = angle > 180 ? 1 : 0;
  const endAngle = startAngle + angle;
  const toXY = (radius: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const outerStart = toXY(outerRadius, startAngle);
  const outerEnd = toXY(outerRadius, endAngle);
  const innerEnd = toXY(innerRadius, endAngle);
  const innerStart = toXY(innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function PieChart({
  data,
  title,
  description,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const size = 200;
  const center = size / 2;
  const outerRadius = 80;
  const innerRadius = 50; // Inner radius for donut chart
  const strokeWidth = 2;

  let currentAngle = -90; // Start from top

  const segments = data
    .map((item) => {
      if (item.value === 0) return null;

      const percentage = item.value / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      return {
        pathData: donutSegmentPath({
          center,
          outerRadius,
          innerRadius,
          startAngle,
          angle,
        }),
        percentage: (percentage * 100).toFixed(1),
        ...item,
      };
    })
    .filter(Boolean) as Array<
    PieChartData & { pathData: string; percentage: string }
  >;

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
                        stroke={
                          segments.length > 1 ? "var(--background)" : "none"
                        }
                        strokeWidth={segments.length > 1 ? strokeWidth : 0}
                        className="transition-opacity hover:opacity-80 cursor-pointer"
                      />
                    </g>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">
                        {firstLetterUppercase(segment.label)}
                      </div>
                      <div className="text-xs">
                        <div>
                          <Localized>{"messages.value"}</Localized>
                          {segment.value}
                        </div>
                        <div>
                          <Localized>{"messages.percentage"}</Localized>
                          {segment.percentage}%
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">
                  <Localized>{"messages.total"}</Localized>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium">
                    {firstLetterUppercase(segment.label)}
                  </span>
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
