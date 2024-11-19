import { PermissionType } from "./PermissionType";
import { UserType } from "./UserType";

export type RoleType = {
  _id: string;
  title: string;
  description: string;
  permissions: PermissionType[];
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};
