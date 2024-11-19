import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { StatusExpenseEnums } from "utils/common-constants.utils";

type CheckBoxProps = {
  expenses: ExpenseType[];
  checkedExpenses: string[];
  setCheckedExpenses: (expenseIds: string[]) => void;
};

const ExpenseHeaderCheckBox: React.FC<CheckBoxProps> = ({
  expenses,
  checkedExpenses,
  setCheckedExpenses,
}) => {
  // States

  // Functions
  const onHandleMasterCheckbox = (event: CheckboxChangeEvent) => {
    if (event.target.checked) {
      const expenseIds = expenses
        ?.filter((expense) => expense.status === StatusExpenseEnums.PENDING)
        .map((expense) => expense._id);
      setCheckedExpenses(expenseIds);
    } else {
      setCheckedExpenses([]);
    }
  };

  // Render
  return (
    <Checkbox
      indeterminate={
        checkedExpenses.length > 0 && checkedExpenses.length < expenses?.length
      }
      checked={
        expenses?.length > 0 && checkedExpenses.length === expenses?.length
      }
      onChange={onHandleMasterCheckbox}
    />
  );
};

export default ExpenseHeaderCheckBox;
