import React, { useState } from "react";
import BlogCommentForm from "./BlogCommentForm";
import BlogCommentList from "./BlogCommentList";
import AppCard from "@crema/components/AppCard";
import IntlMessages from "@crema/helpers/IntlMessages";
import { StyledTitle3 } from "./index.styled";
import { BlogCommentType } from "@crema/types/models/extrapages/Blog";

type Props = {
  comment?: BlogCommentType[];
};

const BlogComment = ({ comment }: Props) => {
  const [comments, setComments] = useState<BlogCommentType[]>(comment || []);

  return (
    <AppCard>
      <BlogCommentList comments={comments} />
      <div style={{ position: "relative" }}>
        <StyledTitle3>
          <IntlMessages id="extraPages.writeComments" />
        </StyledTitle3>
        <BlogCommentForm comments={comments} setComments={setComments} />
      </div>
    </AppCard>
  );
};

export default BlogComment;
