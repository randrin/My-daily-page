import { ConnectionObjType, MessageObjType } from '../models/apps/Chat';

export const ADD_NEW_MESSAGE = 'ADD_NEW_MESSAGE';
export const DELETE_MESSAGE = 'DELETE_MESSAGE';
export const DELETE_USER_MESSAGES = 'DELETE_USER_MESSAGES';
export const EDIT_MESSAGE = 'EDIT_MESSAGE';
export const GET_CONNECTIONS_LIST = 'GET_CONNECTIONS_LIST';
export const GET_USER_MESSAGES = 'GET_USER_MESSAGES';
export const SELECT_USER = 'SELECT_USER';
export const TOGGLE_CHAT_DRAWER = 'TOGGLE_CHAT_DRAWER';

export type AddNewMessageActions = {
  type: typeof ADD_NEW_MESSAGE;
  payload: {
    data: {
      user: ConnectionObjType;
      userMessages: MessageObjType;
    };
  };
};

export type DeleteMessageActions = {
  type: typeof DELETE_MESSAGE;
  payload: {
    user: ConnectionObjType;
    userMessages: MessageObjType;
  };
};

export type DeleteUserMessageActions = {
  type: typeof DELETE_USER_MESSAGES;
  payload: ConnectionObjType;
};

export type EditMessageActions = {
  type: typeof EDIT_MESSAGE;
  payload: {
    data: {
      user: ConnectionObjType;
      userMessages: MessageObjType;
    };
  };
};

export type GetConnectionListActions = {
  type: typeof GET_CONNECTIONS_LIST;
  payload: ConnectionObjType[];
};

export type GetUserMessageActions = {
  type: typeof GET_USER_MESSAGES;
  payload: MessageObjType[] | null;
};

export type SelectUserActions = {
  type: typeof SELECT_USER;
  payload: ConnectionObjType;
};

export type ToggleChatDrawerActions = {
  type: typeof TOGGLE_CHAT_DRAWER;
};

export type ChatActions =
  | AddNewMessageActions
  | DeleteMessageActions
  | DeleteUserMessageActions
  | EditMessageActions
  | GetConnectionListActions
  | GetUserMessageActions
  | SelectUserActions
  | ToggleChatDrawerActions;
