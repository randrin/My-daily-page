import React from "react";
import { StyledTicketSupportTable } from "../../TicketSupport/index.styled";
import { StyledFlex, StyledNumberWrapper } from "../index.styled";
import { Typography } from "antd";
import { TimesheetType } from "@crema/types/models/dashboards/CRM";
import { ColumnsType } from "antd/es/table";

const columns: ColumnsType<TimesheetType> = [
  {
    title: "Project",
    dataIndex: "id",
    key: "id",
    render: (id, record) => (
      <StyledFlex>
        <StyledNumberWrapper>{id}</StyledNumberWrapper>
        <Typography.Title level={5}>{record.name}</Typography.Title>
      </StyledFlex>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Start time",
    dataIndex: "start_time",
    key: "start_time",
  },
  {
    title: "Stop time",
    dataIndex: "end_time",
    key: "end_time",
  },
  {
    title: "Duration",
    dataIndex: "duration",
    key: "duration",
  },
];

type Props = {
  timesheet: TimesheetType[];
};

const TimesheetTable = ({ timesheet }: Props) => {
  return (
    <StyledTicketSupportTable
      scroll={{ x: "auto", y: 200 }}
      hoverColor
      data={timesheet}
      columns={columns}
    />
  );
};

export default TimesheetTable;

TimesheetTable.defaultProps = {
  timesheet: [],
};
