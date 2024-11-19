import type { CartItemsType } from "@crema/types/models/ecommerce/EcommerceApp";

export const getTotalPrice = (cartItems: CartItemsType[]) => {
  let total = 0;
  cartItems.map((data) => {
    total = total + (+data.price.mrp - +data.price.discount) * +data.count;
    return data;
  });
  return total;
};
