import React, { useEffect, useState } from "react";
import { Button } from "antd";
import CoinDropdown from "./CoinDropdown";
import CurrencyField from "./CurrencyField";
import { StyledTabWrapper } from "./index.styled";
import { CoinListType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  coinList: CoinListType[];
  type?: string;
};
const TabForm = (props: Props) => {
  const { coinList, type } = props;

  const [selectedCoinId, setSelectedCoinID] = React.useState(coinList[0].id);
  const [usdValue, setUsdValue] = useState(0);
  const [coinValue, setCoinValue] = useState(0);

  useEffect(() => {
    setUsdValue(0.258 * selectedCoin().usdPrice);
    setCoinValue(0.258);
  }, [selectedCoinId]);

  const selectedCoin = () => {
    return coinList.find((coin) => coin.id === selectedCoinId) || coinList[0];
  };
  const handleCoinChange = (value: any) => {
    setSelectedCoinID(value);
  };

  const coin = selectedCoin();

  return (
    <StyledTabWrapper>
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <CoinDropdown
          coinList={coinList}
          selectedCoinId={selectedCoinId}
          handleCoinChange={handleCoinChange}
        />
      </div>
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <CurrencyField
          shortName="USD"
          value={usdValue}
          coinColor="#16C784"
          onChange={(value) => {
            setUsdValue(value);
            setCoinValue(value / (coin ? coin.usdPrice : 0));
          }}
        />
      </div>
      <div
        style={{
          marginBottom: 20,
        }}
      >
        <CurrencyField
          value={coinValue}
          hideUSD
          shortName={coin?.shortName || ""}
          onChange={(value) => {
            setCoinValue(value);
            setUsdValue(value * coin.usdPrice);
          }}
          coinColor={coin.coinColor}
        />
      </div>
      <Button
        style={{
          minHeight: 46,
          width: "100%",
        }}
        type="primary"
      >
        {type === "buy" ? "Buy" : "Sell"} {coin.shortName}
      </Button>
    </StyledTabWrapper>
  );
};

export default TabForm;
