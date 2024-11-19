import React from "react";
import { Tooltip } from "antd";
import {
  StyledScrumBoardMember,
  StyledScrumBoardMemberAvatar,
} from "./index.styled";
import { MemberObjType } from "@crema/types/models/apps/ScrumbBoard";

type MembersProps = {
  members: MemberObjType[];
};

const Members: React.FC<MembersProps> = ({ members }) => {
  return (
    <StyledScrumBoardMember>
      {members.map((member) => {
        return (
          <Tooltip title={member.name} key={member.id}>
            {member.image ? (
              <StyledScrumBoardMemberAvatar src={member.image} alt="created" />
            ) : (
              <StyledScrumBoardMemberAvatar>
                {member.name[0].toUpperCase()}
              </StyledScrumBoardMemberAvatar>
            )}
          </Tooltip>
        );
      })}
    </StyledScrumBoardMember>
  );
};

export default Members;
