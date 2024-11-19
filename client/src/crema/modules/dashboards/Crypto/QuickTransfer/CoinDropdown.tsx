import React from "react";
import CurrencyCell from "./CurrencyCell";
import { StyledSelect } from "./index.styled";
import { CoinList2Type } from "@crema/types/models/dashboards/Crypto";

type Props = {
  handleCoinChange: (value: any) => void;
  coinList: CoinList2Type[];
  selectedCoinId: number;
};

const CoinDropdown = ({
  handleCoinChange,
  coinList,
  selectedCoinId,
}: Props) => {
  return (
    <StyledSelect defaultValue={selectedCoinId} onChange={handleCoinChange}>
      {coinList.map((coin) => {
        return CurrencyCell(coin);
      })}
    </StyledSelect>
  );
};

export default CoinDropdown;
