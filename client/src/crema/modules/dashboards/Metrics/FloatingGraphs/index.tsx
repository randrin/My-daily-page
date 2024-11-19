import React from "react";
import GraphFile from "./GraphFile";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import {
  StyledFloatingCardTitle,
  StyledFloatingGraph,
  StyledFloatingGraphArrow,
  StyledFloatingGraphCard,
  StyledFloatingGraphCardTitleGrowth,
  StyledFloatingGraphCardTitleValue,
  StyledFloatingGraphGrowthValue,
} from "./index.styled";
import type { MetricsFloatingChildDataType } from "@crema/types/models/dashboards/Metrics";

type FloatingGraphsProps = {
  data: MetricsFloatingChildDataType;
  title: any;
};

const FloatingGraphs: React.FC<FloatingGraphsProps> = ({ data, title }) => {
  return (
    <StyledFloatingGraphCard heightFull>
      <p>{title}</p>
      <StyledFloatingCardTitle>
        <StyledFloatingGraphCardTitleValue>
          {data.value}
        </StyledFloatingGraphCardTitleValue>
        {data.change > 0 ? (
          <StyledFloatingGraphCardTitleGrowth>
            <StyledFloatingGraphArrow>
              <ArrowUpOutlined />
            </StyledFloatingGraphArrow>
            <StyledFloatingGraphGrowthValue>
              {data.change}
            </StyledFloatingGraphGrowthValue>
          </StyledFloatingGraphCardTitleGrowth>
        ) : (
          <StyledFloatingGraphCardTitleGrowth className="down">
            <StyledFloatingGraphArrow>
              <ArrowDownOutlined />
            </StyledFloatingGraphArrow>
            <StyledFloatingGraphGrowthValue>
              {data.change}
            </StyledFloatingGraphGrowthValue>
          </StyledFloatingGraphCardTitleGrowth>
        )}
      </StyledFloatingCardTitle>
      <StyledFloatingGraph>
        <GraphFile
          data={data.graphData}
          strokeColor={data.strokeColor}
          areaColor={data.areaColor}
        />
      </StyledFloatingGraph>
    </StyledFloatingGraphCard>
  );
};

export default FloatingGraphs;
