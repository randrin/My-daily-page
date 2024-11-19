import React from "react";
import AppGrid from "@crema/components/AppGrid";
import GridItem from "./GridItem";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import type { ProductDataType } from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  ecommerceList: ProductDataType[];
  loading: boolean;
};
const ProductGrid = ({ ecommerceList, loading }: Props) => (
  <AppGrid
    itemPadding={8}
    delay={200}
    responsive={{
      xs: 1,
      sm: 2,
      xxl: 3,
    }}
    data={ecommerceList}
    renderItem={(item) => <GridItem item={item} key={item.id} />}
    ListEmptyComponent={
      <ListEmptyResult content="No product found" loading={loading} />
    }
  />
);
export default ProductGrid;
