import { BoardObjType, CardListObjType } from '../models/apps/ScrumbBoard';

export const ADD_BOARD_LIST = 'ADD_BOARD_LIST';
export const ADD_LIST_CARD = 'ADD_LIST_CARD';
export const ADD_NEW_BOARD = 'ADD_NEW_BOARD';
export const DELETE_BOARD = 'DELETE_BOARD';
export const DELETE_LIST = 'DELETE_LIST';
export const DELETE_LIST_CARD = 'DELETE_LIST_CARD';
export const EDIT_BOARD_DETAIL = 'EDIT_BOARD_DETAIL';
export const EDIT_BOARD_LIST = 'EDIT_BOARD_LIST';
export const EDIT_LIST_CARD = 'EDIT_LIST_CARD';
export const GET_BOARD_DETAIL = 'GET_BOARD_DETAIL';
export const GET_BOARDS = 'GET_BOARDS';
export const GET_MEMBER_LIST = 'GET_MEMBER_LIST';
export const GET_SCRUM_LABEL_LIST = 'GET_SCRUM_LABEL_LIST';

export type AddBoardListActions = {
  type: typeof ADD_BOARD_LIST;
  payload: BoardObjType;
};

export type AddListCardActions = {
  type: typeof ADD_LIST_CARD;
  payload: CardListObjType;
};

export type AddNewBoardActions = {
  type: typeof ADD_NEW_BOARD;
  payload: BoardObjType;
};

export type DeleteBoardActions = {
  type: typeof DELETE_BOARD;
  payload: number;
};

export type DeleteListActions = {
  type: typeof DELETE_LIST;
  payload: number;
};

export type DeleteListCardActions = {
  type: typeof DELETE_LIST_CARD;
  payload: CardListObjType;
};

export type EditBoardDetailActions = {
  type: typeof EDIT_BOARD_DETAIL;
  payload: BoardObjType;
};

export type EditBoardListActions = {
  type: typeof EDIT_BOARD_LIST;
  payload: CardListObjType;
};

export type EditListCardActions = {
  type: typeof EDIT_LIST_CARD;
  payload: CardListObjType;
};

export type GetBoardDetailActions = {
  type: typeof GET_BOARD_DETAIL;
  payload: CardListObjType;
};

export type GetBoardListActions = {
  type: typeof GET_BOARDS;
  payload: CardListObjType;
};

export type GetMemberListActions = {
  type: typeof GET_MEMBER_LIST;
  payload: CardListObjType;
};

export type GetScrumLabelListActions = {
  type: typeof GET_SCRUM_LABEL_LIST;
  payload: CardListObjType;
};

export type ScrumboardActions =
  | AddBoardListActions
  | AddListCardActions
  | AddNewBoardActions
  | DeleteBoardActions
  | DeleteListActions
  | DeleteListCardActions
  | EditBoardDetailActions
  | EditBoardListActions
  | EditListCardActions
  | GetBoardDetailActions
  | GetBoardListActions
  | GetMemberListActions
  | GetScrumLabelListActions;
