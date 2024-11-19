import React from 'react';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import {
  StyledProductHeader,
  StyledProductHeaderBtn,
  StyledProductHeaderLeft,
  StyledProductHeaderRight,
  StyledProductHeaderSearch,
  StyledProductHeaderShowingText,
} from './index.styled';
import { VIEW_TYPE } from '../index';

type Props = {
  onChange: (data: string) => void;
  viewType: string;
  setViewType: (data: string) => void;
  onPageChange: (value: number) => void;
};
const ProductHeader = ({
  onChange,
  viewType,
  setViewType,
  onPageChange,
}: Props) => {
  return (
    <StyledProductHeader>
      <StyledProductHeaderLeft>
        <h3>Watches</h3>
        <StyledProductHeaderShowingText className="text-truncate">
          (Showing 1 – 40 products of 93,723 products)
        </StyledProductHeaderShowingText>
      </StyledProductHeaderLeft>
      <StyledProductHeaderRight>
        <StyledProductHeaderSearch
          placeholder="Search here"
          onChange={(e) => onChange(e.target.value)}
        />

        <StyledProductHeaderBtn
          className={clsx({
            active: viewType === VIEW_TYPE.LIST,
          })}
          onClick={() => setViewType(VIEW_TYPE.LIST)}
        >
          <UnorderedListOutlined />
        </StyledProductHeaderBtn>
        <StyledProductHeaderBtn
          className={clsx({
            active: viewType === VIEW_TYPE.GRID,
          })}
          onClick={() => setViewType(VIEW_TYPE.GRID)}
        >
          <AppstoreOutlined />
        </StyledProductHeaderBtn>
      </StyledProductHeaderRight>
    </StyledProductHeader>
  );
};

export default ProductHeader;
