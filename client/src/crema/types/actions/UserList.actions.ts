import { UserList } from '../models/Apps';

export const GET_USER_LIST = 'GET_USER_LIST';

export type GetUserListActions = {
  type: typeof GET_USER_LIST;
  payload: UserList[];
};

export type UserListActions = GetUserListActions;
