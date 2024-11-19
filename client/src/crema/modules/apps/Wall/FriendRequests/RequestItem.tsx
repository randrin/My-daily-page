import React from "react";
import { getTimeFromNow } from "@crema/helpers/DateHelper";
import {
  StyledRequestAvatar,
  StyledRequestItem,
  StyledRequestItemContent,
  StyledRequestItemInfo,
} from "./index.styled";
import { FriendRequestObjType } from "@crema/types/models/apps/Wall";

type RequestItemProps = {
  request: FriendRequestObjType;
};

const RequestItem: React.FC<RequestItemProps> = ({ request }) => {
  return (
    <StyledRequestItem className="item-hover">
      <StyledRequestAvatar src={request.profilePic} />
      <StyledRequestItemInfo>
        <StyledRequestItemContent>
          <h4>{request.name}</h4>
          <p>{getTimeFromNow(request.date)}</p>
        </StyledRequestItemContent>
      </StyledRequestItemInfo>
    </StyledRequestItem>
  );
};

export default RequestItem;
