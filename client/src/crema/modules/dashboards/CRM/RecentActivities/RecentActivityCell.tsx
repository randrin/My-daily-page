import React from "react";
import { Avatar } from "antd";
import {
  StyledFlexRecentActivity,
  StyledRecentActivityMsg,
  StyledRecentActivityName,
  StyledRecentActivityTitle,
  StyledRecentActivityWrapper,
} from "./index.styled";
import { RecentActivityType } from "@crema/types/models/dashboards/CRM";

type Props = {
  activity: RecentActivityType;
};
const RecentActivityCell = ({ activity }: Props) => {
  return (
    <StyledRecentActivityWrapper className="item-hover">
      <Avatar
        style={{
          width: 36,
          height: 36,
          marginRight: 14,
        }}
        src={activity.profile_pic}
      />
      <div
        style={{
          flex: 1,
        }}
      >
        <StyledFlexRecentActivity>
          <StyledRecentActivityName>{activity.name}</StyledRecentActivityName>
          <StyledRecentActivityTitle>
            <p
              style={{
                fontSize: 12,
              }}
            >
              {activity.created_at}
            </p>
          </StyledRecentActivityTitle>
        </StyledFlexRecentActivity>
        <StyledRecentActivityMsg>{activity.message}</StyledRecentActivityMsg>
      </div>
    </StyledRecentActivityWrapper>
  );
};

export default RecentActivityCell;
