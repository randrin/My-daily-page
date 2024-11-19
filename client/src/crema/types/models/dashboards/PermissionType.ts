import { UserType } from "./UserType";

export type PermissionType = {
  _id: string;
  code: string;
  description: string;
  status: string;
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};
