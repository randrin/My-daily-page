import React from "react";
import AppCard from "@crema/components/AppCard";
import {
  StyledCremaCardHeader,
  StyledCremaLogo,
  StyledCremaPara,
  StyledCremaTitle,
  StyledCremaUserInfoContent,
  StyledSocialLink,
  StyledUserInfo,
} from "./index.styled";
import type { SocialInfoType } from "@crema/types/models/dashboards/Widgets";

type CremaCardProps = {
  data: SocialInfoType;
  bgColor: string;
  icon: any;
};

const CremaCard: React.FC<CremaCardProps> = ({ data, bgColor, icon }) => {
  return (
    <AppCard heightFull style={{ backgroundColor: bgColor }}>
      <StyledCremaCardHeader>
        <StyledUserInfo>
          <StyledCremaLogo>
            <img alt="logo" src={data.image} />
          </StyledCremaLogo>
          <StyledCremaUserInfoContent>
            <StyledCremaTitle className="text-truncate text-uppercase">
              {data.name}
            </StyledCremaTitle>
            <p className="text-truncate">{data.id}</p>
          </StyledCremaUserInfoContent>
        </StyledUserInfo>
        <StyledSocialLink>{icon}</StyledSocialLink>
      </StyledCremaCardHeader>

      <StyledCremaPara>{data.desc}</StyledCremaPara>
    </AppCard>
  );
};

export default CremaCard;
