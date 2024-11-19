import React from "react";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Col } from "antd";
import {
  StyledProductDetailItemTitle,
  StyledProductDetailSpecification,
} from "./index.styled";
import { ProductInfoType } from "@crema/types/models/ecommerce/EcommerceApp";

type ProductInfoProps = {
  productInfo: ProductInfoType[];
};

const ProductInfo = ({ productInfo }: ProductInfoProps) => {
  return (
    <StyledProductDetailSpecification>
      <StyledProductDetailItemTitle>
        Product Details
      </StyledProductDetailItemTitle>
      <AppRowContainer>
        {productInfo.map((data, index) => (
          <React.Fragment key={index}>
            <Col xs={8}>
              <p className="text-secondary">{data.title}</p>
            </Col>
            <Col xs={16}>
              <p> {data.desc}</p>
            </Col>
          </React.Fragment>
        ))}
      </AppRowContainer>
    </StyledProductDetailSpecification>
  );
};

export default ProductInfo;
