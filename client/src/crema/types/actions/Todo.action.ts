import {
  FolderObjType,
  LabelObjType,
  PriorityObjType,
  StaffObjType,
  TodoObjType,
} from '../models/apps/Todo';

export const CREATE_NEW_TASK = 'CREATE_NEW_TASK';
export const GET_TASK_DETAIL = 'GET_TASK_DETAIL';
export const GET_TASK_LIST = 'GET_TASK_LIST';
export const GET_TODO_FOLDER_LIST = 'GET_TODO_FOLDER_LIST';
export const GET_TODO_LABEL_LIST = 'GET_TODO_LABEL_LIST';
export const GET_TODO_PRIORITY_LIST = 'GET_TODO_PRIORITY_LIST';
export const GET_TODO_STAFF_LIST = 'GET_TODO_STAFF_LIST';
export const GET_TODO_STATUS_LIST = 'GET_TODO_STATUS_LIST';
export const TOGGLE_TODO_DRAWER = 'TOGGLE_TODO_DRAWER';
export const UPDATE_TASK_DETAIL = 'UPDATE_TASK_DETAIL';
export const UPDATE_TASK_FOLDER = 'UPDATE_TASK_FOLDER';
export const UPDATE_TASK_LABEL = 'UPDATE_TASK_LABEL';
export const UPDATE_TASK_STARRED_STATUS = 'UPDATE_TASK_STARRED_STATUS';

export type CreateNewTaskActions = {
  type: typeof CREATE_NEW_TASK;
  payload: TodoObjType;
};

export type GetTaskDetailActions = {
  type: typeof GET_TASK_DETAIL;
  payload: TodoObjType;
};

export type GetTaskListActions = {
  type: typeof GET_TASK_LIST;
  payload: {
    list: TodoObjType[];
    total: number;
  };
};

export type GetTodoFolderListAction = {
  type: typeof GET_TODO_FOLDER_LIST;
  payload: FolderObjType[];
};

export type GetTodoLabelListAction = {
  type: typeof GET_TODO_LABEL_LIST;
  payload: LabelObjType[];
};

export type GetTodoPriorityListAction = {
  type: typeof GET_TODO_PRIORITY_LIST;
  payload: PriorityObjType[];
};

export type GetTodoStaffListAction = {
  type: typeof GET_TODO_STAFF_LIST;
  payload: StaffObjType[];
};

export type ToggleTodoDrawerActions = {
  type: typeof TOGGLE_TODO_DRAWER;
};

export type UpdateTaskDetailAction = {
  type: typeof UPDATE_TASK_DETAIL;
  payload: TodoObjType;
};

export type UpdateTodoFolderAction = {
  type: typeof UPDATE_TASK_FOLDER;
  payload: { list: TodoObjType[]; total: number };
};

export type UpdateTodoLabelAction = {
  type: typeof UPDATE_TASK_LABEL;
  payload: TodoObjType[];
};

export type UpdateTaskStaredAction = {
  type: typeof UPDATE_TASK_STARRED_STATUS;
  payload: { data: TodoObjType[]; folderName: string };
};

export type GetTaskListStatusAction = {
  type: typeof GET_TODO_STATUS_LIST;
  payload: TodoObjType;
};

export type TaskActions =
  | CreateNewTaskActions
  | GetTaskDetailActions
  | GetTaskListActions
  | GetTodoFolderListAction
  | GetTodoLabelListAction
  | GetTodoPriorityListAction
  | GetTodoStaffListAction
  | ToggleTodoDrawerActions
  | UpdateTaskDetailAction
  | UpdateTodoFolderAction
  | UpdateTodoLabelAction
  | GetTaskListStatusAction
  | UpdateTaskStaredAction;
