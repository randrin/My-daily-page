import React from "react";
import { StyledAppCard, StyledTeamDesc, StyledTeamTitle } from "./index.styled";
import { TeamData } from "@crema/mockapi/fakedb/extraPages";

type MemberItemProps = {
  member: TeamData;
};
const MemberItem = ({ member }: MemberItemProps) => {
  return (
    <StyledAppCard cover={<img alt="MemberItem" src={member.srcImg} />}>
      <StyledTeamTitle level={5}>{member.name}</StyledTeamTitle>
      <StyledTeamDesc>{member.position}</StyledTeamDesc>
    </StyledAppCard>
  );
};

export default MemberItem;
