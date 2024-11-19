import React from "react";
import AppList from "@crema/components/AppList";
import RequestItem from "./RequestItem";
import { useIntl } from "react-intl";
import { StyledRequestCard } from "./index.styled";
import { FriendRequestObjType } from "@crema/types/models/apps/Wall";

type FriendRequestsProps = {
  friendRequests: FriendRequestObjType[];
};

const FriendRequests: React.FC<FriendRequestsProps> = ({ friendRequests }) => {
  const { messages } = useIntl();
  return (
    <StyledRequestCard
      className="no-card-space-ltr-rtl"
      title={`Friends`}
      extra={<a href="#/">{messages["common.viewAll"] as string}</a>}
    >
      <AppList
        animation="transition.slideRightBigIn"
        data={friendRequests}
        renderItem={(data, index) => <RequestItem key={index} request={data} />}
      />
    </StyledRequestCard>
  );
};

export default FriendRequests;
