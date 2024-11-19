import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import React from "react";
import { StyledMarketGraph } from "./index.styled";
import type { MarketGraphDataType } from "@crema/types/models/dashboards/Crypto";

type CryptoMarketActivityProps = {
  marketGraphData: MarketGraphDataType[];
};

const MarketGraph: React.FC<CryptoMarketActivityProps> = ({
  marketGraphData,
}) => {
  return (
    <StyledMarketGraph width="100%">
      <BarChart barSize={10} barGap={3} data={marketGraphData}>
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <YAxis hide />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Bar dataKey="low" stackId="a" fill="#49BD65" />
        <Bar dataKey="medium" stackId="a" fill="#0A8FDC" />
        <Bar dataKey="high" stackId="a" fill="#F44D50" />
      </BarChart>
    </StyledMarketGraph>
  );
};

export default MarketGraph;
