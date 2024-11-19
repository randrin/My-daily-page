import React from "react";
import BlogDetailHeaderWrapper from "./BlogDetailHeaderWrapper";
import { BiCommentDetail, BiUserCircle } from "react-icons/bi";
import { AiOutlineCalendar } from "react-icons/ai";
import {
  StyledFlex1,
  StyledFlex2,
  StyledFlex3,
  StyledIconWrapper,
  StyledTitle2,
} from "../index.styled";
import { BlogDetailHeaderType } from "@crema/types/models/extrapages/Blog";

const getBlogDetailHeaderIcon = (icon: string) => {
  switch (icon) {
    case "BiUserCircle":
      return <BiUserCircle />;
    case "AiOutlineCalendar":
      return <AiOutlineCalendar />;
    default:
      return <BiCommentDetail />;
  }
};

type Props = {
  title?: string;
  blogDetailHeader?: BlogDetailHeaderType[];
};
const BlogDetailHeader = ({ title, blogDetailHeader }: Props) => {
  return (
    <BlogDetailHeaderWrapper>
      <StyledFlex1>
        <StyledTitle2>{title}</StyledTitle2>

        <StyledFlex2>
          {blogDetailHeader?.map((data, index) => (
            <StyledFlex3 key={index}>
              <StyledIconWrapper>
                {getBlogDetailHeaderIcon(data.icon)}
              </StyledIconWrapper>
              <span>{data.title}</span>
            </StyledFlex3>
          ))}
        </StyledFlex2>
      </StyledFlex1>
    </BlogDetailHeaderWrapper>
  );
};

export default BlogDetailHeader;
