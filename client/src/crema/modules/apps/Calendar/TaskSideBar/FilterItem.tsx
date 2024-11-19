import React from 'react';
import { StyledFlex, StyledTodoLabelItem } from './index.styled';
import { Checkbox } from 'antd';

type Props = {
  item: any;
  checked: number[];
  onChange: (checked: boolean, id: number) => void;
};

const FilterItem = ({ item, checked, onChange }: Props) => {
  return (
    <StyledTodoLabelItem>
      <StyledFlex className="filter-item">
        <Checkbox
          onChange={(e) => onChange(e.target.checked, item.id)}
          value={checked.find((data) => data === item.id)}
        />
        {item.name}
      </StyledFlex>
    </StyledTodoLabelItem>
  );
};

export default FilterItem;
