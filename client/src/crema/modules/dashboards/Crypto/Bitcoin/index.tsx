import React, { useCallback, useEffect, useState } from "react";
import BitcoinGraph from "./BitcoinGraph";
import { useIntl } from "react-intl";
import AppCard from "@crema/components/AppCard";
import { Tabs } from "antd";
import {
  StyledBitcoinHeader,
  StyledBitcoinSelectBox,
  StyledBitcoinSelectOption,
  StyledBitcoinTabs,
  StyledBitcoinTitle,
} from "./index.styled";
import type { CoinGraphDataType } from "@crema/types/models/dashboards/Crypto";

type BitcoinProps = {
  coinGraphData: CoinGraphDataType;
};

const Bitcoin: React.FC<BitcoinProps> = ({ coinGraphData }) => {
  const { TabPane } = Tabs;

  const onGetCoinData = useCallback(
    (coin: string) => {
      switch (coin) {
        case "Bitcoin": {
          return coinGraphData.bitcoin;
        }
        case "Litecoin": {
          return coinGraphData.litecoin;
        }
        case "Ripple": {
          return coinGraphData.ripple;
        }
        default:
          return coinGraphData.bitcoin;
      }
    },
    [coinGraphData]
  );

  const [graphType, setGraphType] = useState(0);
  const [coinType, setCoinType] = useState("Bitcoin");
  const [coinData, setCoinData] = useState(onGetCoinData(coinType));

  useEffect(() => {
    setCoinData(onGetCoinData(coinType));
  }, [coinType, onGetCoinData]);

  const handleChange = (newValue: any) => {
    setGraphType(newValue);
  };

  const handleSelectValue = (value: any) => {
    setCoinType(value as string);
  };

  const { messages } = useIntl();

  return (
    <AppCard>
      <StyledBitcoinHeader>
        <StyledBitcoinSelectBox value={coinType} onChange={handleSelectValue}>
          <StyledBitcoinSelectOption value="Bitcoin">
            {messages["dashboard.bitcoin"]}
          </StyledBitcoinSelectOption>
          <StyledBitcoinSelectOption value="Litecoin">
            {messages["dashboard.litecoin"]}
          </StyledBitcoinSelectOption>
          <StyledBitcoinSelectOption value="Ripple">
            {messages["dashboard.ripple"]}
          </StyledBitcoinSelectOption>
        </StyledBitcoinSelectBox>
        <StyledBitcoinTitle>
          <h3>$7280.45</h3>
          <span>0.8%</span>
        </StyledBitcoinTitle>
      </StyledBitcoinHeader>

      <StyledBitcoinTabs defaultActiveKey="1" onChange={handleChange}>
        <TabPane tab="Yearly" key="1">
          <BitcoinGraph data={coinData.yearlyData} value={graphType} />
        </TabPane>
        <TabPane tab="Monthly" key="2">
          <BitcoinGraph data={coinData.monthlyData} value={graphType} />
        </TabPane>
        <TabPane tab="Weekly" key="3">
          <BitcoinGraph data={coinData.weeklyData} value={graphType} />
        </TabPane>
        <TabPane tab="Today" key="4">
          <BitcoinGraph data={coinData.dailyData} value={graphType} />
        </TabPane>
      </StyledBitcoinTabs>
    </AppCard>
  );
};

export default Bitcoin;
