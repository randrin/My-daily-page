import React from "react";
import dayjs from "dayjs";
import Members from "./Members";
import Labels from "./Labels";
import { MdChatBubbleOutline } from "react-icons/md";
import {
  StyledIoMdAttach,
  StyledScrumBoardCardDetails,
  StyledScrumBoardCardDetailTitle,
  StyledScrumBoardCardDetailUser,
  StyledScrumBoardCardHeader,
  StyledScrumBoardCardHeaderAction,
  StyledScrumBoardCardDetailDate,
  StyledScrumBoardCardDetailComment,
} from "./index.styled";
import {
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type CardDetailProps = {
  title: string;
  attachments: string[];
  label: LabelObjType[];
  members: MemberObjType[];
  date: string;
  comments: string[];
  onClick: () => void;
};

const BoardCard: React.FC<CardDetailProps> = ({
  title,
  attachments = [],
  label = [],
  members,
  date,
  comments,
  onClick,
}) => {
  return (
    <StyledScrumBoardCardDetails
      onClick={() => {
        console.log("clicked");
        onClick();
      }}
    >
      <StyledScrumBoardCardHeader>
        <StyledScrumBoardCardDetailTitle>
          {title}
        </StyledScrumBoardCardDetailTitle>
        {attachments && attachments.length > 0 ? (
          <StyledScrumBoardCardHeaderAction>
            <span>{attachments.length}</span>
            <StyledIoMdAttach />
          </StyledScrumBoardCardHeaderAction>
        ) : null}
      </StyledScrumBoardCardHeader>
      {label.length > 0 ? <Labels labels={label} /> : null}

      <StyledScrumBoardCardDetailUser>
        {members.length > 0 ? <Members members={members} /> : null}

        <StyledScrumBoardCardDetailDate>
          {date ? dayjs(date).format("MMM DD").split(",")[0] : null}
        </StyledScrumBoardCardDetailDate>
        {comments && comments.length > 0 ? (
          <StyledScrumBoardCardDetailComment>
            <span>{comments.length}</span>
            <MdChatBubbleOutline />
          </StyledScrumBoardCardDetailComment>
        ) : null}
      </StyledScrumBoardCardDetailUser>
    </StyledScrumBoardCardDetails>
  );
};

export default BoardCard;
