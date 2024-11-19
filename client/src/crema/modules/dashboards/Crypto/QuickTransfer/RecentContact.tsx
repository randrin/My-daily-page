import React from "react";
import { StyledAvatar, StyledAvatarWrapper } from "./index.styled";
import type { RecentContactType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  recentContact: RecentContactType;
};

const RecentContact = ({ recentContact }: Props) => {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <StyledAvatarWrapper>
        <StyledAvatar src={recentContact.image} alt={recentContact.name} />
      </StyledAvatarWrapper>
      <div
        style={{
          whiteSpace: "nowrap",
        }}
      >
        {recentContact.name}
      </div>
    </div>
  );
};

export default RecentContact;
