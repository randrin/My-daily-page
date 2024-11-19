import React from "react";
import BtcGraph from "./BtcGraph";
import { useIntl } from "react-intl";
import {
  StyledBtcCard,
  StyledBtcFooter,
  StyledBtcItem,
  StyledBtcItemTitle,
} from "./index.styled";
import type { BtcChartDataType } from "@crema/types/models/dashboards/Crypto";

type BtcGraphProps = {
  data: BtcChartDataType[];
};

const BtcVolumeCurrency: React.FC<BtcGraphProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <StyledBtcCard heightFull title={messages["dashboard.btcVolumeByCurency"]}>
      <BtcGraph data={data} />
      <StyledBtcFooter>
        {data.map((item) => {
          return (
            <StyledBtcItem key={item.id}>
              <StyledBtcItemTitle style={{ color: item.color }}>
                {item.value}
              </StyledBtcItemTitle>
              <p>{item.name}</p>
            </StyledBtcItem>
          );
        })}
      </StyledBtcFooter>
    </StyledBtcCard>
  );
};

export default BtcVolumeCurrency;
