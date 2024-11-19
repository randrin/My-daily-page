import { AttachmentType } from "./AttachmentType";
import { ExpenseType } from "./ExpenseType";
import { UserType } from "./UserType";

export type ReportType = {
  _id: string;
  title: string;
  code: string;
  status: string;
  employee: UserType;
  approver: UserType;
  country: string;
  expenses: ExpenseType[];
  reimburse: number;
  transaction_date: string;
  submission_date: string;
  approval_date: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportExpenseType = {
  report: ReportType;
  expense: ExpenseType;
};
