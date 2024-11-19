import React, { useState } from "react";
import { useRouter } from "next/router";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppInfoView from "@crema/components/AppInfoView";
import { Col } from "antd";
import {
  StyledScrumBoardContainer,
  StyledScrumBoardHeader,
  StyledScrumBoardWrap,
} from "./index.styled";
import { postDataApi, putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  AddBoardButton,
  AddNewBoard,
  BoardItem,
} from "@crema/modules/apps/ScrumBoard";
import type { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

const BoardList = () => {
  const router = useRouter();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{ apiData: boardList }, { setData }] = useGetDataApi<BoardObjType[]>(
    "/api/scrumboard/board/list"
  );

  const [selectedBoard, setSelectedBoard] = useState<BoardObjType | null>(null);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const onEditButtonClick = (board: BoardObjType) => {
    setSelectedBoard(board);
    setIsModalVisible(true);
  };

  const onAddBoard = (name: string) => {
    if (selectedBoard) {
      const board = { ...selectedBoard, name };
      putDataApi("/api/scrumboard/edit/board", infoViewActionsContext, {
        board,
      })
        .then(() => {
          infoViewActionsContext.showMessage("Board Edited Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    } else {
      postDataApi<BoardObjType>(
        "/api/scrumboard/add/board",
        infoViewActionsContext,
        {
          board: { name },
        }
      )
        .then((data) => {
          if (setData) setData(boardList.concat(data));
          infoViewActionsContext.showMessage("Board Added Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
    }
  };

  const onViewBoardDetail = (board: BoardObjType) => {
    router.push(`/apps/scrum-board/${board.id}`);
  };

  const showModal = () => {
    setSelectedBoard(null);
    setIsModalVisible(true);
  };

  return (
    <>
      <StyledScrumBoardWrap>
        <StyledScrumBoardHeader>
          <h2>
            <IntlMessages id="scrumboard.scrumboardApp" />
          </h2>
        </StyledScrumBoardHeader>
        <StyledScrumBoardContainer>
          {boardList && boardList.length > 0
            ? boardList.map((board: BoardObjType) => {
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={board.id}>
                    <BoardItem
                      board={board}
                      onEditButtonClick={onEditButtonClick}
                      onViewBoardDetail={onViewBoardDetail}
                    />
                  </Col>
                );
              })
            : null}
          <Col xs={24} sm={12} md={8} lg={6}>
            <AddBoardButton onAddButtonClick={showModal} />
          </Col>
        </StyledScrumBoardContainer>
      </StyledScrumBoardWrap>

      {isModalVisible ? (
        <AddNewBoard
          isModalVisible={isModalVisible}
          handleCancel={handleCancel}
          onAddBoard={onAddBoard}
          handleOk={handleOk}
          selectedBoard={selectedBoard}
        />
      ) : null}
      <AppInfoView />
    </>
  );
};

export default BoardList;
