import React, { useState } from "react";
import clsx from "clsx";
import {
  StyledPostCommentItem,
  StyledPostCommentItemContent,
  StyledPostCommentItemContentArea,
  StyledPostItemAvatar,
  StyledPostCommentItemAction,
} from "../../index.styled";
import { CommentObjType } from "@crema/types/models/apps/Wall";

type CommentItemProps = {
  item: CommentObjType;
};

const CommentItem: React.FC<CommentItemProps> = ({ item }) => {
  const { author, comment, liked } = item;
  const [isLiked, setIsLiked] = useState(liked);

  const toggleLikeStatus = () => {
    setIsLiked(!isLiked);
  };

  return (
    <StyledPostCommentItem>
      <StyledPostItemAvatar src={author.profilePic} />
      <StyledPostCommentItemContent>
        <StyledPostCommentItemContentArea>
          <p className="mb-0">{comment}</p>
        </StyledPostCommentItemContentArea>
        <StyledPostCommentItemAction>
          <span
            className={clsx("pointer", { active: isLiked })}
            onClick={toggleLikeStatus}
          >
            Like
          </span>
          <span className="pointer">Reply</span>
        </StyledPostCommentItemAction>
      </StyledPostCommentItemContent>
    </StyledPostCommentItem>
  );
};

export default CommentItem;
