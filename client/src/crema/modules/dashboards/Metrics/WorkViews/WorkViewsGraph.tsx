import React from 'react';
import {Line, LineChart, ResponsiveContainer} from 'recharts';
import {StyledWorkViewsGraph} from './index.styled';

type WorkViewsGraphPorps = {
  data: {name: string; value: number}[];
}

const WorkViewsGraph: React.FC<WorkViewsGraphPorps> = ({data}) => {
  return (
    <StyledWorkViewsGraph>
      <ResponsiveContainer height={100} width='100%'>
        <LineChart data={data}>
          <Line
            type='monotone'
            dataKey='value'
            stroke='#E2E8F0'
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </StyledWorkViewsGraph>
  );
};

export default WorkViewsGraph;
