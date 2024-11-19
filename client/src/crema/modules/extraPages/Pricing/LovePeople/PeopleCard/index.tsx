import React from "react";
import { Card } from "antd";
import { StyledHeading, StyledLearnBtn, StyledText } from "./index.styled";
import type { GitPackageType } from "@crema/types/models/extrapages/Pricing";
import { AiOutlineArrowRight } from "react-icons/ai";

type Props = {
  data: GitPackageType;
};

const PeopleCard = ({ data }: Props) => {
  console.log(data);
  return (
    <Card style={{ minHeight: 320 }}>
      <img src={data.src} alt="crema-logo" />
      <StyledHeading>{data.heading}</StyledHeading>
      <StyledText>{data.text}</StyledText>
      <StyledLearnBtn type="link">
        <span className="btn-text">Learn More</span>
        <AiOutlineArrowRight className="icon" size={16} />
      </StyledLearnBtn>
    </Card>
  );
};

export default PeopleCard;
