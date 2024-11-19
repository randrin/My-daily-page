import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import { AttachmentType } from "@crema/types/models/dashboards/AttachmentType";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { Image } from "antd";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import { useState } from "react";
import { useIntl } from "react-intl";
import ExpenseHeader from "./ExpenseHeader";
import ExpenseListItem from "./ExpenseListItem";
import ExpenseView from "./ExpenseView";
import { MODE_VIEW } from "utils/common-constants.utils";

type Props = {
  expenseData: ExpenseType[];
  loading: boolean;
};

const ExpenseTable = ({ expenseData, loading }: Props) => {
  // States
  const {
    setExpense,
    setAppDrawerOpen,
    setExpenseDrawerOpen,
    setCheckedExpenses,
  } = useExpenseActionsContext();
  const {
    mode,
    isExpenseDrawerOpen,
    expense,
    isAppDrawerOpen,
    checkedExpenses,
  } = useExpenseContext();
  const { messages } = useIntl();
  const [isShowExpenses, setIsShowExpenses] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);

  // Init

  // Functions
  const onChangeCheckedExpenses = (checked: any, id: string) => {
    if (checked) {
      setCheckedExpenses(checkedExpenses.concat(id));
    } else {
      setCheckedExpenses(
        checkedExpenses.filter((expenseId) => expenseId !== id)
      );
    }
  };

  const onViewExpenseDetail = (expense: ExpenseType) => {
    setExpense(expense);
    console.log(mode);

    if (mode === MODE_VIEW) {
      setAppDrawerOpen(!isAppDrawerOpen);
    }
  };

  console.log(checkedExpenses);
  console.log("expense: ", expense.status);

  // Render
  return (
    <>
      <AppsHeader>
        <ExpenseHeader
          expenses={expenseData}
          checkedExpenses={checkedExpenses}
          setCheckedExpenses={setCheckedExpenses}
        />
      </AppsHeader>
      <AppsContent>
        <AppList
          data={expenseData.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )}
          ListEmptyComponent={
            <ListEmptyResult
              loading={loading}
              actionTitle={messages["common.create.expense"] as string}
              onClick={() => setExpenseDrawerOpen(!isExpenseDrawerOpen)}
            />
          }
          renderItem={(expense) => (
            <ExpenseListItem
              key={expense._id}
              expense={expense}
              onChangeCheckedExpenses={onChangeCheckedExpenses}
              checkedExpenses={checkedExpenses}
              onViewExpenseDetail={onViewExpenseDetail}
            />
          )}
        />
      </AppsContent>
      {isAppDrawerOpen && (
        <ExpenseView
          expense={expense}
          isAppDrawerOpen={isAppDrawerOpen}
          setAppDrawerOpen={setAppDrawerOpen}
        />
      )}
      {isShowExpenses && (
        <>
          {attachments?.map((image, index) => (
            <Image
              key={index}
              alt={image.public_id}
              style={{ display: "none" }}
              preview={{
                visible: isShowExpenses,
                scaleStep: 0.5,
                src: image.url,
                onVisibleChange: (value) => {
                  setIsShowExpenses(!isShowExpenses);
                },
              }}
            />
          ))}
        </>
      )}
    </>
  );
};

export default ExpenseTable;
