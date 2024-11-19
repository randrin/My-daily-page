import React from "react";
import BlogSidebarCard from "../BlogSidebarCard";
import Blogs from "./Blogs";
import AppRowContainer from "@crema/components/AppRowContainer";
import { StyledCol1, StyledCol2 } from "./index.styled";
import {
  BlogContentType,
  BlogSidebarType,
} from "@crema/types/models/extrapages/Blog";

type Props = {
  blogSidebar: BlogSidebarType;
  blogContent: BlogContentType[];
};

const BlogContent = ({ blogSidebar, blogContent }: Props) => {
  return (
    <AppRowContainer>
      <StyledCol1 xs={24} md={8} lg={8} xl={6}>
        <BlogSidebarCard blogSidebar={blogSidebar} />
      </StyledCol1>
      <StyledCol2 xs={24} md={16} lg={16} xl={18}>
        <Blogs blogs={blogContent} />
      </StyledCol2>
    </AppRowContainer>
  );
};

export default BlogContent;
