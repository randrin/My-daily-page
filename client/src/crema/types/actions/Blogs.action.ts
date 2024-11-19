import { BlogType, BlogDetailType } from '../models/extrapages/Blog';

export const GET_BLOGS_LIST = 'GET_BLOGS_LIST';
export const GET_BLOGS_DETAIL = 'GET_BLOGS_DETAIL';
export const ADD_NEW_BLOG = 'ADD_NEW_BLOG';
export const EDIT_BLOG = 'EDIT_BLOG';

export type GetBlogAction = {
  type: typeof GET_BLOGS_LIST;
  payload: BlogType;
};

export type GetBlogDetailAction = {
  type: typeof GET_BLOGS_DETAIL;
  payload: BlogDetailType;
};

export type AddBlogAction = {
  type: typeof ADD_NEW_BLOG;
  payload: BlogType;
};
export type UpdateBlogAction = {
  type: typeof EDIT_BLOG;
  payload: BlogType;
};

export type BlogActionTypes =
  | GetBlogAction
  | GetBlogDetailAction
  | AddBlogAction
  | UpdateBlogAction;
