import React from "react";
import AppList from "@crema/components/AppList";
import FollowItem from "./FollowItem";
import { useIntl } from "react-intl";
import { StyledWhoFollowCard, StyledWhoFollowLink } from "./index.styled";
import { WhoToFollowObjType } from "@crema/types/models/apps/Wall";

type WhoToFollowProps = {
  whoToFollow: WhoToFollowObjType[];
};

const WhoToFollow: React.FC<WhoToFollowProps> = ({ whoToFollow }) => {
  const { messages } = useIntl();
  return (
    <StyledWhoFollowCard
      className="no-card-space-ltr-rtl"
      title={messages["wall.whoToFollow"]}
      extra={<a href="#/">{messages["common.viewAll"] as string}</a>}
      actions={[<StyledWhoFollowLink key={1}>View More</StyledWhoFollowLink>]}
    >
      <AppList
        data={whoToFollow}
        renderItem={(item, index) => <FollowItem key={index} item={item} />}
      />
    </StyledWhoFollowCard>
  );
};

export default WhoToFollow;
