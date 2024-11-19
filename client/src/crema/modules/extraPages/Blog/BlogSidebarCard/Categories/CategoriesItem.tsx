import React from "react";
import { StyledSecondaryText2, StyledText } from "../RecentPost/index.styled";

import { CategoriesType } from "@crema/types/models/extrapages/Blog";

type Props = {
  categories: CategoriesType;
};

const CategoriesItem = ({ categories }: Props) => {
  return (
    <StyledSecondaryText2>
      <p>{categories.title}</p>
      <StyledText>{categories.number}</StyledText>
    </StyledSecondaryText2>
  );
};

export default CategoriesItem;
