import React from 'react';
import { StyledMediaSlider } from './index.styled';

type Props = {
  children: React.ReactNode;
};

const MediaSlider = ({ children }: Props) => {
  return <StyledMediaSlider>{children}</StyledMediaSlider>;
};

export default MediaSlider;
