import { CheckCircleOutlined, PlusOutlined } from "@ant-design/icons";
import AppCard from "@crema/components/AppCard";
import AppPageMeta from "@crema/components/AppPageMeta";
import { countries } from "@crema/constants/AppConst";
import LegendExpenseStatus from "@crema/core/components/commons/LegendExpenseStatus";
import IntlMessages from "@crema/helpers/IntlMessages";
import ExpenseTable from "@crema/modules/dashboards/ReportsExpenses/ExpensesTable";
import { useJWTAuth } from "@crema/services/auth/jwt-auth/JWTAuthProvider";
import { Button, Col, Modal, Row } from "antd";
import dayjs from "dayjs";
import CategoryContextProvider from "modules/apps/context/CategoryContextProvider";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import {
  StyledContent,
  StyledDetailReportContainer,
} from "modules/dashboards/index.styled";
import { StyledTitle5 } from "modules/ecommerce/Admin/index.styled";
import { StyledOrderFooterPagination } from "modules/ecommerce/Orders/index.styled";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FORMAT_DATE_THREE,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useIntl } from "react-intl";
import AddExpense from "../addExpense";

const DetailReport = () => {
  // Context
  const { user } = useJWTAuth();
  const {
    users,
    expenses,
    loading,
    expense,
    isExpenseDrawerOpen,
    report,
    mode,
    checkedExpenses,
  } = useExpenseContext();
  const {
    setExpenseDrawerOpen,
    handleOnSubmitExpense,
    handleOnUpdateMassiveExpenses,
    handleOnUpdateExpense,
    setExpense,
    handleOnGetReport,
  } = useExpenseActionsContext();
  const { query } = useRouter();
  const { all } = query;

  // States
  const [page, setPage] = useState(0);

  // Desctruction
  const { messages } = useIntl();
  const { confirm } = Modal;

  // Init
  useEffect(() => {
    if (all) {
      handleOnGetReport(all[0]);
      setExpense({
        ...expense,
        reportId: all[0],
      });
    }
  }, [all]);

  // Functions
  const onChange = (page: number) => {
    setPage(page);
  };

  const handleOnAddExpense = () => {
    setExpenseDrawerOpen(!isExpenseDrawerOpen);
    setExpense({
      reportId: all[0],
      employee: user._id,
      transaction_date: dayjs(
        moment(new Date()).format(FORMAT_DATE_THREE),
        FORMAT_DATE_THREE
      ),
      currency: "FCFA",
      reimburse: "Yes",
    });
  };

  const handleOnSaveExpense = (status: string) => {
    handleOnSubmitExpense(status);
  };

  const handleOnEditExpense = (status: string) => {
    handleOnUpdateExpense(expense.expenseId, status, expense);
    setExpenseDrawerOpen(!isExpenseDrawerOpen);
  };

  const handleOnDenyExpense = () => {
    setExpenseDrawerOpen(!isExpenseDrawerOpen);
    setExpense({});
  };

  const handleOnGetMessage = (message: string) => {
    return messages[message] as string;
  };

  const handleOnConfirmSubmitExpenses = () => {
    confirm({
      title: handleOnGetMessage("common.confirmation"),
      content: handleOnGetMessage("common.modal.expenses.confirm.content"),
      okText: handleOnGetMessage("common.yes"),
      okType: "primary",
      cancelButtonProps: {
        style: { background: "#d12420", color: "white", border: "none" },
      },
      cancelText: handleOnGetMessage("common.no"),
      onOk() {
        handleOnUpdateMassiveExpenses(StatusExpenseEnums.UNDER_APPROVED);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // Render
  return (
    <>
      <AppPageMeta
        title={messages["sidebar.app.dashboard.expenses.detail"] as string}
      />
      <StyledContent>
        <StyledTitle5 className="tt_detail-expense-box">
          <Link href={"/dashboards/expenses"} className="btn">
            <IoMdArrowBack size={25} />
          </Link>
          {messages["sidebar.app.dashboard.expenses.detail"] as string}
        </StyledTitle5>
      </StyledContent>
      <StyledDetailReportContainer>
        <Row>
          <Col className="tt_detail-expense-left" xs={12} lg={12}>
            <div className="tt_detail-expense">
              <span className="tt_detail-expense-description">
                {messages["common.title"] as string}
              </span>
              <span className="tt_detail-expense-value">{report?.title}</span>
            </div>
            <div className="tt_detail-expense">
              <span className="tt_detail-expense-description">
                {messages["common.code"] as string}
              </span>
              <span className="tt_detail-expense-value">{report?.code}</span>
            </div>
            <div className="tt_detail-expense">
              <span className="tt_detail-expense-description">
                {messages["common.employee"] as string}
              </span>
              <span className="tt_detail-expense-value">
                {report?.employee?.displayName}
              </span>
            </div>
            <div className="tt_detail-expense">
              <span className="tt_detail-expense-description">
                {messages["common.country"] as string}
              </span>
              <span className="tt_detail-expense-value">{report?.country}</span>
            </div>
          </Col>
          <Col className="tt_detail-expense-right" xs={12} lg={12}>
            <div className="tt_detail-expense">
              <span className="tt_detail-expense-description">
                {messages["common.total.amount"] as string}
              </span>
              <span className="tt_detail-expense-value">
                {report?.expenses
                  .map((expense) => expense.amount)
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}{" "}
                {
                  countries.find((country) => country.name === report?.country)
                    ?.currency
                }
              </span>
            </div>
          </Col>
        </Row>
      </StyledDetailReportContainer>
      <div className="tt-expenses-space-between">
        <StyledContent>
          <Button type="primary" className="btn" onClick={handleOnAddExpense}>
            <PlusOutlined /> <IntlMessages id="common.expense" />
          </Button>
        </StyledContent>
        <StyledContent>
          <LegendExpenseStatus />
        </StyledContent>
        <StyledContent>
          <Button
            type="default"
            className="btn tt-expenses-background-success"
            disabled={!checkedExpenses.length}
            onClick={handleOnConfirmSubmitExpenses}
          >
            <CheckCircleOutlined />{" "}
            <IntlMessages id="dashboard.expense.submit" />
          </Button>
        </StyledContent>
      </div>
      <AppCard>
        <ExpenseTable expenseData={report?.expenses || []} loading={loading} />
      </AppCard>
      <StyledOrderFooterPagination
        pageSize={10}
        count={expenses?.length}
        page={page}
        onChange={onChange}
      />
      <CategoryContextProvider>
        <AddExpense
          mode={mode}
          users={users}
          expense={expense}
          handleOnDenyExpense={handleOnDenyExpense}
          handleOnSubmitExpense={handleOnSaveExpense}
          handleOnEditExpense={handleOnEditExpense}
          loading={loading}
          setExpense={setExpense}
          isExpenseDrawerOpen={isExpenseDrawerOpen}
        />
      </CategoryContextProvider>
    </>
  );
};

export default DetailReport;
