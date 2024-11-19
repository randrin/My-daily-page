import React from 'react';
import { StyledBlogDetailHeaderWrapper } from '../index.styled';

const blogBgImage = '/assets/images/extra-pages/blog/blog-detail-header.png';

type Props = {
  children: React.ReactNode;
};

const BlogDetailHeaderWrapper = ({ children }: Props) => {
  return (
    <StyledBlogDetailHeaderWrapper
      style={{
        backgroundImage: `url(${blogBgImage})`,
      }}
    >
      {children}
    </StyledBlogDetailHeaderWrapper>
  );
};

export default BlogDetailHeaderWrapper;
