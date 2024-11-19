import React, { useState } from "react";
import { SmileOutlined } from "@ant-design/icons";
import AppIconButton from "@crema/components/AppIconButton";
import { MdOutlineAttachFile } from "react-icons/md";
import {
  StyledAddComment,
  StyledAddCommentInput,
  StyledAddCommentUser,
  StyledAddCommentUserInfo,
  StyledAddSuffixAction,
  StyledPostItemAvatar,
} from "../index.styled";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { postDataApi } from "@crema/hooks/APIHooks";
import { WallDataType } from "@crema/types/models/apps/Wall";

type AddCommentProps = {
  postId: number;
  wallData: WallDataType | null;
  setPostList: any;
};

const AddComment: React.FC<AddCommentProps> = ({
  postId,
  wallData,
  setPostList,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [comment, setComment] = useState("");

  const submitComment = (event: any) => {
    if (event.key === "Enter") {
      const newComment = {
        author: {
          name: wallData!.name,
          profilePic: wallData!.profilePic,
          id: wallData!.id,
        },
        comment,
      };
      postDataApi("/wall/posts/comments", infoViewActionsContext, {
        postId,
        comment: newComment,
      })
        .then((data) => {
          setPostList(data);
          infoViewActionsContext.showMessage("Comment Added Successfully!");
        })
        .catch((error) => {
          infoViewActionsContext.fetchError(error.message);
        });
      setComment("");
    }
  };

  return (
    <StyledAddComment>
      <StyledPostItemAvatar src={wallData!.profilePic} />
      <StyledAddCommentUser>
        <StyledAddCommentUserInfo>
          <StyledAddCommentInput
            placeholder="Write a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={submitComment}
            suffix={
              <StyledAddSuffixAction>
                <AppIconButton icon={<SmileOutlined />} />
                <AppIconButton icon={<MdOutlineAttachFile />} />
              </StyledAddSuffixAction>
            }
          />
        </StyledAddCommentUserInfo>
      </StyledAddCommentUser>
    </StyledAddComment>
  );
};

export default AddComment;
