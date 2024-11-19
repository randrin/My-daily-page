import { countries } from "@crema/constants/AppConst";
import { ReportType } from "@crema/types/models/dashboards/ReportType";
import { Avatar, Typography } from "antd";
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
import { IoReceipt } from "react-icons/io5";
import ReportActions from "./ReportActions";
import {
  StyledFlex,
  StyledObjectTable,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import IntlMessages from "@crema/helpers/IntlMessages";
import { FaCheck, FaChevronLeft } from "react-icons/fa";
import { MdOutlineMoreHoriz } from "react-icons/md";

const getStatusReport = (status: string) => {
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
  }
};

const getColumns = (router: NextRouter): ColumnsType<ReportType> => [
  {
    title: <IntlMessages id="common.title" />,
    dataIndex: "title",
    key: "title",
    render: (id, record) => (
      <Typography.Link
        onClick={() => router.push(`/dashboards/report_detail/${record._id}`)}
        style={{ display: "flex", alignItems: "center" }}
      >
        {record.title}
      </Typography.Link>
    ),
  },
  {
    title: <IntlMessages id="common.receipts" />,
    dataIndex: "receipts",
    key: "receipts",
    render: (data, record) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IoReceipt
          style={{
            fontSize: 16,
            right: "5px",
            position: "relative",
          }}
        />
        ({record.expenses.length})
      </div>
    ),
  },
  {
    title: <IntlMessages id="common.code" />,
    dataIndex: "code",
    key: "code",
  },
  {
    title: <IntlMessages id="common.approver" />,
    dataIndex: "approver",
    key: "approver",
    render: (id, record) => (
      <StyledFlex>
        {record.approver ? (
          <>
            {record.approver?.photoURL ? (
              <Avatar
                style={{
                  marginRight: 14,
                  width: 44,
                  height: 44,
                }}
                src={record.approver?.photoURL.secure_url}
              />
            ) : (
              <StyledUserInfoAvatar photoRGA={record.employee.photoRGA}>
                {Tt_GetUserAvatar(record.approver)}
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
                {record.approver?.displayName}
              </Typography.Title>
              <StyledText>{record.approver?.email}</StyledText>
            </div>
          </>
        ) : (
          "-"
        )}
      </StyledFlex>
    ),
  },
  {
    title: <IntlMessages id="common.approvation.date" />,
    dataIndex: "approval_date",
    key: "approval_date",
    render: (id, record) => (
      <>
        {record.approval_date ? (
          <span>
            {Tt_FormatDate(
              moment(record.submission_date).format(FORMAT_DATE_ONE)
            )}{" "}
            <br />
            <i>{moment(record.submission_date).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </>
    ),
  },
  {
    title: <IntlMessages id="common.submission.date" />,
    dataIndex: "submission_date",
    key: "submission_date",
    render: (id, record) => (
      <>
        {record.submission_date ? (
          <span>
            {Tt_FormatDate(
              moment(record.submission_date).format(FORMAT_DATE_ONE)
            )}{" "}
            <br />
            <i>{moment(record.submission_date).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </>
    ),
  },
  {
    title: <IntlMessages id="common.employee" />,
    dataIndex: "employee",
    key: "employee",
    render: (id, record) => (
      <StyledFlex>
        {record.employee?.photoURL ? (
          <Avatar
            style={{
              marginRight: 14,
              width: 44,
              height: 44,
            }}
            src={record.employee?.photoURL.secure_url}
          />
        ) : (
          <StyledUserInfoAvatar photoRGA={record.employee.photoRGA}>
            {Tt_GetUserAvatar(record.employee)}
          </StyledUserInfoAvatar>
        )}
        <div
          style={{
            flex: 1,
          }}
        >
          <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 0 }}>
            {record.employee?.displayName}
          </Typography.Title>
          <StyledText>{record.employee?.email}</StyledText>
        </div>
      </StyledFlex>
    ),
  },
  {
    title: <IntlMessages id="common.status" />,
    dataIndex: "status",
    key: "status",
    render: (id, record) => <span>{getStatusReport(record.status)}</span>,
  },
  {
    title: <IntlMessages id="common.createdAt.updatedAt" />,
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (id, record) => (
      <span>
        {Tt_FormatDate(moment(record.updatedAt).format(FORMAT_DATE_ONE))} <br />
        <i>{moment(record.updatedAt).format(FORMAT_DATE_TWO)}</i>
      </span>
    ),
  },
  {
    title: <IntlMessages id="common.total.amount" />,
    dataIndex: "total",
    key: "total",
    render: (data, record) => (
      <StyledFlex>
        <b>
          {record.expenses
            .map((expense) => expense.amount)
            .reduce((a, b) => a + b, 0)
            .toLocaleString()}
        </b>
        <span className="ml-3">
          {
            countries.find((country) => country.name === record.country)
              .currency
          }
        </span>
      </StyledFlex>
    ),
  },
  {
    title: <IntlMessages id="common.actions" />,
    dataIndex: "actions",
    key: "actions",
    className: "order-table-action",
    fixed: "right",
    render: (text, record) => <ReportActions reportData={record} />,
  },
];

type Props = {
  reportData: ReportType[];
  loading: boolean;
};

const ReportTable = ({ reportData, loading }: Props) => {
  const router = useRouter();

  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={reportData}
      loading={loading}
      columns={getColumns(router)}
      scroll={{ x: "auto" }}
    />
  );
};

export default ReportTable;
