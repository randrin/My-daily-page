import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import CurrencyCell from "./CurrencyCell";
import { StyledSelect } from "./index.styled";
import { CoinListType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  coinList: CoinListType[];
  selectedCoinId: number;
  handleCoinChange: (event: any) => void;
};
const CoinDropdown = ({
  handleCoinChange,
  coinList,
  selectedCoinId,
}: Props) => {
  return (
    <StyledSelect
      value={selectedCoinId}
      placeholder={<IntlMessages id="dashboard.crypto.coinName" />}
      onChange={handleCoinChange}
    >
      {coinList.map((coin) => {
        return CurrencyCell(coin);
      })}
    </StyledSelect>
  );
};

export default CoinDropdown;
