import React from "react";
import { StyledInvoiceTruncateView } from "./index.styled";
import type { ColumnsType } from "antd/es/table";
import { InvoiceData } from "@crema/mockapi/fakedb/extraPages";

const InvoiceColumns: ColumnsType<InvoiceData> = [
  {
    title: "Item & Description",
    dataIndex: "item",
    key: "item",
    render: (item) => (
      <>
        <h6>{item.itemTitle}</h6>
        {item.desc ? (
          <StyledInvoiceTruncateView>
            <span className="text-truncate">{item.desc}</span>
          </StyledInvoiceTruncateView>
        ) : null}
      </>
    ),
  },
  {
    title: "Assignment Type",
    dataIndex: "type",
    key: "type",
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
];

export default InvoiceColumns;
