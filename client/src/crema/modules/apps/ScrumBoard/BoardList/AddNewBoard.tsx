import React, { useState } from "react";

import IntlMessages from "@crema/helpers/IntlMessages";
import { Input } from "antd";
import { useIntl } from "react-intl";
import {
  StyledScrumAddBoardCard,
  StyledScrumAddBoardFooterBtn,
  StyledScrumBoardAddModal,
} from "./index.styled";
import { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

type AddNewBoardProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  handleOk: () => void;
  onAddBoard: (boardName: string) => void;
  selectedBoard: BoardObjType | null;
};

const AddNewBoard: React.FC<AddNewBoardProps> = ({
  isModalVisible,
  handleCancel,
  handleOk,
  onAddBoard,
  selectedBoard,
}) => {
  const [boardName, setBoardName] = useState(() =>
    selectedBoard ? selectedBoard.name : ""
  );

  const onClickAddButton = () => {
    if (boardName !== "") {
      onAddBoard(boardName);
      setBoardName("");
      handleCancel();
    }
  };
  const { messages } = useIntl();

  return (
    <StyledScrumBoardAddModal
      title={messages["scrumboard.addNewBoard"] as string}
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={
        <StyledScrumAddBoardFooterBtn type="primary" onClick={onClickAddButton}>
          <IntlMessages id="common.add" />
        </StyledScrumAddBoardFooterBtn>
      }
    >
      <StyledScrumAddBoardCard>
        <Input
          placeholder="Basic usage"
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
        />
      </StyledScrumAddBoardCard>
    </StyledScrumBoardAddModal>
  );
};

export default AddNewBoard;
