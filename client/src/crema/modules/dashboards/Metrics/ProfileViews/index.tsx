import React from "react";
import ProfileViewsGraph from "./ProfileViewsGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import { StyledProfileViewCard, StyledProfileViewGraph } from "./index.styled";
import type { ProfileViewsDataType } from "@crema/types/models/dashboards/Metrics";

type ProfileViewsProps = {
  data: ProfileViewsDataType;
};

const ProfileViews: React.FC<ProfileViewsProps> = ({ data }) => {
  return (
    <StyledProfileViewCard heightFull>
      <h3>{data.views}</h3>
      <p>
        <IntlMessages id="dashboard.profileViews" />
      </p>
      <StyledProfileViewGraph>
        <ProfileViewsGraph data={data.graphData} />
      </StyledProfileViewGraph>
    </StyledProfileViewCard>
  );
};

export default ProfileViews;
