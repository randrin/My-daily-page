import React from 'react';
import { StyledCardMediaWrapper } from './index.styled';

type Props = {
  children: React.ReactNode;
  onClick: () => void;
};

const CardWrapper = ({ children, ...rest }: Props) => {
  return (
    <StyledCardMediaWrapper className="no-card-space-ltr-rtl" {...rest}>
      {children}
    </StyledCardMediaWrapper>
  );
};

export default CardWrapper;
