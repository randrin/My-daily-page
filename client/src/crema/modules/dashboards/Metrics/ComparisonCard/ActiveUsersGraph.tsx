import React from 'react';
import {Line, LineChart, ResponsiveContainer} from 'recharts';
type ActiveUsersGraphProps = {
  data: any[];
}

const ActiveUsersGraph: React.FC<ActiveUsersGraphProps> = ({data}) => {
  return (
    <ResponsiveContainer height={200} width='100%'>
      <LineChart data={data}>
        <Line
          type='monotone'
          dataKey='activeUsers'
          stroke='#4299E1'
          strokeWidth={4}
          dot={{r: 0}}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ActiveUsersGraph;
