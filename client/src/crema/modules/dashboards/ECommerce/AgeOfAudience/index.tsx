import React from "react";
import AudienceChart from "./AudienceChart";
import { useIntl } from "react-intl";
import AudienceCell from "./AudienceCell";
import AppCard from "@crema/components/AppCard";
import AppList from "@crema/components/AppList";
import { StyledBox, StyledFlexBox } from "./index.styled";
import { AgeOfAudienceType } from "@crema/types/models/dashboards/Ecommerce";

type Props = {
  audienceData: AgeOfAudienceType[];
};

const AgeOfAudience = ({ audienceData }: Props) => {
  const { messages } = useIntl();

  return (
    <AppCard title={messages["dashboard.eCommerce.ageAudience"] as string}>
      <StyledFlexBox>
        <StyledBox>
          <AudienceChart audienceData={audienceData} />
        </StyledBox>

        <AppList
          data={audienceData}
          renderItem={(audience) => (
            <AudienceCell key={"audience-" + audience.id} audience={audience} />
          )}
        />
      </StyledFlexBox>
    </AppCard>
  );
};

export default AgeOfAudience;
