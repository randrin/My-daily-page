import React, { useEffect, useState } from "react";
import AddCard from "./List/AddCard";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
// import './react-trello';
import Board from "react-trello";
import { postDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useThemeContext } from "@crema/context/AppContextProvider/ThemeContextProvider";
import {
  AddCardButton,
  AddNewList,
  BoardCard,
  ListHeader,
  NewListButton,
} from "@crema/modules/apps/ScrumBoard";

import type {
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type BoardDetailViewProps = {
  boardDetail: BoardObjType;
  setData: (data: BoardObjType) => void;
};

const BoardDetailView: React.FC<BoardDetailViewProps> = ({
  boardDetail,
  setData,
}) => {
  const [list, setList] = useState<CardListObjType | null>(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const { theme } = useThemeContext();
  const [isAddCardOpen, setAddCardOpen] = useState(false);

  const [selectedCard, setSelectedCard] = useState<CardObjType | null>(null);

  const getBoardData = () => {
    return {
      ...boardDetail,
      lanes: boardDetail.list,
    };
  };

  const [boardData, setBoardData] = useState(getBoardData());

  useEffect(() => {
    setBoardData(getBoardData());
  }, [boardDetail]);

  const shouldReceiveNewData = (nextData: any) => {
    setBoardData(nextData);
  };

  const onCloseAddCard = () => {
    setAddCardOpen(false);
  };

  const onClickAddCard = (listId: number) => {
    setList(boardData!.lanes!.find((item) => item.id === listId)!);
    setSelectedCard(null);
    setAddCardOpen(true);
  };

  const onAddList = (name: string) => {
    postDataApi("/api/scrumboard/add/list", infoViewActionsContext, {
      boardId: boardDetail?.id,
      list: {
        name: name,
      },
    })
      .then((data) => {
        if (setData) setData(data as BoardObjType);
        infoViewActionsContext.showMessage("List Added Successfully!");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const getCardById = (lane: CardListObjType, cardId: number) =>
    lane.cards.find((item) => item.id === cardId);

  const onEditCardDetail = (cardId: number) => {
    const selectedList = boardData.lanes.find((item) => {
      const correctCard = item.cards.find((card) => card.id === cardId);
      if (correctCard) return item;
    });
    const selectedCard = getCardById(selectedList as CardListObjType, cardId);
    setSelectedCard(selectedCard as CardObjType);
    setList(selectedList as CardListObjType);
    setAddCardOpen(true);
  };

  const handleDragCard = (
    cardId: any,
    sourceLaneId: number,
    targetLaneId: number,
    position: number,
    cardDetails: CardObjType
  ) => {
    if (sourceLaneId !== targetLaneId) {
      const boardId = boardDetail?.id;
      putDataApi<BoardObjType>(
        "/api/cards/update/category",
        infoViewActionsContext,
        {
          cardId: cardDetails.id,
          sourceLaneId: sourceLaneId,
          categoryId: targetLaneId,
          position: position,
          boardId: boardId,
        }
      )
        .then((data) => {
          setData(data);
          infoViewActionsContext.showMessage("Card Updated Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  const onEditBoardList = (lane: CardListObjType, data: CardObjType) => {
    putDataApi<BoardObjType>(
      "/api/scrumboard/edit/list",
      infoViewActionsContext,
      {
        boardId: boardDetail?.id,
        list: { ...lane, name: data.title },
      }
    )
      .then((data) => {
        setData(data);
        infoViewActionsContext.showMessage("List Edited Successfully!");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onDeleteSelectedList = (laneId: number) => {
    postDataApi<BoardObjType>(
      "/api/scrumboard/delete/list",
      infoViewActionsContext,
      {
        boardId: boardDetail?.id,
        listId: laneId,
      }
    )
      .then((data) => {
        setData(data);
        infoViewActionsContext.showMessage("List Deleted Successfully!");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <AppsContent fullView>
      <Board
        laneStyle={{
          backgroundColor: theme.palette.background.default,
        }}
        editable
        canAddLanes
        data={boardData}
        onDataChange={shouldReceiveNewData}
        handleDragEnd={handleDragCard}
        onCardAdd={(_: CardObjType, laneId: number) => {
          onClickAddCard(laneId);
        }}
        onCardClick={(cardId: number, _: any) => {
          onEditCardDetail(cardId);
        }}
        onLaneAdd={(name: string) => onAddList(name)}
        onLaneUpdate={(laneId: number, data: CardObjType) => {
          const lane = boardData.lanes.find((item) => item.id === laneId);
          if (lane) onEditBoardList(lane, data);
        }}
        onLaneDelete={(laneId: number) => onDeleteSelectedList(laneId)}
        t={(listId: number) => onClickAddCard(listId)}
        components={{
          Card: BoardCard,
          LaneHeader: ListHeader,
          AddCardLink: AddCardButton,
          NewCardForm: AddCard,
          NewLaneForm: AddNewList,
          NewLaneSection: NewListButton,
        }}
      />
      {isAddCardOpen ? (
        <AddCard
          isModalVisible={isAddCardOpen}
          handleCancel={onCloseAddCard}
          list={list}
          board={boardDetail}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          setData={setData}
        />
      ) : null}
    </AppsContent>
  );
};

export default BoardDetailView;
