import React, { useEffect } from "react";
import AppCard from "@crema/components/AppCard";
import AppInfoView from "@crema/components/AppInfoView";
import AppAnimate from "@crema/components/AppAnimate";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Col } from "antd";
import AppPageMeta from "@crema/components/AppPageMeta";
import { useRouter } from "next/router";
import { StyledProductDetails } from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import {
  Header,
  ProductImageSlide,
  ProductView,
  SimilarProduct,
} from "@crema/modules/ecommerce/ProductDetail";
import type { ProductDataType } from "@crema/types/models/ecommerce/EcommerceApp";

const ProductDetail = () => {
  const { query } = useRouter();
  const { all } = query;

  const [{ apiData: currentProduct }, { setQueryParams }] =
    useGetDataApi<ProductDataType>("/api/ecommerce/get", undefined, {}, false);

  useEffect(() => {
    setQueryParams({ id: all?.[0] });
  }, [all]);

  return (
    <StyledProductDetails>
      <AppPageMeta title="Product Details" />
      {currentProduct ? (
        <AppAnimate animation="transition.slideUpIn" delay={200}>
          <AppCard key="product_detail">
            <Header product={currentProduct} />
            <AppRowContainer>
              <Col sm={24} lg={8}>
                <ProductImageSlide product={currentProduct} />
              </Col>
              <Col sm={24} lg={16}>
                <ProductView product={currentProduct} />
              </Col>
            </AppRowContainer>
            <SimilarProduct />
          </AppCard>
        </AppAnimate>
      ) : null}
      <AppInfoView />
    </StyledProductDetails>
  );
};

export default ProductDetail;
