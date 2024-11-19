import React from 'react';
import { StarFilled } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { StyledSidebarRatingCell } from './index.styled';

type Props = {
  selected: number[];
  data: any;
  onChange: (data: number) => void;
};
const RatingCell = ({ selected, data, onChange }: Props) => {
  return (
    <StyledSidebarRatingCell onClick={() => onChange(data)}>
      <Checkbox checked={selected.some((item) => item === data)} />
      {data}
      <StarFilled style={{ fontSize: 14, marginLeft: 5 }} />
    </StyledSidebarRatingCell>
  );
};

export default RatingCell;
