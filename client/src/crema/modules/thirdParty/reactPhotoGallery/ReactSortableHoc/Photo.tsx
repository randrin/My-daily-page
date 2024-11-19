import React, { CSSProperties } from 'react';

const imgWithClick = { cursor: 'pointer' };

type Props = {
  index: number;
  onClick?: any;
  photo: {
    width: number;
    height: number;
    title: string;
  };
  margin: number;
  direction: string;
  top: number;
  left: number;
};

const Photo = ({
  index,
  onClick,
  photo,
  margin,
  direction,
  top,
  left,
}: Props) => {
  const imgStyle: CSSProperties = { margin: margin };
  if (direction === 'column') {
    imgStyle.position = 'absolute';
    imgStyle.left = left;
    imgStyle.top = top;
  }

  const handleClick = (event: any) => {
    onClick(event, { photo, index });
  };

  return (
    <img
      style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
      {...photo}
      onClick={onClick ? handleClick : undefined}
      alt="img"
    />
  );
};

export default Photo;
