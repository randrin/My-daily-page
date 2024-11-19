import React from "react";
import { Avatar } from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { CartItemsType } from "@crema/types/models/ecommerce/EcommerceApp";
import type { ColumnsType } from "antd/es/table";

const Columns: ColumnsType<CartItemsType> = [
  {
    title: "Product",
    dataIndex: "product",
    key: "product",
    render: (product) => (
      <div className="cart-user">
        <Avatar src={product.image} />
        <div className="cart-user-info">
          <h3>{product.title}</h3>
          <p>Brand: {product.brand}</p>
        </div>
      </div>
    ),
  },
  {
    title: "Unit Price",
    dataIndex: "price",
    key: "price",
    render: (price) => <>${+price.mrp - +price.discount}</>,
  },
  {
    title: "QTY",
    dataIndex: "count",
    key: "count",
    render: (count: number, onIncrement: any, onDecrement: any) => (
      <div className="cart-inc-dec">
        <PlusOutlined className="pointer" onClick={onIncrement} />
        <span>{count}</span>
        <MinusOutlined className="pointer" onClick={onDecrement} />
      </div>
    ),
  },
  {
    title: "Total",
    dataIndex: "total",
    key: "total",
    render: (total) => <>${(+total.mrp - +total.discount) * +total.count}</>,
  },
];

export default Columns;
