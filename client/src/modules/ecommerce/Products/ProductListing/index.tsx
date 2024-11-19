import React, { useEffect, useState } from "react";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import {
  StyledProductListMainContent,
  StyledProductListView,
} from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { VIEW_TYPE } from "../index";
import {
  ProductGrid,
  ProductHeader,
  ProductList,
} from "@crema/modules/ecommerce/Products";
import type {
  ProductDataFilterType,
  ProductDataType,
} from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  filterData: ProductDataFilterType;
  viewType: string;
  setViewType: (viewType: string) => void;
  setFilterData: (filterData: ProductDataFilterType) => void;
};

const ProductListing = ({
  filterData,
  viewType,
  setViewType,
  setFilterData,
}: Props) => {
  const [page, setPage] = useState(0);
  const [{ apiData: ecommerceList, loading }, { setQueryParams }] =
    useGetDataApi<{ list: ProductDataType[]; total: number }>(
      "/api/ecommerce/list",
      { list: [] as ProductDataType[], total: 0 },
      {},
      false
    );

  const searchProduct = (title: string) => {
    setFilterData({ ...filterData, title });
  };

  const onPageChange = (value: number) => {
    setPage(value);
  };

  useEffect(() => {
    setQueryParams({ filterData, page });
  }, [filterData]);

  return (
    <StyledProductListView>
      <AppsHeader>
        <ProductHeader
          viewType={viewType}
          onChange={searchProduct}
          setViewType={setViewType}
          onPageChange={onPageChange}
        />
      </AppsHeader>

      <AppsContent>
        <StyledProductListMainContent>
          {viewType === VIEW_TYPE.GRID ? (
            <ProductGrid ecommerceList={ecommerceList.list} loading={loading} />
          ) : (
            <ProductList ecommerceList={ecommerceList.list} loading={loading} />
          )}
        </StyledProductListMainContent>
      </AppsContent>
    </StyledProductListView>
  );
};

export default ProductListing;
