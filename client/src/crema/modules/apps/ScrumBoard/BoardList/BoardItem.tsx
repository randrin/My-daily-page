import React from "react";
import { BsCardList } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import {
  StyledScrumBoardCard,
  StyledScrumBoardCardText,
  StyledScrumListIcon,
} from "./index.styled";
import { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

type BoardItemProps = {
  board: BoardObjType;
  onEditButtonClick: (board: BoardObjType) => void;
  onViewBoardDetail: (board: BoardObjType) => void;
};

const BoardItem: React.FC<BoardItemProps> = ({
  board,
  onEditButtonClick,
  onViewBoardDetail,
}) => {
  return (
    <StyledScrumBoardCard
      key={board.id}
      onClick={() => onViewBoardDetail(board)}
    >
      <StyledScrumListIcon>
        <BsCardList />
        <MdEdit onClick={() => onEditButtonClick(board)} />
      </StyledScrumListIcon>
      <StyledScrumBoardCardText>{board.name}</StyledScrumBoardCardText>
      <span onClick={(event) => event.stopPropagation()} />
    </StyledScrumBoardCard>
  );
};

export default BoardItem;
