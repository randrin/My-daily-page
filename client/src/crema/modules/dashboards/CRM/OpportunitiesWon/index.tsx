import React from "react";
import OpportunitiesWonGraph from "./OpportunitiesWonGraph";
import { useIntl } from "react-intl";
import AppSelect from "@crema/components/AppSelect";
import { StyledAppCard } from "./index.styled";
import { OpportunitiesWonGraphDataType } from "@crema/types/models/dashboards/CRM";

type Props = {
  data: OpportunitiesWonGraphDataType[];
};

const OpportunitiesWon = ({ data }: Props) => {
  const { messages } = useIntl();
  const handleSelectionType = (data: string) => {
    console.log("data: ", data);
  };
  return (
    <StyledAppCard
      title={messages["dashboard.crm.opportunitiesWon"]}
      action={
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
      <OpportunitiesWonGraph data={data} />
    </StyledAppCard>
  );
};

export default OpportunitiesWon;
