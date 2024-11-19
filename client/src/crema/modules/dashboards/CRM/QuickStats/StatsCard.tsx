import React from 'react';
import {
  StyledStatsAvatar,
  StyledStatsCard,
  StyledStatsContent,
  StyledStatsRow,
} from './index.styled';

type StatsCardProps = {
  icon: string;
  bgColor?: string;
  heading: any;
  data: {
    count: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({icon, data, heading}) => {
  return (
    <StyledStatsCard className='card-hover'>
      <StyledStatsRow>
        <StyledStatsAvatar>
          <img src={icon} alt='icon' />
        </StyledStatsAvatar>
        <StyledStatsContent>
          <h3>{data.count}</h3>
          <p>{heading}</p>
        </StyledStatsContent>
      </StyledStatsRow>
    </StyledStatsCard>
  );
};

export default StatsCard;
