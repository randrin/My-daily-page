import React from "react";
import { StarFilled } from "@ant-design/icons";
import OrderActions from "./OrderActions";
import { StyledCustomerTable } from "../index.styled";
import type { CustomersDataType } from "@crema/types/models/ecommerce/EcommerceApp";
import type { ColumnsType } from "antd/es/table";

type Props = {
  customers: CustomersDataType[];
  loading: boolean;
};
const CustomerTable = ({ customers, loading }: Props) => {
  const columns: ColumnsType<CustomersDataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Last Item",
      dataIndex: "lastItem",
      key: "lastItem",
    },
    {
      title: "Last Order",
      dataIndex: "lastOrder",
      key: "lastOrder",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <span className="badge">
          {rating} <StarFilled style={{ fontSize: 12, marginLeft: 2 }} />
        </span>
      ),
    },
    {
      title: "Wallet Balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      className: "customer-table-actions",
      fixed: "right",
      render: () => <OrderActions />,
    },
  ];
  return (
    <StyledCustomerTable
      hoverColor
      data={customers}
      columns={columns}
      loading={loading}
      scroll={{ x: "auto" }}
    />
  );
};

export default CustomerTable;
