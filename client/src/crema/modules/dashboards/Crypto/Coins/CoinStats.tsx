import React from "react";
import { green, red } from "@ant-design/colors";
import {
  StyledCoinStatsAvatar,
  StyledCoinStatsCard,
  StyledCoinStatsContent,
  StyledCoinStatsContentAvatar,
  StyledCoinStatsRow,
} from "./index.styled";

import type { CoinDataType } from "@crema/types/models/dashboards/Crypto";

type CoinStatsProps = {
  icon: string;
  bgColor: string;
  data: CoinDataType;
  heading: any;
};

const CoinStats: React.FC<CoinStatsProps> = ({
  icon,
  bgColor,
  data,
  heading,
}) => {
  return (
    <StyledCoinStatsCard className="card-hover">
      <StyledCoinStatsRow>
        <StyledCoinStatsAvatar
          src={icon}
          style={{ backgroundColor: bgColor }}
        />

        <StyledCoinStatsContent>
          <p>{heading}</p>

          <StyledCoinStatsContentAvatar>
            <h3>${data.price}</h3>
            <span style={{ color: data.increment > 0.0 ? green[5] : red[5] }}>
              {data.increment}%
            </span>
          </StyledCoinStatsContentAvatar>
        </StyledCoinStatsContent>
      </StyledCoinStatsRow>
    </StyledCoinStatsCard>
  );
};

export default CoinStats;
