import React from "react";
import { StyledCoinInfoCol, StyledCoinInfoRow } from "./index.styled";
import type { BalanceCoinsType } from "@crema/types/models/dashboards/Crypto";

type CoinsInfoProps = {
  coins: BalanceCoinsType[];
};

const CoinsInfo: React.FC<CoinsInfoProps> = ({ coins }) => {
  return (
    <StyledCoinInfoRow>
      {coins.map((coin) => {
        return (
          <StyledCoinInfoCol key={coin.id}>
            <h3>{coin.value}</h3>
            <p>{coin.name}</p>
          </StyledCoinInfoCol>
        );
      })}
    </StyledCoinInfoRow>
  );
};

export default CoinsInfo;
