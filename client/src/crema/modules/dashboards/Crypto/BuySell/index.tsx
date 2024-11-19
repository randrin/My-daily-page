import React from "react";
import TabForm from "./TabForm";
import { StyledBuyCellCard, StyledTabs } from "./index.styled";
import { BuySellType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  buySell: BuySellType;
};

const BuySell = ({ buySell }: Props) => {
  const items = [
    {
      label: "Buy",
      key: "1",
      children: <TabForm coinList={buySell.coinList} type="buy" />,
    }, // remember to pass the key prop
    {
      label: "Sell",
      key: "2",
      children: <TabForm coinList={buySell.coinList} type="sell" />,
    },
  ];
  return (
    <StyledBuyCellCard style={{ padding: 0 }} heightFull>
      <StyledTabs centered defaultActiveKey="1" items={items} />
    </StyledBuyCellCard>
  );
};

export default BuySell;
