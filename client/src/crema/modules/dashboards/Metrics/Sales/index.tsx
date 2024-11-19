import React from "react";
import SalesGraph from "./SalesGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import { StyledMetricSalesCard, StyledMetricSalesGraph } from "./index.styled";
import type { SalesDataType } from "@crema/types/models/dashboards/Metrics";

type SalesProps = {
  data: SalesDataType;
};

const Sales: React.FC<SalesProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <StyledMetricSalesCard title={messages["dashboard.salesToday"]} heightFull>
      <h2>{data.salesToday}</h2>
      <p>
        {data.salesYesterday} <IntlMessages id="common.yesterday" />
      </p>
      <StyledMetricSalesGraph>
        <SalesGraph data={data.salesGraphData} />
      </StyledMetricSalesGraph>
    </StyledMetricSalesCard>
  );
};

export default Sales;
