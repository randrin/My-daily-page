import React from "react";
import { Avatar } from "antd";
import { StyledProductCell, StyledProductCellContent } from "./index.styled";
import type { PopularProductDataType } from "@crema/types/models/dashboards/Ecommerce";

type ProductCellProps = {
  data: PopularProductDataType;
};

const ProductCell: React.FC<ProductCellProps> = ({ data }) => {
  return (
    <StyledProductCell key={data.id} className="item-hover">
      <Avatar alt="" src={data.icon} />

      <StyledProductCellContent>
        <h3>{data.name}</h3>
        <p>{data.description}</p>
        <p className="price">
          ${data.price}
          <span style={{ textDecoration: "line-through" }}>${data.mrp}</span>
        </p>
      </StyledProductCellContent>
    </StyledProductCell>
  );
};

export default ProductCell;
