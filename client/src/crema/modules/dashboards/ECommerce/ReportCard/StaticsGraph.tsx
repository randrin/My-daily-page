import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

type StaticsGraphProps = {
  id: number;
  strokeColor: string;
  graphData: {
    month: string;
    number: number;
  }[];
};

const StaticsGraph: React.FC<StaticsGraphProps> = ({
  id,
  graphData,
  strokeColor,
}) => {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart
        data={graphData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={'colorPv' + id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
            <stop offset="95%" stopColor={strokeColor} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <Tooltip
          labelStyle={{ color: 'black' }}
          contentStyle={{
            borderRadius: 12,
            borderColor: '#31354188',
            background: '#FFFFFFCA',
          }}
        />
        <Area
          type="monotone"
          dataKey="number"
          stroke={strokeColor}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${`colorPv` + id})`}
        />
        <XAxis dataKey="month" hide />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default StaticsGraph;
