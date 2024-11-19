import React from 'react';
import {StyledStatsSecondAvatar, StyledStatsSecondCard} from './index.styled';

type StatsCardSecondProps = {
  icon: string;
  bgColor: string;
  text: any;
  value: string;
}

const StatsCardSecond: React.FC<StatsCardSecondProps> = ({
  icon,
  bgColor,
  text,
  value,
}) => {
  return (
    <StyledStatsSecondCard heightFull>
      <StyledStatsSecondAvatar
        src={<img src={icon} alt='' />}
        style={{backgroundColor: bgColor}}
      />
      <h3>{value}</h3>
      <p>{text}</p>
    </StyledStatsSecondCard>
  );
};

export default StatsCardSecond;
