import React from 'react';
import {StyledMetricsStatsAvatar, StyledMetricsStatsCard} from './index.styled';

type StatsCardProps = {
  icon: string;
  bgColor: string;
  text: any;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({icon, bgColor, text, value}) => {
  return (
    <StyledMetricsStatsCard heightFull>
      <StyledMetricsStatsAvatar
        src={<img src={icon} alt='' />}
        style={{backgroundColor: bgColor}}
      />
      <p>{text}</p>
      <h3>{value}</h3>
    </StyledMetricsStatsCard>
  );
};

export default StatsCard;
