import React from "react";
import ListItem from "./ListItem";
import AppList from "@crema/components/AppList";
import { ProductDataType } from "@crema/types/models/ecommerce/EcommerceApp";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type Props = {
  ecommerceList: ProductDataType[];
  loading: boolean;
};

const ProductList = ({ ecommerceList, loading }: Props) => {
  return (
    <AppList
      delay={200}
      type="alpha"
      data={ecommerceList}
      renderItem={(item) => <ListItem item={item} key={item.id} />}
      ListEmptyComponent={
        <ListEmptyResult content="No product found" loading={loading} />
      }
    />
  );
};

export default ProductList;
