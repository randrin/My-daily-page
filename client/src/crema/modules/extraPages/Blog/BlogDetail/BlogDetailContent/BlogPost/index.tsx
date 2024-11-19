import React from "react";
import {
  StyledAvatar,
  StyledBlogPostWrapper,
  StyledBox,
  StyledButton,
  StyledFlexWrapper,
  StyledTitle6,
} from "./index.styled";
import type { PostType } from "@crema/types/models/extrapages/Blog";

type Props = {
  post: PostType;
};

const BlogPost = ({ post }: Props) => {
  return (
    <StyledBlogPostWrapper>
      <StyledFlexWrapper>
        <StyledBox>
          <StyledAvatar src={post.user} />
        </StyledBox>
        <StyledTitle6>{post.userName}</StyledTitle6>
        <div className="fs-12 text-secondary">{post.userPosition}</div>
      </StyledFlexWrapper>
      <div className="text-secondary">
        <p className="text">{post.description}</p>
        <StyledButton>All author posts</StyledButton>
      </div>
    </StyledBlogPostWrapper>
  );
};

export default BlogPost;
