import { UserType } from "./UserType";

export type CategoryType = {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};
