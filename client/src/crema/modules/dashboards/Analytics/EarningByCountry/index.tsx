import React from "react";
import AppCard from "@crema/components/AppCard";
import MapChart from "../../Widgets/CountryMap/MapChart";
import AppSelect from "@crema/components/AppSelect";
import { useIntl } from "react-intl";
import {
  StyledCountryMapChart,
  StyledEarningCountryFooter,
  StyledEarningCountryFooterItem,
} from "./index.styled";

import type { EarningDataType } from "@crema/types/models/dashboards/Analytics";

type Props = {
  earningData: EarningDataType[];
};

const EarningByCountry: React.FC<Props> = ({ earningData }) => {
  const handleSelectionType = (data: any) => {
    console.log("data: ", data);
  };

  const { messages } = useIntl();
  return (
    <AppCard
      heightFull
      title={messages["dashboard.analytics.earningByCountries"] as string}
      extra={
        <AppSelect
          menus={[
            messages["dashboard.thisWeek"],
            messages["dashboard.lastWeeks"],
            messages["dashboard.lastMonth"],
          ]}
          defaultValue={messages["dashboard.thisWeek"]}
          onChange={handleSelectionType}
        />
      }
    >
      <StyledCountryMapChart>
        <MapChart />
      </StyledCountryMapChart>

      <StyledEarningCountryFooter>
        {earningData.map((data) => (
          <StyledEarningCountryFooterItem key={data.id}>
            <h3>${data.amount}</h3>
            <div className="ant-row ant-row-middle">
              <span className="dot" style={{ backgroundColor: data.color }} />
              <p>{data.country}</p>
            </div>
          </StyledEarningCountryFooterItem>
        ))}
      </StyledEarningCountryFooter>
    </AppCard>
  );
};

export default EarningByCountry;
