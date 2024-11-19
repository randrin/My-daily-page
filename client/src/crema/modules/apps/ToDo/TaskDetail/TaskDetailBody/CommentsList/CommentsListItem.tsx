import React from "react";
import clsx from "clsx";
import {
  StyledTodoAvatar36,
  StyledTodoCommentItem,
  StyledTodoCommentMsg,
  StyledTodoCommentMsgView,
  StyledTodoCommentTime,
  StyledTodoCommentUser,
  StyledTodoCommentView,
} from "../../index.styled";
import { CommentObjType } from "@crema/types/models/apps/Todo";

type CommentsListItemProps = {
  item: CommentObjType;
  isPreviousSender: boolean;
  isLast: boolean;
};

const CommentsListItem: React.FC<CommentsListItemProps> = ({
  item,
  isPreviousSender = false,
  isLast,
}) => {
  return (
    <StyledTodoCommentItem
      className={clsx(
        isPreviousSender ? "hideUserInfo" : "first-chat-message",
        isLast ? "last-chat-message" : ""
      )}
    >
      <StyledTodoCommentView>
        <StyledTodoCommentUser className="todo-comment-user">
          {item.image ? (
            <StyledTodoAvatar36 src={item.image} />
          ) : (
            <StyledTodoAvatar36 className="todo-avatar-name">
              {item.name[0]}
            </StyledTodoAvatar36>
          )}
          <span className="todo-name">{item.name}</span>
        </StyledTodoCommentUser>
        <StyledTodoCommentMsgView>
          <StyledTodoCommentTime className="todo-comment-time">
            {item.date}
          </StyledTodoCommentTime>
          <StyledTodoCommentMsg>
            <p>{item.comment}</p>
          </StyledTodoCommentMsg>
        </StyledTodoCommentMsgView>
      </StyledTodoCommentView>
    </StyledTodoCommentItem>
  );
};

export default CommentsListItem;
