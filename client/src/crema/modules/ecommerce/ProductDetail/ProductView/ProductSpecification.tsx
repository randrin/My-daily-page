import React from "react";
import AppRowContainer from "@crema/components/AppRowContainer";
import { Col } from "antd";
import {
  StyledProductDetailItemTitle,
  StyledProductDetailSpecification,
} from "./index.styled";
import { ProductInfoType } from "@crema/types/models/ecommerce/EcommerceApp";

type ProductSpecificationProps = {
  productSpec: ProductInfoType[];
};

const ProductSpecification = ({ productSpec }: ProductSpecificationProps) => {
  return (
    <StyledProductDetailSpecification>
      <StyledProductDetailItemTitle>Specification</StyledProductDetailItemTitle>
      <AppRowContainer>
        {productSpec.map((data, index) => (
          <React.Fragment key={index}>
            <Col xs={8}>
              <p className="text-secondary"> {data.title}</p>
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

export default ProductSpecification;
