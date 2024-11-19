import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { Dropdown, Modal, Space } from "antd";
import {
  useAccountingActionsContext,
  useAccountingContext,
} from "modules/apps/context/AccountingContextProvider";
import { StatusExpenseEnums } from "utils/common-constants.utils";
import { CiCircleMore } from "react-icons/ci";
import { FaCheck, FaChevronLeft } from "react-icons/fa";
import { VscEye } from "react-icons/vsc";
import { useIntl } from "react-intl";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "../../../../../modules/apps/context/ExpenseContextProvider";

type Props = {
  expense: ExpenseType;
};

const AccountingActions = ({ expense }: Props) => {
  // States
  const { messages } = useIntl();
  const confirm = Modal.confirm;
  const { rejectComment, isReject } = useAccountingContext();
  const { handleOnAccountingExpense, setIsReject } =
    useAccountingActionsContext();
  const { setAppDrawerOpen, setExpense } = useExpenseActionsContext();
  const { isAppDrawerOpen } = useExpenseContext();

  // Destructing

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
            <FaCheck className="tt-expenses-success tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.accept" />
          </span>
        </Space>
      ),
    },
    {
      key: 3,
      label: (
        <Space wrap>
          <span style={{ fontSize: 14 }} className="tt-expenses-space-center">
            <FaChevronLeft className="tt-expenses-tomato tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.reject" />
          </span>
        </Space>
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
          cancelButtonProps: {
            style: { background: "#d12420", color: "white", border: "none" },
          },
          cancelText: handleOnGetMessage("common.no"),
          onOk() {
            handleOnAccountingExpense(
              expense._id,
              StatusExpenseEnums.VALID,
              rejectComment
            );
          },
          onCancel() {
            console.log("Cancel");
          },
        });
        break;
      case "3":
        handleOnRejectExpense();
        break;
      default:
        break;
    }
  };

  const handleOnRejectExpense = () => {
    setIsReject(!isReject);
    setExpense({ ...expense, expenseId: expense._id });
  };

  const handleOnViewExpense = () => {
    setAppDrawerOpen(!isAppDrawerOpen);
    setExpense({ ...expense, expenseId: expense._id });
  };

  // Render
  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]}>
      <AppIconButton icon={<CiCircleMore />} />
    </Dropdown>
  );
};
export default AccountingActions;
