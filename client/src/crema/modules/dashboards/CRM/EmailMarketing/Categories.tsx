import React from "react";
import { Typography } from "antd";
import {
  StyledCategoryItem,
  StyledCategoryItemIcon,
  StyledCategoryText,
} from "./index.styled";
import { EmailMarketingType } from "@crema/types/models/dashboards/CRM";

type Props = {
  category: EmailMarketingType;
};
const Categories = ({ category }: Props) => {
  return (
    <>
      <StyledCategoryItem>
        <StyledCategoryItemIcon
          style={{
            backgroundColor: category.fill,
          }}
        />
        <Typography.Title level={5} style={{ fontSize: 14, marginBottom: 0 }}>
          {category.value}
        </Typography.Title>
      </StyledCategoryItem>
      <StyledCategoryText>{category.name}</StyledCategoryText>
    </>
  );
};

export default Categories;
