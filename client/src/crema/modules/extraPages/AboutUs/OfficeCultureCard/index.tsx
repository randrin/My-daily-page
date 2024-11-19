import React from "react";
import AppCard from "@crema/components/AppCard";
import { StyledOfcDesc, StyledTitle } from "./index.styled";
import { OfficeCultureData } from "@crema/mockapi/fakedb/extraPages";

type OfficeCultureCardProps = {
  officeCulture: OfficeCultureData;
};

const OfficeCultureCard = ({ officeCulture }: OfficeCultureCardProps) => {
  return (
    <AppCard
      style={{ height: "100%" }}
      cover={<img alt="OfficeCulture" src={officeCulture.srcImg} />}
    >
      <StyledTitle level={3}>{officeCulture.title}</StyledTitle>
      <StyledOfcDesc>{officeCulture.description}</StyledOfcDesc>
    </AppCard>
  );
};

export default OfficeCultureCard;
