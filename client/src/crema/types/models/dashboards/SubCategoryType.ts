import { UserType } from "./UserType";
import { CategoryType } from "./CategoryType";

export type SubCategoryType = {
  _id: string;
  title: string;
  description: string;
  category: CategoryType;
  status: string;
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
};
