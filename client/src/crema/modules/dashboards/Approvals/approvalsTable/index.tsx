import {
  ReportExpenseType,
  ReportType,
} from "@crema/types/models/dashboards/ReportType";
import {
  Avatar,
  Button,
  Col,
  Input,
  Modal,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { NextRouter, useRouter } from "next/router";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  StatusExpenseEnums,
} from "utils/common-constants.utils";
import {
  Tt_FormatDate,
  Tt_GetUserAvatar,
} from "utils/common-functions.utils";
import { FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { IoMdAttach } from "react-icons/io";
import { MdOutlineMoreHoriz } from "react-icons/md";
import {
  StyledFlex,
  StyledObjectTable,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import ApprovalActions from "./ApprovalActions";
import IntlMessages from "@crema/helpers/IntlMessages";
import ExpenseView from "../../ReportsExpenses/ExpensesTable/ExpenseView";
import {
  useExpenseActionsContext,
  useExpenseContext,
} from "modules/apps/context/ExpenseContextProvider";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { StyledRequiredField } from "modules/dashboards/index.styled";
import {
  useApprovalActionsContext,
  useApprovalContext,
} from "modules/apps/context/ApprovalContextProvider";

const getStatusExpense = (status: string) => {
  switch (status) {
    case StatusExpenseEnums.VALID: {
      return (
        <span className="tt-expenses-success">
          <FaCheck />
        </span>
      );
    }
    case StatusExpenseEnums.REJECTED: {
      return (
        <span className="tt-expenses-tomato">
          <FaChevronLeft />
        </span>
      );
    }
    case StatusExpenseEnums.PENDING: {
      return (
        <span className="tt-expenses-warning">
          <MdOutlineMoreHoriz />
        </span>
      );
    }
    case StatusExpenseEnums.UNDER_APPROVED: {
      return (
        <span className="tt-expenses-primary">
          <FaChevronRight />
        </span>
      );
    }
    case StatusExpenseEnums.ACCOUNTING: {
      return (
        <span className="tt-expenses-secondary">
          <FaMoneyBillTransfer />
        </span>
      );
    }
  }
};

type Props = {
  reportData: ReportType[];
  loading: boolean;
};

const ApprovalTable = ({ reportData, loading }: Props) => {
  // States
  const router = useRouter();
  const { isAppDrawerOpen, expense } = useExpenseContext();
  const { setAppDrawerOpen } = useExpenseActionsContext();
  const { isReject, rejectComment } = useApprovalContext();
  const { setIsReject, setRejectComment, handleOnApprovationExpense } =
    useApprovalActionsContext();

  // Destructing
  const { TextArea } = Input;

  // Functions
  const getColumns = (router: NextRouter): ColumnsType<ReportExpenseType> => [
    {
      title: <IntlMessages id="common.attachments" />,
      dataIndex: "expenseAttachments",
      key: "expenseAttachments",
      render: (data, record) => (
        <Tooltip
          title={
            record.expense.attachments?.length === 0 ? (
              <IntlMessages id="common.no.attachments" />
            ) : (
              <span>
                {record.expense.attachments.length}{" "}
                <IntlMessages id="common.attachments" />
              </span>
            )
          }
        >
          <div
            //onClick={() => handleOnShowAttachments(record.attachments)}
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <IoMdAttach
              style={{
                fontSize: 16,
                color:
                  record.expense.attachments?.length === 0
                    ? "#d12420"
                    : "#2a7a39",
              }}
            />
            <span style={{ fontWeight: "600" }}>
              ({record.expense.attachments?.length})
            </span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <IntlMessages id="common.report.title" />,
      dataIndex: "reportTitle",
      key: "reportTitle",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.report.title}</span>
      ),
    },
    {
      title: <IntlMessages id="common.report.code" />,
      dataIndex: "reportCode",
      key: "reportCode",
      render: (id, record) => <span>{record.report.code}</span>,
    },
    {
      title: <IntlMessages id="common.submission.date" />,
      dataIndex: "expenseSubmissionDate",
      key: "expenseSubmissionDate",
      render: (id, record) => (
        <>
          {record.expense.submission_date ? (
            <span>
              {Tt_FormatDate(
                moment(record.expense.submission_date).format(FORMAT_DATE_ONE)
              )}{" "}
              <br />
              <i>
                {moment(record.expense.submission_date).format(FORMAT_DATE_TWO)}
              </i>
            </span>
          ) : (
            "-"
          )}
        </>
      ),
    },
    {
      title: <IntlMessages id="common.employee" />,
      dataIndex: "expenseEmployee",
      key: "expenseEmployee",
      render: (id, record) => (
        <StyledFlex>
          {record.expense.employee ? (
            <>
              {record.expense.employee?.photoURL ? (
                <Avatar
                  style={{
                    marginRight: 14,
                    width: 44,
                    height: 44,
                  }}
                  src={record.expense.employee?.photoURL.secure_url}
                />
              ) : (
                <StyledUserInfoAvatar
                  photoRGA={record.expense.employee.photoRGA}
                >
                  {Tt_GetUserAvatar(record.expense.employee)}
                </StyledUserInfoAvatar>
              )}
              <div
                style={{
                  flex: 1,
                }}
              >
                <Typography.Title
                  level={5}
                  style={{ fontSize: 14, marginBottom: 0 }}
                >
                  {record.expense.employee?.displayName}
                </Typography.Title>
                <StyledText>{record.expense.employee?.email}</StyledText>
              </div>
            </>
          ) : (
            "-"
          )}
        </StyledFlex>
      ),
    },
    {
      title: <IntlMessages id="common.status" />,
      dataIndex: "expenseStatus",
      key: "expenseStatus",
      render: (id, record) => (
        <span>{getStatusExpense(record.expense.status)}</span>
      ),
    },
    {
      title: <IntlMessages id="common.total.amount" />,
      dataIndex: "expenseAmount",
      key: "expenseAmount",
      render: (data, record) => (
        <StyledFlex>
          <b>{record.expense.amount.toLocaleString()}</b>
          <span className="ml-3">{record.expense.currency}</span>
        </StyledFlex>
      ),
    },
    {
      title: <IntlMessages id="common.actions" />,
      dataIndex: "actions",
      key: "actions",
      className: "order-table-action",
      fixed: "right",
      render: (text, record) => <ApprovalActions expense={record.expense} />,
    },
  ];

  const getReportExpenses = () => {
    let reportExpenses: ReportExpenseType[] = [];
    reportData.map((report) => {
      report.expenses.map((expense) => {
        reportExpenses.push({
          report: report,
          expense: expense,
        });
      });
    });
    return reportExpenses;
  };

  // Render
  return (
    <>
      <StyledObjectTable
        hoverColor
        data={getReportExpenses()}
        loading={loading}
        columns={getColumns(router)}
        scroll={{ x: "auto" }}
      />
      {isAppDrawerOpen && (
        <ExpenseView
          expense={expense}
          isAppDrawerOpen={isAppDrawerOpen}
          setAppDrawerOpen={setAppDrawerOpen}
        />
      )}
      <Modal
        title={<IntlMessages id="dashboard.expense.reject" />}
        open={isReject}
        onOk={() =>
          handleOnApprovationExpense(
            expense.expenseId,
            StatusExpenseEnums.REJECTED,
            rejectComment
          )
        }
        onCancel={() => setIsReject(!isReject)}
        footer={[
          <Button
            key="back"
            onClick={() => setIsReject(!isReject)}
            className="tt-expenses-space-center"
          >
            <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.back" />
          </Button>,
          <Button
            key="submit"
            type="primary"
            className="tt-expenses-space-center"
            onClick={() =>
              handleOnApprovationExpense(
                expense._id,
                StatusExpenseEnums.REJECTED,
                rejectComment
              )
            }
            disabled={!(rejectComment.length >= 5)}
          >
            <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
            <IntlMessages id="common.submit" />
          </Button>,
        ]}
      >
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="rejectComment" className="label">
              <IntlMessages id="common.comments" />{" "}
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <TextArea
              name="rejectComment"
              value={rejectComment}
              rows={5}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <span className="tt-expenses-tomato">Maximun 5 letters</span>
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default ApprovalTable;
