import React from "react";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import AppPageMeta from "@crema/components/AppPageMeta";
import {
  StyledOrderSummaryItem,
  StyledSummaryOrderDivider,
} from "./index.styled";
import AppAnimate from "@crema/components/AppAnimate";
import type { CartItemsType } from "@crema/types/models/ecommerce/EcommerceApp";

const getTotalPrice = (cartItems: CartItemsType[]) => {
  let total = 0;
  cartItems.map((data) => {
    total = total + +data.price.mrp * +data.count;
    return data;
  });
  return total;
};

const getTotalDiscount = (cartItems: CartItemsType[]) => {
  let total = 0;
  cartItems.map((data) => {
    total = total + +data.price.discount * +data.count;
    return data;
  });
  return total;
};

type Props = {
  cartItems: CartItemsType[];
};
const OrderSummary = ({ cartItems }: Props) => {
  const { messages } = useIntl();
  const totalPrice = getTotalPrice(cartItems);
  const totalDiscount = getTotalDiscount(cartItems);
  return (
    <AppAnimate animation="transition.slideRightIn" delay={200}>
      <AppCard title={messages["ecommerce.orderSummary"] as string}>
        <AppPageMeta title="Order Summery" />
        <StyledOrderSummaryItem>
          <p>Grand Total: </p>
          <span>${totalPrice}</span>
        </StyledOrderSummaryItem>
        <StyledOrderSummaryItem>
          <p>Discount: </p>
          <span>${totalDiscount}</span>
        </StyledOrderSummaryItem>
        <StyledOrderSummaryItem>
          <p>Shipping Charge: </p>
          <span>$4</span>
        </StyledOrderSummaryItem>
        <StyledOrderSummaryItem>
          <p>Estimated Tax: </p>
          <span>$0</span>
        </StyledOrderSummaryItem>

        <StyledSummaryOrderDivider />

        <StyledOrderSummaryItem>
          <p>Order Total: </p>
          <span>${totalPrice - totalDiscount + 4}</span>
        </StyledOrderSummaryItem>
      </AppCard>
    </AppAnimate>
  );
};

export default OrderSummary;
