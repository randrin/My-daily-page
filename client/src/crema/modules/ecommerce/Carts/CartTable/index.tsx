import React from "react";
import { Avatar, Table } from "antd";
import {
  CloseCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  StyledCartIncDec,
  StyledCartTable,
  StyledCartUser,
  StyledCartUserInfo,
} from "../index.styled";
import type { CartItemsType } from "@crema/types/models/ecommerce/EcommerceApp";
import { StyledComponent } from "styled-components";
import { CompoundedComponent } from "antd/es/float-button/interface";

type Props = {
  cartItems: CartItemsType[];
  loading: boolean;
  onRemoveItem: (data: CartItemsType) => void;
  onIncrement: (data: CartItemsType) => void;
  onDecrement: (data: CartItemsType) => void;
};

const CartTable = ({
  cartItems,
  loading,
  onRemoveItem,
  onIncrement,
  onDecrement,
}: Props) => {
  const { Column, ColumnGroup } = Table;

  console.log("cartItems", cartItems);
  return (
    <StyledCartTable<
      StyledComponent<CompoundedComponent, any, CartItemsType, never>
    >
      loading={loading}
      dataSource={cartItems}
      pagination={false}
    >
      <ColumnGroup>
        <Column
          title="Product"
          dataIndex="product"
          key="product"
          render={(product) => {
            return (
              <StyledCartUser>
                <Avatar src={product.image} />
                <StyledCartUserInfo>
                  <h3>{product.title}</h3>
                  <p>Brand: {product.brand}</p>
                </StyledCartUserInfo>
              </StyledCartUser>
            );
          }}
        />
        <Column
          title="Unit Price"
          dataIndex="price"
          key="price"
          render={(price) => <>${+price.mrp - +price.discount}</>}
        />
        <Column
          title="QTY"
          dataIndex="count"
          key="count"
          render={(count, record: CartItemsType) => (
            <StyledCartIncDec>
              <PlusOutlined
                className="pointer"
                onClick={() => onIncrement(record)}
              />
              <span>{count}</span>
              <MinusOutlined
                className="pointer"
                onClick={() => onDecrement(record)}
              />
            </StyledCartIncDec>
          )}
        />
        <Column
          title="Total"
          dataIndex="total"
          key="total"
          render={(total) => (
            <span>${(+total.mrp - +total.discount) * +total.count}</span>
          )}
        />
        <Column
          title=""
          dataIndex="close"
          key="close"
          render={(_, record: CartItemsType) => (
            <span onClick={() => onRemoveItem(record)}>
              <CloseCircleOutlined
                style={{ fontSize: 18, cursor: "pointer" }}
              />
            </span>
          )}
        />
      </ColumnGroup>
    </StyledCartTable>
  );
};

export default CartTable;
