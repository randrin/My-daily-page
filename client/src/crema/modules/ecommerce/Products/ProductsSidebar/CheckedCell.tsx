import React from 'react';
import { Checkbox } from 'antd';
import { StyledProductSideCheckedCell } from './index.styled';

type Props = {
  selected: number[];
  data: any;
  onChange: (data: number) => void;
}
const CheckedCell = ({ selected, data, onChange }: Props) => {
  return (
    <StyledProductSideCheckedCell onClick={() => onChange(data.id)}>
      <Checkbox
        checked={selected.some((item) => item === data.id)}
      />
      <p className='mb-0'>{data.name}</p>
    </StyledProductSideCheckedCell>
  );
};

export default CheckedCell;


