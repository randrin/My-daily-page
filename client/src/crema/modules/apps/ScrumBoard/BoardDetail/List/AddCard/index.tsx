import React, { useState } from "react";
import AppConfirmationModal from "@crema/components/AppConfirmationModal";
import IntlMessages from "@crema/helpers/IntlMessages";
import CardHeader from "./CardHeader";
import AddCardForm from "./AddCardForm";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { StyledScrumBoardAppCardDrawer } from "./index.styled";
import { postDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  AttachmentObjType,
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type AddCardProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  setData: any;
  board: BoardObjType;
  list: CardListObjType | null;
  selectedCard: CardObjType | null;
  setSelectedCard: any;
};

const AddCard: React.FC<AddCardProps> = ({
  isModalVisible,
  handleCancel,
  board,
  list,
  selectedCard,
  setData,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const { user } = useAuthUser();

  const [checkedList, setCheckedList] = useState(() =>
    selectedCard ? selectedCard.checkedList : []
  );

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedMembers, setMembersList] = useState(() =>
    selectedCard ? selectedCard.members : []
  );

  const [selectedLabels, setSelectedLabels] = useState(() =>
    selectedCard ? selectedCard.label : []
  );

  const [comments, setComments] = useState(() =>
    selectedCard ? selectedCard.comments : []
  );

  const [attachments, setAttachments] = useState(() =>
    selectedCard ? selectedCard.attachments : []
  );

  const onAddAttachments = (files: AttachmentObjType[]) => {
    setAttachments([...attachments, ...files]);
  };

  const onDeleteCard = () => {
    const boardId = board.id;
    const listId = list!.id;
    const cardId = selectedCard!.id;
    postDataApi("/api/scrumboard/delete/card", infoViewActionsContext, {
      boardId,
      listId,
      cardId,
    })
      .then((data) => {
        setData(data);
        infoViewActionsContext.showMessage("Card Deleted Successfully!");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });

    setDeleteDialogOpen(false);
    handleCancel();
  };

  const onClickDeleteIcon = () => {
    if (selectedCard) {
      setDeleteDialogOpen(true);
    } else {
      handleCancel();
    }
  };
  return (
    <StyledScrumBoardAppCardDrawer
      open={isModalVisible}
      width="80%"
      title={
        <CardHeader
          onAddAttachments={onAddAttachments}
          onClickDeleteIcon={onClickDeleteIcon}
          handleCancel={handleCancel}
          board={board}
          list={list}
        />
      }
      onClose={handleCancel}
    >
      <AddCardForm
        board={board}
        list={list}
        checkedList={checkedList}
        handleCancel={handleCancel}
        setCheckedList={setCheckedList}
        comments={comments}
        setComments={setComments}
        authUser={user}
        attachments={attachments}
        setAttachments={setAttachments}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        selectedMembers={selectedMembers}
        setMembersList={setMembersList}
        selectedCard={selectedCard}
        onCloseAddCard={handleCancel}
        setData={setData}
      />

      {isDeleteDialogOpen ? (
        <AppConfirmationModal
          open={isDeleteDialogOpen}
          onDeny={setDeleteDialogOpen}
          onConfirm={onDeleteCard}
          modalTitle={<IntlMessages id="scrumboard.deleteCard" />}
          paragraph={<IntlMessages id="common.deleteItem" />}
        />
      ) : null}
    </StyledScrumBoardAppCardDrawer>
  );
};

export default AddCard;
