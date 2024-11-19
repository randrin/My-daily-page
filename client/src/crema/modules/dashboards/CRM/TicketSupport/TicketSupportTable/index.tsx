import React from "react";
import { Avatar } from "antd";
import {
  StyledTicketSupportTable,
  StyledTicketSupportUserInfo,
  StyledTicketSupportUserInfoContent,
} from "../index.styled";
import type { TicketSupportDataType } from "@crema/types/models/dashboards/CRM";
import { ColumnsType } from "antd/es/table";

const columns: ColumnsType<TicketSupportDataType> = [
  {
    title: "No.",
    dataIndex: `id`,
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name, record) => (
      <StyledTicketSupportUserInfo>
        <Avatar src={record.image} />
        <StyledTicketSupportUserInfoContent>
          <h3>{record.name}</h3>
        </StyledTicketSupportUserInfoContent>
      </StyledTicketSupportUserInfo>
    ),
  },
  {
    title: "Ticket ID",
    dataIndex: "ticketId",
    key: "ticketId",
  },
  {
    title: "Create Date",
    dataIndex: "created",
    key: "created",
  },
  {
    title: "Contact",
    dataIndex: "contact",
    key: "contact",
  },
];

// const getData = (data) => {
//   if (isBreakPointDown('xl')) {
//     return data.slice(0, 9);
//   } else {
//     return data.slice(0, 7);
//   }
// };

type TicketSupportTableProps = {
  ticketSupportData: TicketSupportDataType[];
};

const TicketSupportTable: React.FC<TicketSupportTableProps> = ({
  ticketSupportData,
}) => {
  return (
    <StyledTicketSupportTable
      scroll={{ x: "auto", y: 340 }}
      hoverColor
      data={ticketSupportData}
      columns={columns}
    />
  );
};

export default TicketSupportTable;
