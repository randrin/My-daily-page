import { AttachmentType } from "./AttachmentType";
import { CategoryType } from "./CategoryType";
import { SubCategoryType } from "./SubCategoryType";
import { UserType } from "./UserType";

export type ExpenseType = {
  _id: string;
  category: CategoryType;
  subcategory: SubCategoryType;
  transaction_date: string;
  approvation_date: string;
  submission_date: string;
  attachments: AttachmentType[];
  receipt: boolean;
  reimburse: boolean;
  amount: number;
  currency: string;
  comments: string;
  status: string;
  employee: UserType;
  approver: UserType;
  createdAt: string;
  updatedAt: string;
  rejects: RejectType[]
};

export type ExpenseCreateType = {
  category: string;
  subcategory: string;
  transaction_date: string;
  attachments: Array<object>;
  receipt: boolean;
  reimburse: boolean;
  amount: number;
  currency: string;
  comments: string;
  status: string;
  employee: UserType;
};

export type RejectType = {
  rejection_comment: string;
  rejection_date: Date;
  rejection_approver: Object;
};