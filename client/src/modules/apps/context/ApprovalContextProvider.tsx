import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { ReportType } from "@crema/types/models/dashboards/ReportType";
import { StatusExpenseEnums } from "utils/common-constants.utils";

import { message, notification } from "antd";
import { ReactNode, createContext, useContext, useState } from "react";
import { useIntl } from "react-intl";
import {
  TAM_EXPENSE_APPROVATION_URL,
  TAM_REPORT_STATUS_URL,
} from "utils/end-points.utils";

export type ApprovalContextType = {
  approvals: ReportType[];
  loading: boolean;
  rejectComment: string;
  isReject: boolean;
};

const ContextState: ApprovalContextType = {
  approvals: [],
  loading: false,
  rejectComment: "",
  isReject: false,
};

export type ApprovalActionContextType = {
  reCallAPI: () => void;
  setRejectComment: (data: string) => void;
  setIsReject: (data: boolean) => void;
  handleOnApprovationExpense: (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => void;
  setPage: (data: number) => void;
};

const ApprovalContext = createContext<ApprovalContextType>(ContextState);
const ApprovalActionsContext = createContext<ApprovalActionContextType>({
  reCallAPI: () => {},
  setRejectComment: (data: string) => {},
  setIsReject: (data: boolean) => {},
  handleOnApprovationExpense: (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => {},
  setPage: (data: number) => {},
});

export const useApprovalContext = () => useContext(ApprovalContext);

export const useApprovalActionsContext = () =>
  useContext(ApprovalActionsContext);

type Props = {
  children: ReactNode;
};

export const ApprovalContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [rejectComment, setRejectComment] = useState("");
  const [isReject, setIsReject] = useState(false);
  const [page, setPage] = useState(0);
  const [{ apiData, loading }, { setQueryParams, reCallAPI }] = useGetDataApi<{
    data: ReportType[];
  }>(`${TAM_REPORT_STATUS_URL}/${StatusExpenseEnums.UNDER_APPROVED}`);

  // Functions
  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnApprovationExpense = async (
    expenseId: string,
    status: string,
    rejectComment: string
  ) => {
    await jwtAxios
      .put(
        `${TAM_EXPENSE_APPROVATION_URL}=${status}/expenseId=${expenseId}`,
        { rejectComment }
      )
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
    <ApprovalContext.Provider
      value={{
        approvals: apiData?.data,
        loading,
        rejectComment,
        isReject
      }}
    >
      <ApprovalActionsContext.Provider
        value={{
          reCallAPI,
          setRejectComment,
          handleOnApprovationExpense,
          setPage,
          setIsReject
        }}
      >
        {children}
      </ApprovalActionsContext.Provider>
    </ApprovalContext.Provider>
  );
};

export default ApprovalContextProvider;
