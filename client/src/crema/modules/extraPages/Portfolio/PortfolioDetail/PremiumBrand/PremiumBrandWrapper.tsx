import React from 'react';
import { StyledPremiumBrand } from './index.styled';

type Props = {
  children: React.ReactNode;
};

const PremiumBrandWrapper = ({ children }: Props) => {
  return <StyledPremiumBrand>{children}</StyledPremiumBrand>;
};

export default PremiumBrandWrapper;
