import React from 'react';
import { StyledInnovationImgWrapper } from './index.styled';

type Props = {
  children: React.ReactNode;
};

const InnovationImgWrapper = ({ children }: Props) => {
  return <StyledInnovationImgWrapper>{children}</StyledInnovationImgWrapper>;
};

export default InnovationImgWrapper;
