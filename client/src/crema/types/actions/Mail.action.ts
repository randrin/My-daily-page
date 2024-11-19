import {
  ConnectionObjType,
  FolderObjType,
  LabelObjType,
  MailObjType,
} from '../models/apps/Mail';

export const GET_CONNECTION_LIST = 'GET_CONNECTION_LIST';
export const GET_FOLDER_LIST = 'GET_FOLDER_LIST';
export const GET_LABEL_LIST = 'GET_LABEL_LIST';
export const COMPOSE_MAIL = 'COMPOSE_MAIL';
export const GET_MAIL_DETAIL = 'GET_MAIL_DETAIL';
export const GET_MAIL_LIST = 'GET_MAIL_LIST';
export const NULLIFY_MAIL = 'NULLIFY_MAIL';
export const TOGGLE_MAIL_DRAWER = 'TOGGLE_MAIL_DRAWER';
export const UPDATE_MAIL_FOLDER = 'UPDATE_MAIL_FOLDER';
export const UPDATE_MAIL_LABEL = 'UPDATE_MAIL_LABEL';
export const UPDATE_STARRED_STATUS = 'UPDATE_STARRED_STATUS';
export const UPDATED_MAIL_DETAIL = 'UPDATED_MAIL_DETAIL';
export const CHANGE_READ_STATUS = 'CHANGE_READ_STATUS';

export type GetMailConnectionListActions = {
  type: typeof GET_CONNECTION_LIST;
  payload: ConnectionObjType[];
};

export type GetMailFolderActions = {
  type: typeof GET_FOLDER_LIST;
  payload: FolderObjType[];
};

export type GetMailLabelActions = {
  type: typeof GET_LABEL_LIST;
  payload: LabelObjType[];
};

export type ComposeMailAction = {
  type: typeof COMPOSE_MAIL;
  payload: { data: MailObjType; pathname: string };
};

export type GetMailDetailAction = {
  type: typeof GET_MAIL_DETAIL;
  payload: MailObjType;
};

export type GetMailListAction = {
  type: typeof GET_MAIL_LIST;
  payload: {
    list: MailObjType[];
    total: number;
  };
};

export type RemoveSelectedMailAction = {
  type: typeof NULLIFY_MAIL;
};

export type ToggleMailDrawerActions = {
  type: typeof TOGGLE_MAIL_DRAWER;
};

export type UpdateMailFolderAction = {
  type: typeof UPDATE_MAIL_FOLDER;
  payload: number[];
};

export type UpdateMailLabelAction = {
  type: typeof UPDATE_MAIL_LABEL;
  payload: MailObjType[];
};

export type UpdateMailStaredAction = {
  type: typeof UPDATE_STARRED_STATUS;
  payload: { data: MailObjType[]; folderName: string };
};

export type UpdateMailReadStatusAction = {
  type: typeof CHANGE_READ_STATUS;
  payload: MailObjType[];
};

export type UpdateMailDetailAction = {
  type: typeof UPDATED_MAIL_DETAIL;
  payload: MailObjType;
};

export type MailActions =
  | GetMailConnectionListActions
  | GetMailFolderActions
  | GetMailLabelActions
  | ComposeMailAction
  | RemoveSelectedMailAction
  | GetMailDetailAction
  | GetMailListAction
  | ToggleMailDrawerActions
  | UpdateMailFolderAction
  | UpdateMailLabelAction
  | UpdateMailStaredAction
  | UpdateMailReadStatusAction
  | UpdateMailDetailAction;
