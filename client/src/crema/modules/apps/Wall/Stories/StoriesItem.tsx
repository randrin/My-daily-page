import React from "react";
import {
  StyledStoriesCardMedia,
  StyledStoriesItemCard,
  StyledStoriesUserInfo,
  StyledStoriesUserInfoAvatar,
  StyledStoriesUserInfoTitle,
} from "./index.styled";
import { StoriesDataType } from "@crema/types/models/apps/Wall";

type StoriesProps = {
  data: StoriesDataType;
};

const StoriesItem: React.FC<StoriesProps> = ({ data }) => {
  const { imgSrc, avatar, title } = data;
  return (
    <StyledStoriesItemCard>
      <StyledStoriesCardMedia src={imgSrc} alt="Stories 1" />
      <StyledStoriesUserInfo>
        <StyledStoriesUserInfoAvatar src={avatar} alt="Avatar" />
        <StyledStoriesUserInfoTitle className="text-truncate">
          {title}
        </StyledStoriesUserInfoTitle>
      </StyledStoriesUserInfo>
    </StyledStoriesItemCard>
  );
};

export default StoriesItem;
