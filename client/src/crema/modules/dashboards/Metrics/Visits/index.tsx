import React, { useState } from "react";
import VisitsGraph from "./VisitsGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import AppSelect from "@crema/components/AppSelect";
import { StyledVisitsCard, StyledVisitsFooter } from "./index.styled";
import { VisitsDataType } from "@crema/types/models/dashboards/Metrics";

type VisitsProps = {
  data: VisitsDataType;
};

const Visits: React.FC<VisitsProps> = ({ data }) => {
  const [graphData, setGraphData] = useState(data.graphData.dataOne);

  const handleWeekChange = (value: string) => {
    switch (value) {
      case "This Week":
        setGraphData(data.graphData.dataTwo);
        break;
      case "Last Weeks":
        setGraphData(data.graphData.dataOne);
        break;
      case "Last Month":
        setGraphData(data.graphData.dataThree);
        break;
      default:
        setGraphData(data.graphData.dataOne);
    }
  };

  const { messages } = useIntl();

  return (
    <StyledVisitsCard
      title={messages["dashboard.visits"]}
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
      heightFull
      actions={[
        <StyledVisitsFooter key={1}>
          <p>
            <IntlMessages id="common.new" />
            <span>{data.new}</span>
          </p>
          <p>
            <IntlMessages id="common.returning" />
            <span>{data.returning}</span>
          </p>
        </StyledVisitsFooter>,
      ]}
    >
      <VisitsGraph data={graphData} />
    </StyledVisitsCard>
  );
};

export default Visits;
