import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { Dropdown, Modal, Space } from "antd";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import {
  MODE_DELETE,
  MODE_EDIT,
  MODE_VIEW,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import { BsSendCheck } from "react-icons/bs";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";
import { VscEye } from "react-icons/vsc";
import { useIntl } from "react-intl";

type Props = {
  expense: ExpenseType;
};

const ExpenseActions = ({ expense }: Props) => {
  // States
  const { messages } = useIntl();
  const { isExpenseDrawerOpen, isAppDrawerOpen } = useExpenseContext();
  const {
    handleOnUpdateStatusExpense,
    handleOnDeleteExpense,
    setExpenseDrawerOpen,
    setAppDrawerOpen,
    handleOnGetExpense,
    setExpense,
    setMode,
    handleOnGetSubCategoriesByCategory,
  } = useExpenseActionsContext();

  // Destructing
  const confirm = Modal.confirm;

  // Init
  const items = [
    {
      key: 1,
      label: (
        <Space wrap>
          <span style={{ fontSize: 14 }} className="tt-expenses-space-center">
            <VscEye className="tt-expenses-primary tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.view" />
          </span>
        </Space>
      ),
    },
    {
      key: 2,
      label: (
        <Space wrap>
          <span style={{ fontSize: 14 }} className="tt-expenses-space-center">
            <BsSendCheck className="tt-expenses-success tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.send" />
          </span>
        </Space>
      ),
      disabled: !(
        expense.status === StatusExpenseEnums.PENDING ||
        expense.status === StatusExpenseEnums.REJECTED
      ),
    },
    {
      key: 3,
      label: (
        <Space wrap>
          <span style={{ fontSize: 14 }} className="tt-expenses-space-center">
            <CiEdit className="tt-expenses-secondary tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.edit" />
          </span>
        </Space>
      ),
      disabled: !(
        expense.status === StatusExpenseEnums.PENDING ||
        expense.status === StatusExpenseEnums.REJECTED
      ),
    },
    {
      key: 4,
      label: (
        <Space wrap>
          <span style={{ fontSize: 14 }} className="tt-expenses-space-center">
            <CiTrash className="tt-expenses-tomato tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.delete" />
          </span>
        </Space>
      ),
      disabled: !(
        expense.status === StatusExpenseEnums.PENDING ||
        expense.status === StatusExpenseEnums.REJECTED
      ),
    },
  ];

  // Functions
  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case "1":
        handleOnViewExpense();
        break;
      case "2":
        confirm({
          title: handleOnGetMessage("common.confirmation"),
          content: handleOnGetMessage("common.modal.expense.confirm.submit"),
          okText: handleOnGetMessage("common.yes"),
          okType: "primary",
          cancelText: handleOnGetMessage("common.no"),
          cancelButtonProps: {
            style: { background: "#d12420", color: "white", border: "none" },
          },
          onOk() {
            handleOnUpdateStatusExpense(
              expense._id,
              StatusExpenseEnums.UNDER_APPROVED
            );
          },
          onCancel() {
            console.log("Cancel");
          },
        });
        break;
      case "3":
        handleOnEditExpense();
        break;
      case "4":
        handleOnCancelExpense();
        break;
      default:
        break;
    }
  };

  // Functions
  const handleOnViewExpense = () => {
    setMode(MODE_VIEW)
    setAppDrawerOpen(!isAppDrawerOpen);
    setExpense({ ...expense, expenseId: expense._id });
  };

  const handleOnEditExpense = () => {
    setMode(MODE_EDIT);
    setAppDrawerOpen(false);
    handleOnGetExpense(expense._id);
    handleOnGetSubCategoriesByCategory(expense.category._id);
    setExpenseDrawerOpen(!isExpenseDrawerOpen);
  };

  const handleOnCancelExpense = () => {
    setMode(MODE_DELETE)
    setAppDrawerOpen(false);
    handleOnDeleteExpense(expense._id);
  };

  // Render
  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]}>
      <AppIconButton icon={<CiCircleMore />} />
    </Dropdown>
  );
};

export default ExpenseActions;
