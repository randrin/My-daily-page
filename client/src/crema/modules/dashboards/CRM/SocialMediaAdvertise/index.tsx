import React from "react";
import SocialMediaGraph from "./SocialMediaGraph";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import {
  StyledSocialMediaAdvertise,
  StyledSocialMediaAdvertiseItem,
  StyledSocialMediaAdvName,
  StyledSocialMediaAdvValue,
} from "./index.styled";

import type { SocialMediaDataType } from "@crema/types/models/dashboards/CRM";

type SocialMediaAdvertiseProps = {
  socialMediaData: SocialMediaDataType[];
};

const SocialMediaAdvertise: React.FC<SocialMediaAdvertiseProps> = ({
  socialMediaData,
}) => {
  const { messages } = useIntl();

  return (
    <AppCard heightFull title={messages["dashboard.socialMedia"] as string}>
      <SocialMediaGraph socialMediaData={socialMediaData} />
      <StyledSocialMediaAdvertise>
        {socialMediaData.map((item) => {
          return (
            <StyledSocialMediaAdvertiseItem key={item.id}>
              <h4 style={{ color: item.color }}>{item.revenue}</h4>
              <StyledSocialMediaAdvName>{item.name}</StyledSocialMediaAdvName>
              <StyledSocialMediaAdvValue style={{ color: item.changeColor }}>
                {item.change}
              </StyledSocialMediaAdvValue>
            </StyledSocialMediaAdvertiseItem>
          );
        })}
      </StyledSocialMediaAdvertise>
    </AppCard>
  );
};

export default SocialMediaAdvertise;
