import React from "react";
import AppList from "@crema/components/AppList";
import CommentItem from "./CommentItem";
import {
  StyledPostCommentList,
  StyledPostCommentListTitle,
} from "../../index.styled";
import { CommentObjType } from "@crema/types/models/apps/Wall";

type CommentsListProps = {
  comments: CommentObjType[];
};

const CommentsList: React.FC<CommentsListProps> = ({ comments }) => {
  return (
    <StyledPostCommentList>
      <StyledPostCommentListTitle>Comments</StyledPostCommentListTitle>
      <AppList
        data={comments}
        renderItem={(item, index) => <CommentItem key={index} item={item} />}
      />
    </StyledPostCommentList>
  );
};

export default CommentsList;
