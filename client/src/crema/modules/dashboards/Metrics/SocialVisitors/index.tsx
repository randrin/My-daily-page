import React from "react";
import SocialVisitorsGraph from "./SocialVisitorsGraph";
import Categories from "./Categories";
import { useIntl } from "react-intl";
import { StyledSocialVisitorCard } from "./index.styled";
import { SocialVisitorsDataType } from "@crema/types/models/dashboards/Metrics";

type SocialVisitorsProps = {
  data: SocialVisitorsDataType[];
};

const SocialVisitors: React.FC<SocialVisitorsProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <StyledSocialVisitorCard
      heightFull
      title={messages["dashboard.socialVisitors"]}
      extra={<a>{messages["common.viewAll"] as string}</a>}
    >
      <SocialVisitorsGraph data={data} />

      <Categories data={data} />
    </StyledSocialVisitorCard>
  );
};

export default SocialVisitors;
