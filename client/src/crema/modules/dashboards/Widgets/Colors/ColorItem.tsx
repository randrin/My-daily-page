import React from "react";
import { StyledColorCheckbox, StyledColorItem } from "./index.styled";
import type { ColorsListType } from "@crema/types/models/dashboards/Widgets";

type ColorItemProps = {
  item: ColorsListType;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    item: ColorsListType
  ) => void;
};

const ColorItem: React.FC<ColorItemProps> = (props) => {
  const { item, handleChange } = props;
  return (
    <StyledColorItem key={item.id} className="item-hover">
      <StyledColorCheckbox
        checked={item.isChecked}
        onChange={(e: any) => handleChange(e, item)}
      />
      <span style={{ color: item.color }}>{item.name}</span>
    </StyledColorItem>
  );
};

export default ColorItem;
