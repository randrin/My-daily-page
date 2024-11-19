import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppList from "@crema/components/AppList";
import CommentsListItem from "./CommentsListItem";
import {
  StyledTodoComment,
  StyledTodoCommentArea,
  StyledTodoCommentBody,
  StyledTodoCommentScroll,
  StyledTodoCommentTitle,
} from "../../index.styled";
import { CommentObjType } from "@crema/types/models/apps/Todo";

type Props = {
  comments: CommentObjType[];
};

const CommentsList = ({ comments }: Props) => {
  return (
    <>
      {comments.length > 0 ? (
        <StyledTodoComment>
          <StyledTodoCommentTitle>
            <IntlMessages id="common.comments" />
          </StyledTodoCommentTitle>
          <StyledTodoCommentBody>
            <StyledTodoCommentScroll>
              <StyledTodoCommentArea>
                <AppList
                  data={comments}
                  renderItem={(item, index) => (
                    <CommentsListItem
                      item={item}
                      key={index}
                      isPreviousSender={
                        index > 0 && item.name === comments[index - 1].name
                      }
                      isLast={
                        (index + 1 < comments.length &&
                          item.name !== comments[index + 1].name) ||
                        index + 1 === comments.length
                      }
                    />
                  )}
                />
              </StyledTodoCommentArea>
            </StyledTodoCommentScroll>
          </StyledTodoCommentBody>
        </StyledTodoComment>
      ) : null}
    </>
  );
};

export default CommentsList;
