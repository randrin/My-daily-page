import React, { useState } from "react";
import StatsGraph from "./StatsGraph";
import { useIntl } from "react-intl";
import AppSelect from "@crema/components/AppSelect";
import AppCard from "@crema/components/AppCard";
import type { StatsGraphDataType } from "@crema/types/models/dashboards/Metrics";

type StatsProps = {
  data: StatsGraphDataType;
};

const Stats: React.FC<StatsProps> = ({ data }) => {
  const [graphData, setGraphData] = useState(data.dataOne);

  const handleYearChange = (value: number) => {
    switch (value) {
      case 2017:
        setGraphData(data.dataTwo);
        break;
      case 2018:
        setGraphData(data.dataThree);
        break;
      case 2021:
        setGraphData(data.dataOne);
        break;
      default:
        setGraphData(data.dataOne);
    }
  };

  const handleMonthChange = (value: string) => {
    switch (value) {
      case "June":
        setGraphData(data.dataTwo);
        break;
      case "July":
        setGraphData(data.dataThree);
        break;
      case "August":
        setGraphData(data.dataOne);
        break;
      default:
        setGraphData(data.dataThree);
    }
  };

  const { messages } = useIntl();

  return (
    <AppCard
      heightFull
      title={messages["dashboard.companyProduction"] as string}
      extra={
        <>
          <AppSelect
            menus={[2021, 2018, 2017]}
            defaultValue={2021}
            onChange={handleYearChange}
          />
          <AppSelect
            menus={[
              messages["common.june"],
              messages["common.july"],
              messages["common.august"],
            ]}
            defaultValue={messages["common.june"]}
            onChange={handleMonthChange}
          />
        </>
      }
    >
      <StatsGraph data={graphData} />
    </AppCard>
  );
};

export default Stats;
