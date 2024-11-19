import React from 'react';
import { CheckOutlined } from '@ant-design/icons';
import {
  StyledProductSidebarColorCell,
  StyledProductSidebarColorCellBtn,
} from './index.styled';

type Props = {
  selected: number[];
  data: any;
  onChange: (data: number) => void;
};
const ColorCell = ({ selected, data, onChange }: Props) => {
  return (
    <StyledProductSidebarColorCell
      onClick={() => onChange(data)}
      style={{
        backgroundColor: data,
      }}
    >
      {selected.some((item) => item === data) ? (
        <StyledProductSidebarColorCellBtn>
          <CheckOutlined />
        </StyledProductSidebarColorCellBtn>
      ) : null}
    </StyledProductSidebarColorCell>
  );
};

export default ColorCell;
