import React from 'react';
import { StyledMediaWrapper } from './index.styled';

type MediaSliderProps = {
  children: React.ReactNode;
};

const MediaSlider = ({ children }: MediaSliderProps) => {
  return <StyledMediaWrapper>{children}</StyledMediaWrapper>;
};

export default MediaSlider;
