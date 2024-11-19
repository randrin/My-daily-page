import React from "react";
import { Checkbox } from "antd";
import { StyledCategoryItem } from "./index.styled";
import { CategoriesDataType } from "@crema/types/models/dashboards/Widgets";
import { CheckboxChangeEvent } from "antd/es/checkbox/Checkbox";

type CategoryItemProps = {
  item: CategoriesDataType;
  handleChange: (e: CheckboxChangeEvent, category: CategoriesDataType) => void;
};

const CategoryItem: React.FC<CategoryItemProps> = ({ item, handleChange }) => {
  return (
    <StyledCategoryItem key={item.id} className="item-hover">
      <Checkbox
        checked={item.isChecked}
        onChange={(e) => handleChange(e, item)}
      />
      <span style={{ color: `${!item.isChecked ? "text.secondary" : ""}` }}>
        {item.name}
      </span>
    </StyledCategoryItem>
  );
};

export default CategoryItem;
