import React from "react";
import PostItem from "./PostItem";
import { StyledPostList } from "./index.styled";
import { PostObjType, WallDataType } from "@crema/types/models/apps/Wall";

type PostListsProps = {
  postList: PostObjType[];
  setPostList: any;
  wallData: WallDataType;
};
const PostsList: React.FC<PostListsProps> = ({
  wallData,
  postList,
  setPostList,
}) => {
  return (
    <StyledPostList
      data={postList}
      renderItem={(post: PostObjType, index: number) => (
        <PostItem
          key={index}
          post={post}
          wallData={wallData}
          setPostList={setPostList}
          isLast={postList.length - 1 === index}
        />
      )}
    />
  );
};

export default PostsList;
