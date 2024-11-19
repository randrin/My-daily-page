import { CategoryType } from "./CategoryType";
import { ExpenseType } from "./ExpenseType";
import { OrganizationType } from "./OrganizationType";
import { ReportType } from "./ReportType";
import { RoleType } from "./RoleType";
import { SubCategoryType } from "./SubCategoryType";
import { UserType } from "./UserType";

export type DashboardType = {
  users: UserType[];
  roles: RoleType[];
  organizations: OrganizationType[];
  categories: CategoryType[];
  subcategories: SubCategoryType[];
  expenses: ExpenseType[];
  reports: ReportType[];
};
