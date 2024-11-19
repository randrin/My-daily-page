import React from "react";
import IncomeGraph from "./IncomeGraph";
import WebTrafficGraph from "./WebTrafficGraph";
import RevenueGrowthGraph from "./RevenueGrowthGraph";
import {
  StyledStatsCardGraph,
  StyledStatsCardwithGraph,
  StyledStatsCardwithGraphContent,
  StyledStatsGraphCard,
} from "./index.styled";
import type {
  IncomeLastYearType,
  RevenueGrowthDataType,
  WebsiteTrafficDataType,
} from "@crema/types/models/dashboards/Metrics";

type StatsCardWithGraphProps = {
  data: IncomeLastYearType | WebsiteTrafficDataType | RevenueGrowthDataType;
  text: any;
  bgColor?: string;
  headingColor?: string;
  valueColor: string;
  type: string;
};

const StatsCardWithGraph: React.FC<StatsCardWithGraphProps> = ({
  data,
  text,
  bgColor,
  headingColor,
  valueColor,
  type,
}) => {
  const onGetGraph = () => {
    switch (type) {
      case "incomeGraph":
        return <IncomeGraph data={data.graphData} />;

      case "trafficGraph":
        return <WebTrafficGraph data={data.graphData} />;

      case "revenueGrowth":
        return <RevenueGrowthGraph data={data.graphData} />;

      default:
        return <IncomeGraph data={data.graphData} />;
    }
  };

  return (
    <StyledStatsGraphCard style={{ backgroundColor: bgColor }} heightFull>
      <StyledStatsCardwithGraph>
        <StyledStatsCardwithGraphContent>
          <p style={{ color: headingColor }}>{text}</p>
          <h3 style={{ color: valueColor }}>{data.value}</h3>
        </StyledStatsCardwithGraphContent>
        <StyledStatsCardGraph>{onGetGraph()}</StyledStatsCardGraph>
      </StyledStatsCardwithGraph>
    </StyledStatsGraphCard>
  );
};

export default StatsCardWithGraph;
