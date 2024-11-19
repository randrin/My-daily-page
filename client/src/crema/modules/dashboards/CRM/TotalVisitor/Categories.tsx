import React from "react";

import { StyledListItem } from "./index.styled";
import { Typography } from "antd";
import { TotalVisitorType } from "@crema/types/models/dashboards/CRM";

type Props = {
  category: TotalVisitorType;
};
const Categories = ({ category }: Props) => {
  return (
    <StyledListItem>
      <div className="earning-wrapper">
        <div style={{ backgroundColor: category.color }} className="dot-icon" />
        <div className="earning-text">{`${category.name}:`}</div>
      </div>
      <Typography.Text strong>{category.value}% </Typography.Text>
    </StyledListItem>
  );
};

export default Categories;
