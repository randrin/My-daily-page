import React from "react";
import { Button } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
  StyledAnChar,
  StyledBadgeRoot,
  StyledOrderTable,
} from "../index.styled";
import type { RecentOrderDataType } from "@crema/types/models/dashboards/Ecommerce";

type OrderTableProps = {
  orderData: RecentOrderDataType[];
};

type paymentProps = {
  [key: string]: string;
};

const paymentStatusColor: paymentProps = {
  Pending: "#F84E4E",
  Delivered: "#43C888",
  default: "#E2A72E",
};
const OrderTable: React.FC<OrderTableProps> = ({ orderData }) => {
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <StyledAnChar>{id}</StyledAnChar>,
    },
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Delivery Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <StyledBadgeRoot
          style={{
            color: paymentStatusColor[status] || paymentStatusColor["default"],
            backgroundColor: paymentStatusColor[status]
              ? paymentStatusColor[status] + "44"
              : paymentStatusColor["default"] + "44",
          }}
        >
          {status}
        </StyledBadgeRoot>
      ),
    },
    {
      title: "Actions",
      dataIndex: "id",
      key: "id",
      render: (id: number) => (
        <Button key={id} shape="circle" icon={<MoreOutlined />} />
      ),
    },
  ];
  return <StyledOrderTable data={orderData} columns={columns} />;
};

export default OrderTable;
