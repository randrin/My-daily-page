import React from 'react';
import {Line, LineChart} from 'recharts';
import {
  StyledMetricTitleLineGraph,
  StyledMetricTitleLineGraphRoot,
} from './index.styled';

type LineGraphProps = {
  data: {number: string; value: number}[];
  graphColor: string;
}

const LineGraph: React.FC<LineGraphProps> = ({data, graphColor}) => {
  return (
    <StyledMetricTitleLineGraph>
      <StyledMetricTitleLineGraphRoot width={300} height={40} data={data}>
        <Line
          type='monotone'
          dataKey='value'
          stroke={graphColor}
          strokeWidth={4}
          dot={false}
        />
      </StyledMetricTitleLineGraphRoot>

      <LineChart width={300} height={40} data={data}>
        <Line
          type='monotone'
          dataKey='value'
          stroke={graphColor}
          strokeWidth={4}
          dot={false}
          strokeDasharray='5 5'
        />
      </LineChart>
    </StyledMetricTitleLineGraph>
  );
};

export default LineGraph;
