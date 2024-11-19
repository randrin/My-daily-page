import React, { useState } from "react";
import OrdersGraph from "./OrdersGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppSelect from "@crema/components/AppSelect";
import { useIntl } from "react-intl";
import { StyledOrdersCard, StyledOrdersFooter } from "./index.styled";
import type { OrdersDataType } from "@crema/types/models/dashboards/Metrics";

type OrdersProps = {
  data: OrdersDataType;
};

const Orders: React.FC<OrdersProps> = ({ data }) => {
  const [graphData, setGraphData] = useState(data.graphData.dataTwo);
  const { messages } = useIntl();

  const handleWeekChange = (value: string) => {
    switch (value) {
      case messages["dashboard.thisWeek"]:
        setGraphData(data.graphData.dataOne);
        break;
      case messages["dashboard.lastWeeks"]:
        setGraphData(data.graphData.dataTwo);
        break;
      case messages["dashboard.lastMonth"]:
        setGraphData(data.graphData.dataThree);
        break;
      default:
        setGraphData(data.graphData.dataOne);
    }
  };

  return (
    <StyledOrdersCard
      heightFull
      title={messages["common.orders"]}
      extra={
        <AppSelect
          menus={[
            messages["dashboard.thisWeek"],
            messages["dashboard.lastWeeks"],
            messages["dashboard.lastMonth"],
          ]}
          defaultValue={messages["dashboard.thisWeek"]}
          onChange={handleWeekChange}
        />
      }
      actions={[
        <StyledOrdersFooter key={1}>
          <p>
            <IntlMessages id="common.revenue" />
            <span>{data.revenue}</span>
          </p>
          <p>
            <IntlMessages id="common.orders" />
            <span>{data.orders}</span>
          </p>
        </StyledOrdersFooter>,
      ]}
    >
      <OrdersGraph data={graphData} />
    </StyledOrdersCard>
  );
};

export default Orders;
