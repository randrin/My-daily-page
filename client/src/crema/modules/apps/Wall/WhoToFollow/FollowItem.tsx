import React from "react";
import {
  StyledFollowAvatar,
  StyledFollowItem,
  StyledFollowItemBtn,
  StyledFollowItemContent,
  StyledFollowItemContentTitle,
  StyledFollowItemIcon,
  StyledFollowItemInfo,
} from "./index.styled";
import { WhoToFollowObjType } from "@crema/types/models/apps/Wall";

type FollowItemProps = {
  item: WhoToFollowObjType;
};

const FollowItem: React.FC<FollowItemProps> = ({ item }) => {
  return (
    <StyledFollowItem className="item-hover">
      <StyledFollowAvatar src={item.profilePic} />
      <StyledFollowItemInfo>
        <StyledFollowItemContent>
          <StyledFollowItemContentTitle>
            <h5>{item.title}</h5>
            <StyledFollowItemIcon />
          </StyledFollowItemContentTitle>
          <p>{item.subTitle}</p>
        </StyledFollowItemContent>
        <StyledFollowItemBtn>Follow</StyledFollowItemBtn>
      </StyledFollowItemInfo>
    </StyledFollowItem>
  );
};

export default FollowItem;
