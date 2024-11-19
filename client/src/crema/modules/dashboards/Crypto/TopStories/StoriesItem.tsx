import React from "react";
import {
  StyledFlex,
  StyledImgWrapper,
  StyledSecText,
  StyledTitle,
} from "./index.styled";
import { StoryType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  stories: StoryType;
};
const StoriesItem = ({ stories }: Props) => {
  return (
    <StyledFlex>
      <StyledImgWrapper>
        <img src={stories.srcImg} alt="stories" />
      </StyledImgWrapper>
      <div>
        <StyledTitle level={3}>{stories.title}</StyledTitle>
        <StyledSecText>
          <span style={{ marginRight: 4 }}>{stories.tag}</span>
          <span style={{ marginRight: 4 }}>.</span>
          <span>{stories.time}</span>
        </StyledSecText>
      </div>
    </StyledFlex>
  );
};

export default StoriesItem;
