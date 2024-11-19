import { useGetDataApi } from "@crema/hooks/APIHooks";
import { ReportType } from "@crema/types/models/dashboards/ReportType";
import { StatusExpenseEnums } from "utils/common-constants.utils";
import {
  TAM_EXPENSE_APPROVATION_URL,
  TAM_REPORT_STATUS_URL,
} from "utils/end-points.utils";
import { ReactNode, createContext, useContext, useState } from "react";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { useIntl } from "react-intl";
import { message, notification } from "antd";

export type AccountingContextType = {
  accountings: ReportType[];
  loading: boolean;
  rejectComment: string;
  isReject: boolean;
};

const ContextState: AccountingContextType = {
  accountings: [],
  loading: false,
  rejectComment: "",
  isReject: false,
};

export type AccountingActionContextType = {
  reCallAPI: () => void;
  setRejectComment: (data: string) => void;
  setIsReject: (data: boolean) => void;
  handleOnAccountingExpense: (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => void;
  setPage: (data: number) => void;
};

const AccountingContext = createContext<AccountingContextType>(ContextState);
const AccountingActionsContext = createContext<AccountingActionContextType>({
  reCallAPI: () => {},
  setRejectComment: (data: string) => {},
  setIsReject: (data: boolean) => {},
  handleOnAccountingExpense: (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => {},
  setPage: (data: number) => {},
});

export const useAccountingContext = () => useContext(AccountingContext);

export const useAccountingActionsContext = () =>
  useContext(AccountingActionsContext);

type Props = {
  children: ReactNode;
};

export const AccountingContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [page, setPage] = useState(0);
  const [rejectComment, setRejectComment] = useState("");
  const [isReject, setIsReject] = useState(false);
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: ReportType[];
  }>(`${TAM_REPORT_STATUS_URL}/${StatusExpenseEnums.ACCOUNTING}`);

  // Functions
  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnAccountingExpense = async (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => {
    await jwtAxios
      .put(`${TAM_EXPENSE_APPROVATION_URL}=${status}/expenseId=${expenseId}`, {
        rejectComment,
      })
      .then(({ data }) => {
        reCallAPI();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
        setIsReject(false);
        setRejectComment("");
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  // Render
  return (
    <AccountingContext.Provider
      value={{
        accountings: apiData?.data,
        loading,
        rejectComment,
        isReject
      }}
    >
      <AccountingActionsContext.Provider
        value={{
          reCallAPI,
          setRejectComment,
          handleOnAccountingExpense,
          setPage,
          setIsReject
        }}
      >
        {children}
      </AccountingActionsContext.Provider>
    </AccountingContext.Provider>
  );
};

export default AccountingContextProvider;
