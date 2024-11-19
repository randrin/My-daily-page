import React from "react";
import IntroductionItem from "./IntroductionItem";
import {
  StyledCard,
  StyledCardMedia,
  StyledCardWraper,
  StyledIntroWrapper,
  StyledPrimarySubTitle,
  StyledPrimaryTitle,
  StyledTitleWrapper,
} from "./index.styled";
import { IntroDuctionData } from "@crema/mockapi/fakedb/extraPages";

type IntroductionProps = {
  introduction: IntroDuctionData;
};

const Introduction = ({ introduction }: IntroductionProps) => {
  return (
    <StyledCard>
      <StyledCardMedia src={introduction.srcImg} alt="introduction" />
      <StyledCardWraper>
        <StyledTitleWrapper>
          <StyledPrimarySubTitle level={5}>
            {introduction.subTitle}
          </StyledPrimarySubTitle>
          <StyledPrimaryTitle level={2}>
            {introduction.title}
          </StyledPrimaryTitle>
        </StyledTitleWrapper>
        <StyledIntroWrapper>
          {introduction.introductionList.map((introduction, index) => (
            <div className="introduction-item" key={index}>
              <IntroductionItem data={introduction} />
            </div>
          ))}
        </StyledIntroWrapper>
      </StyledCardWraper>
    </StyledCard>
  );
};

export default Introduction;
