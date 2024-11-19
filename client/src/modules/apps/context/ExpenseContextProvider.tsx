import { useGetDataApi } from "@crema/hooks/APIHooks";
import jwtAxios from "@crema/services/auth/jwt-auth";
import { ExpenseType } from "@crema/types/models/dashboards/ExpenseType";
import { ReportType } from "@crema/types/models/dashboards/ReportType";
import { SubCategoryType } from "@crema/types/models/dashboards/SubCategoryType";
import { UserType } from "@crema/types/models/dashboards/UserType";
import { Modal, message, notification } from "antd";
import { ReactNode, createContext, useContext, useState } from "react";
import { useIntl } from "react-intl";
import {
  MODE_ADD,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import {
  TAM_EXPENSES_URL,
  TAM_EXPENSE_CREATE_URL,
  TAM_EXPENSE_DELETE_URL,
  TAM_EXPENSE_MASSIVE_UPDATE_URL,
  TAM_EXPENSE_STATUS_URL,
  TAM_EXPENSE_UPDATE_URL,
  TAM_REPORTS_URL,
  TAM_REPORT_CREATE_URL,
  TAM_REPORT_DELETE_URL,
  TAM_REPORT_UPDATE_URL,
  TAM_SUB_CATEGORIES_BY_CATEGORY_URL,
  TAM_USERS_URL,
} from "utils/end-points.utils";

export type ExpenseContextType = {
  users: UserType[];
  reports: ReportType[];
  expenses: ExpenseType[];
  subcategories: SubCategoryType[];
  loading: boolean;
  isReportDrawerOpen: boolean;
  isExpenseDrawerOpen: boolean;
  isAppDrawerOpen: boolean;
  checkedExpenses: string[];
  report: any;
  expense: any;
  mode: string;
};

const ContextState: ExpenseContextType = {
  users: [],
  reports: [],
  expenses: [],
  subcategories: [],
  loading: false,
  isReportDrawerOpen: false,
  isExpenseDrawerOpen: false,
  isAppDrawerOpen: false,
  checkedExpenses: [],
  report: {},
  expense: {},
  mode: MODE_ADD,
};

export type ExpenseActionContextType = {
  //setQueryParams: (data: object) => void;
  handleOnSubmitReport: () => void;
  handleOnSubmitExpense: (status: string) => void;
  handleOnUpdateMassiveExpenses: (status: string) => void;
  handleOnGetSubCategoriesByCategory: (category: string) => void;
  setReport: (data: object) => void;
  setExpense: (data: object) => void;
  setReportDrawerOpen: (data: boolean) => void;
  setExpenseDrawerOpen: (data: boolean) => void;
  setAppDrawerOpen: (data: boolean) => void;
  setCheckedExpenses: (data: string[]) => void;
  handleOnGetReport: (reportId: string) => void;
  handleOnGetExpense: (expenseId: string) => void;
  handleOnUpdateReport: (reportId: string, data: object) => void;
  handleOnUpdateExpense: (
    expenseId: string,
    status: string,
    data: object
  ) => void;
  handleOnUpdateStatusExpense: (expenseId: string, status: string) => void;
  handleOnDeleteReport: (reportId: string) => void;
  handleOnDeleteExpense: (expenseId: string) => void;
  onPageChange: (data: number) => void;
  reCallAPIReports: () => void;
  reCallAPIExpenses: () => void;
  setPage: (data: number) => void;
  setMode: (data: string) => void;
};

const ExpenseContext = createContext<ExpenseContextType>(ContextState);
const ExpenseActionsContext = createContext<ExpenseActionContextType>({
  //setQueryParams: (data: object) => {},
  handleOnSubmitReport: () => {},
  handleOnSubmitExpense: (status: string) => {},
  handleOnUpdateMassiveExpenses: (status: string) => {},
  handleOnGetSubCategoriesByCategory: (category: string) => {},
  setReport: (data: object) => {},
  setExpense: (data: object) => {},
  setReportDrawerOpen: (data: boolean) => {},
  setExpenseDrawerOpen: (data: boolean) => {},
  setAppDrawerOpen: (data: boolean) => {},
  setCheckedExpenses: (data: string[]) => {},
  handleOnGetReport: (reportId: string) => {},
  handleOnUpdateReport: (reportId: string, data: object) => {},
  handleOnUpdateExpense: (
    expenseId: string,
    status: string,
    data: object
  ) => {},
  handleOnUpdateStatusExpense: (expenseId: string, status: string) => {},
  handleOnDeleteReport: (reportId: string) => {},
  handleOnDeleteExpense: (expenseId: string) => {},
  handleOnGetExpense: (expenseId: string) => {},
  onPageChange: (data: number) => {},
  reCallAPIReports: () => {},
  reCallAPIExpenses: () => {},
  setPage: (data: number) => {},
  setMode: (data: string) => {},
});

export const useExpenseContext = () => useContext(ExpenseContext);

export const useExpenseActionsContext = () => useContext(ExpenseActionsContext);

type Props = {
  children: ReactNode;
};

export const ExpenseContextProvider = ({ children }: Props) => {
  // States
  const { messages } = useIntl();
  const [mode, setMode] = useState(MODE_ADD);
  const [page, setPage] = useState(0);
  const [isReportDrawerOpen, setReportDrawerOpen] = useState(false);
  const [isExpenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const [checkedExpenses, setCheckedExpenses] = useState<string[]>([]);
  const [report, setReport] = useState({
    reportId: "",
    employee: "",
    title: "",
    country: "",
    code: "",
    expenses: [],
  });
  const [expense, setExpense] = useState({
    reportId: "",
    expenseId: "",
    employee: "",
    category: "",
    subcategory: "",
    status: StatusExpenseEnums.PENDING,
    attachments: [],
    amount: "",
    currency: "FCFA",
    receipt: "",
    reimburse: "Yes",
    comments: "",
    transaction_date: "",
  });
  const [subcategories, setSubcategories] = useState<SubCategoryType[]>([]);
  const [{ apiData: users }] = useGetDataApi<{
    data: UserType[];
  }>(TAM_USERS_URL);
  const [{ apiData: reports, loading }, { reCallAPI: reCallAPIReports }] =
    useGetDataApi<{ data: ReportType[] }>(TAM_REPORTS_URL);
  const [
    { apiData: expenses },
    { setQueryParams, reCallAPI: reCallAPIExpenses },
  ] = useGetDataApi<{
    data: ExpenseType[];
  }>(TAM_EXPENSES_URL);

  // Destructing
  const confirm = Modal.confirm;

  // Functions
  const handleOnGetSubCategoriesByCategory = async (category: string) => {
    setExpense({ ...expense, category: category, subcategory: "" });
    await jwtAxios
      .get(`${TAM_SUB_CATEGORIES_BY_CATEGORY_URL}/${category}`)
      .then(({ data }) => {
        setSubcategories(data.data);
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message[0]);
      });
  };
  const handleOnSubmitReport = async () => {
    await jwtAxios
      .post(TAM_REPORT_CREATE_URL, report)
      .then(({ data }) => {
        resetReport();
        reCallAPIReports();
        setReportDrawerOpen(false);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.add.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnSubmitExpense = async (status: string) => {
    await jwtAxios
      .post(`${TAM_EXPENSE_CREATE_URL}/${status}`, expense)
      .then(({ data }) => {
        resetExpense();
        handleOnGetReport(expense.reportId);
        setExpenseDrawerOpen(false);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.add.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnUpdateMassiveExpenses = async (status: string) => {
    console.log(status, checkedExpenses);

    await jwtAxios
      .put(
        `${TAM_EXPENSE_MASSIVE_UPDATE_URL}/status/${status}`,
        checkedExpenses
      )
      .then(({ data }) => {
        setCheckedExpenses([]);
        handleOnGetReport(expense.reportId);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const resetExpense = () => {
    setExpense({
      reportId: "",
      expenseId: "",
      employee: "",
      category: "",
      subcategory: "",
      status: StatusExpenseEnums.PENDING,
      attachments: [],
      amount: "",
      currency: "FCFA",
      receipt: "",
      reimburse: "Yes",
      comments: "",
      transaction_date: "",
    });
  };

  const resetReport = () => {
    setReport({
      reportId: "",
      employee: "",
      title: "",
      country: "",
      code: "",
      expenses: [],
    });
  };
  
  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnGetReport = async (reportId: string) => {
    await jwtAxios
      .get(`${TAM_REPORTS_URL}/${reportId}`)
      .then(({ data }) => {
        setReport({
          reportId: data.report._id,
          ...data.report,
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnUpdateReport = async (reportId: string, report: Object) => {
    await jwtAxios
      .put(`${TAM_REPORT_UPDATE_URL}/${reportId}`, report)
      .then(({ data }) => {
        resetReport();
        reCallAPIReports();
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnUpdateExpense = async (
    expenseId: string,
    status: string,
    expense: Object
  ) => {
    await jwtAxios
      .put(`${TAM_EXPENSE_UPDATE_URL}/${expenseId}/status/${status}`, expense)
      .then(({ data }) => {
        resetExpense();
        handleOnGetReport(report.reportId);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnGetExpense = async (expenseId: string) => {
    await jwtAxios
      .get(`${TAM_EXPENSES_URL}/${expenseId}`, expense)
      .then(({ data }) => {
        setExpense({
          reportId: report.reportId,
          expenseId: data.expense._id,
          ...data.expense,
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnDeleteReport = async (reportId: string) => {
    confirm({
      title: handleOnGetMessage("common.modal.confirm.delete.title"),
      content: handleOnGetMessage("common.modal.confirm.delete.content"),
      okText: handleOnGetMessage("common.yes"),
      okType: "primary",
      cancelButtonProps: {
        style: { background: "#d12420", color: "white", border: "none" },
      },
      cancelText: handleOnGetMessage("common.no"),
      async onOk() {
        await jwtAxios
          .delete(`${TAM_REPORT_DELETE_URL}/${reportId}`)
          .then(({ data }) => {
            reCallAPIReports();
            // TODO: create a custom component notification
            notification.success({
              message: handleOnGetMessage("common.success"),
              description: handleOnGetMessage(
                "common.notification.delete.description"
              ),
            });
          })
          .catch((error: any) => {
            console.log("Error: ", error);
            message.error(error.response.data.message || error.response.data.message[0]);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const handleOnUpdateStatusExpense = async (
    expenseId: string,
    status: string
  ) => {
    await jwtAxios
      .put(`${TAM_EXPENSE_STATUS_URL}=${status}/expenseId=${expenseId}`)
      .then(({ data }) => {
        handleOnGetReport(report.reportId);
        // TODO: create a custom component notification
        notification.success({
          message: handleOnGetMessage("common.success"),
          description: handleOnGetMessage(
            "common.notification.update.description"
          ),
        });
      })
      .catch((error: any) => {
        console.log("Error: ", error);
        message.error(error.response.data.message || error.response.data.message[0]);
      });
  };

  const handleOnDeleteExpense = async (expenseId: string) => {
    confirm({
      title: handleOnGetMessage("common.modal.confirm.delete.title"),
      content: handleOnGetMessage("common.modal.confirm.delete.content"),
      okText: handleOnGetMessage("common.yes"),
      okType: "primary",
      cancelButtonProps: {
        style: { background: "#d12420", color: "white", border: "none" },
      },
      cancelText: handleOnGetMessage("common.no"),
      async onOk() {
        await jwtAxios
          .delete(`${TAM_EXPENSE_DELETE_URL}/${expenseId}`)
          .then(({ data }) => {
            handleOnGetReport(report.reportId);
            // TODO: create a custom component notification
            notification.success({
              message: handleOnGetMessage("common.success"),
              description: handleOnGetMessage(
                "common.notification.delete.description"
              ),
            });
          })
          .catch((error: any) => {
            console.log("Error: ", error);
            message.error(error.response.data.message || error.response.data.message[0]);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };
  const onPageChange = (value: number) => {
    setPage(value);
  };
  
  // Render
  return (
    <ExpenseContext.Provider
      value={{
        users: users?.data,
        reports: reports?.data,
        expenses: expenses?.data,
        subcategories,
        loading,
        isReportDrawerOpen,
        isExpenseDrawerOpen,
        isAppDrawerOpen,
        checkedExpenses,
        report,
        expense,
        mode,
      }}
    >
      <ExpenseActionsContext.Provider
        value={{
          handleOnSubmitReport,
          handleOnSubmitExpense,
          handleOnUpdateMassiveExpenses,
          handleOnGetSubCategoriesByCategory,
          handleOnUpdateStatusExpense,
          setReport,
          setExpense,
          setReportDrawerOpen,
          setExpenseDrawerOpen,
          setAppDrawerOpen,
          setCheckedExpenses,
          handleOnGetReport,
          handleOnGetExpense,
          onPageChange,
          handleOnUpdateReport,
          handleOnUpdateExpense,
          handleOnDeleteReport,
          handleOnDeleteExpense,
          reCallAPIReports,
          reCallAPIExpenses,
          setPage,
          setMode,
        }}
      >
        {children}
      </ExpenseActionsContext.Provider>
    </ExpenseContext.Provider>
  );
};

export default ExpenseContextProvider;
