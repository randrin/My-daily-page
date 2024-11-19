import React from "react";
import {
  StyledDot,
  StyledFlexWrapper,
  StyledTitle4,
  StyledTitle5,
} from "./index.styled";
import { AgeOfAudienceType } from "@crema/types/models/dashboards/Ecommerce";

type Props = {
  audience: AgeOfAudienceType;
};

const AudienceCell = ({ audience }: Props) => {
  return (
    <StyledFlexWrapper className="item-hover">
      <StyledDot
        style={{
          backgroundColor: audience.color,
        }}
      />
      <StyledTitle5>{audience.title}</StyledTitle5>
      <StyledTitle4>{audience.value}%</StyledTitle4>
    </StyledFlexWrapper>
  );
};

export default AudienceCell;
