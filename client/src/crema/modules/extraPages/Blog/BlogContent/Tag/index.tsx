import React from "react";
import { StyledFlexTag, StyledTag, StyledTagWrapper } from "../index.styled";
import type { TagType } from "@crema/types/models/extrapages/Blog";

type Props = {
  tag: TagType[];
};

const Tag = ({ tag }: Props) => {
  return (
    <StyledFlexTag>
      {tag.map((tag, index) => (
        <StyledTagWrapper key={index}>
          <StyledTag>{tag.name}</StyledTag>
        </StyledTagWrapper>
      ))}
    </StyledFlexTag>
  );
};

export default Tag;
