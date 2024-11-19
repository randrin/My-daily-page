import React from "react";
import { StyledIntroDesc, StyledIntroTitle } from "./index.styled";
import { IntroDuctioListnData } from "@crema/mockapi/fakedb/extraPages";

type IntroductionProps = {
  data: IntroDuctioListnData;
};

const IntroductionItem = ({ data }: IntroductionProps) => {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div style={{ marginRight: 20 }}>
        <img style={{ minWidth: 34 }} src={data.icon} alt="icon" />
      </div>
      <div>
        <StyledIntroTitle level={4}>{data.title}</StyledIntroTitle>
        <StyledIntroDesc>{data.description}</StyledIntroDesc>
      </div>
    </div>
  );
};

export default IntroductionItem;
