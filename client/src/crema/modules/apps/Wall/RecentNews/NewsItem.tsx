import React from "react";
import {
  StyledNewsAvatar,
  StyledRecentNewsItem,
  StyledRecentNewsItemContent,
  StyledRecentNewsItewLink,
} from "./index.styled";
import { RecentNewsObjType } from "@crema/types/models/apps/Wall";

type RecentNewsProps = {
  item: RecentNewsObjType;
};

const NewsItem: React.FC<RecentNewsProps> = ({ item }) => {
  return (
    <StyledRecentNewsItem className="item-hover">
      <StyledNewsAvatar src={item.user.profilePic} />
      <StyledRecentNewsItemContent>
        <h4>{item.title}</h4>
        <p>
          {item.desc}
          <StyledRecentNewsItewLink>Read More</StyledRecentNewsItewLink>
        </p>
      </StyledRecentNewsItemContent>
    </StyledRecentNewsItem>
  );
};
export default NewsItem;
