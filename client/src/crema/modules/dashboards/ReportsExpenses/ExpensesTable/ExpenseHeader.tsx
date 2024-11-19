import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import React from "react";
import ExpenseHeaderCheckBox from "./ExpenseHeaderCheckBox";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledExpenseContentHeader,
  StyledExpenseContentItemHeader,
} from "../../index.styled";

type ExpenseHeaderProps = {
  expenses: ExpenseType[];
  checkedExpenses: string[];
  setCheckedExpenses: (expenseIds: string[]) => void;
};

const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({
  expenses,
  checkedExpenses,
  setCheckedExpenses,
}) => {
  // Render
  return (
    <StyledExpenseContentHeader>
      <ExpenseHeaderCheckBox
        expenses={expenses}
        checkedExpenses={checkedExpenses}
        setCheckedExpenses={setCheckedExpenses}
      />
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.attachments" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.category" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.subcategory" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.transaction.date" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.submission.date" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.employee" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.approvation.date" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.approver" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.status" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.amount" />}</span>
      </StyledExpenseContentItemHeader>
      <StyledExpenseContentItemHeader>
        <span>{<IntlMessages id="common.actions" />}</span>
      </StyledExpenseContentItemHeader>
    </StyledExpenseContentHeader>
  );
};

export default ExpenseHeader;
