import React from "react";
import {
  StyledFlex,
  StyledSecondaryText,
  StyledTitle4,
  StyledWrapper,
} from "./index.styled";
import { RecentPostType } from "@crema/types/models/extrapages/Blog";

type Props = {
  recentPost: RecentPostType;
};

const RecentPostItem = ({ recentPost }: Props) => {
  return (
    <StyledFlex>
      <StyledWrapper>
        <img src={recentPost.srcImg} alt="Recent Post" />
      </StyledWrapper>
      <div style={{ flex: 1 }}>
        <StyledTitle4>{recentPost.title}</StyledTitle4>
        <StyledSecondaryText>{recentPost.duration}</StyledSecondaryText>
      </div>
    </StyledFlex>
  );
};

export default RecentPostItem;
