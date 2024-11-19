import React from "react";
import LineGraph from "./LineGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledMetricTitleLineGraphAction,
  StyledMetricTitleLineGraphCard,
  StyledMetricTitleLineGraphView,
} from "./index.styled";
import type { MetricsLineGraphDataType } from "@crema/types/models/dashboards/Metrics";

type MetricTitleLineGraphCardProps = {
  title: any;
  titleColor: string;
  valueColor: string;
  differenceColor: string;
  bgColor: string;
  data: MetricsLineGraphDataType;
  graphColor: string;
};

const MetricTitleLineGraphCard: React.FC<MetricTitleLineGraphCardProps> = ({
  title,
  titleColor,
  valueColor,
  differenceColor,
  bgColor,
  data,
  graphColor,
}) => {
  return (
    <StyledMetricTitleLineGraphCard style={{ backgroundColor: bgColor }}>
      <h3 style={{ color: titleColor }}>{title}</h3>
      <StyledMetricTitleLineGraphView>
        <h2 style={{ color: valueColor }}>{data.value}</h2>

        <LineGraph data={data.graphData} graphColor={graphColor} />
      </StyledMetricTitleLineGraphView>
      <StyledMetricTitleLineGraphAction style={{ color: differenceColor }}>
        <span>{data.difference}</span>
        <span>
          <IntlMessages id="dashboard.thisMonth" />
        </span>
        <span>{data.differencePercent}</span>
      </StyledMetricTitleLineGraphAction>
    </StyledMetricTitleLineGraphCard>
  );
};

export default MetricTitleLineGraphCard;
