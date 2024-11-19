import React from "react";
import { Select, Avatar } from "antd";
import { StyledFlex, StyledText } from "./index.styled";
import type { CoinList2Type } from "@crema/types/models/dashboards/Crypto";

const CurrencyCell = (coin: CoinList2Type) => {
  return (
    <Select.Option
      key={coin.id}
      value={coin.id}
      style={{
        cursor: "pointer",
      }}
    >
      <StyledFlex>
        {coin.icon ? (
          <Avatar
            style={{
              marginRight: 5,
              height: 20,
              width: 20,
            }}
            src={coin.icon}
          />
        ) : (
          <Avatar
            style={{
              marginRight: 5,
              height: 20,
              width: 20,
            }}
          >
            {coin?.name?.toUpperCase()}
          </Avatar>
        )}
        <span>{coin.value}</span>
        <StyledText>{coin.shortName}</StyledText>
      </StyledFlex>
    </Select.Option>
  );
};

export default CurrencyCell;
