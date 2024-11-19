import React from "react";
import {
  StyledEarningMonthCategories,
  StyledEarningMonthCategoriesItem,
} from "./index.styled";
import type { EarningInMonthDataType } from "@crema/types/models/dashboards/Metrics";

type CategoriesProps = {
  data: EarningInMonthDataType[];
};

const Categories: React.FC<CategoriesProps> = ({ data }) => {
  return (
    <StyledEarningMonthCategories>
      {data.map((item) => {
        return (
          <StyledEarningMonthCategoriesItem key={item.id}>
            <span className="dot" style={{ backgroundColor: item.color }} />
            <p>{item.name}</p>
          </StyledEarningMonthCategoriesItem>
        );
      })}
    </StyledEarningMonthCategories>
  );
};

export default Categories;
