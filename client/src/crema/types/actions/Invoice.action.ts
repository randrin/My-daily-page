import {
  InvoiceType,
  ClientType,
  InvoiceSettingType,
  InvFolderType,
} from '../models/invoice';

export const GET_INVOICE_LIST = 'GET_INVOICE_LIST';
export const GET_INVOICE_DETAIL = 'GET_INVOICE_DETAIL';
export const GET_CLIENT_DETAIL = 'GET_CLIENT_DETAIL';
export const GET_INVOICE_FOLDER_LIST = 'GET_INVOICE_FOLDER_LIST';
export const GET_INVOICE_SETTINGS = 'GET_INVOICE_SETTINGS';
export const GET_CLIENT_LIST = 'GET_CLIENT_LIST';
export const ADD_NEW_CLIENTS = 'ADD_NEW_CLIENTS';
export const UPDATE_CLIENTS = 'UPDATE_CLIENTS';
export const ADD_NEW_INVOICE = 'ADD_NEW_INVOICE';
export const UPDATE_INVOICE_SETTINGS = 'UPDATE_INVOICE_SETTINGS';
export const UPDATE_INVOICE = 'UPDATE_INVOICE';

export type GetInvoiceListAction = {
  type: typeof GET_INVOICE_LIST;
  payload: InvoiceType[];
};

export type GetInvoiceDetailAction = {
  type: typeof GET_INVOICE_DETAIL;
  payload: InvoiceType;
};

export type AddInvoiceAction = {
  type: typeof ADD_NEW_INVOICE;
  payload: InvoiceType;
};

export type UpdateInvoiceAction = {
  type: typeof UPDATE_INVOICE;
  payload: InvoiceType[];
};

export type GetFolderAction = {
  type: typeof GET_INVOICE_FOLDER_LIST;
  payload: InvFolderType;
};

export type GetInvoiceSettingsAction = {
  type: typeof GET_INVOICE_SETTINGS;
  payload: InvoiceSettingType;
};
export type UpdateInvoiceSettingsAction = {
  type: typeof UPDATE_INVOICE_SETTINGS;
  payload: InvoiceSettingType;
};

export type GetClientListAction = {
  type: typeof GET_CLIENT_LIST;
  payload: ClientType[];
};

export type GetClientDetailAction = {
  type: typeof GET_CLIENT_DETAIL;
  payload: ClientType;
};
export type AddClientAction = {
  type: typeof ADD_NEW_CLIENTS;
  payload: ClientType;
};

export type UpdateClientAction = {
  type: typeof UPDATE_CLIENTS;
  payload: ClientType[];
};

export type InvoiceActionTypes =
  | GetInvoiceListAction
  | AddInvoiceAction
  | UpdateInvoiceAction
  | GetInvoiceDetailAction
  | GetFolderAction
  | GetInvoiceSettingsAction
  | UpdateInvoiceSettingsAction
  | GetClientListAction
  | GetClientDetailAction
  | AddClientAction
  | UpdateClientAction;
