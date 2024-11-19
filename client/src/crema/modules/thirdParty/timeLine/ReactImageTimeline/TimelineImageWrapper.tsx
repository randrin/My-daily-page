import React from 'react';
import { StyledTimelineImage } from './index.styled';

type Props = {
  children: React.ReactNode;
};

const TimelineImageWrapper = ({ children }: Props) => {
  return <StyledTimelineImage>{children}</StyledTimelineImage>;
};

export default TimelineImageWrapper;
