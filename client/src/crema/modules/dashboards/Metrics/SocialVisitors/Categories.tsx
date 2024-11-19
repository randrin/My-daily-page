import React from "react";
import {
  StyledSocialVisitorCategories,
  StyledSocialVisitorCategoryItem,
  StyledSocialVisitorCategoryTitle,
} from "./index.styled";
import { SocialVisitorsDataType } from "@crema/types/models/dashboards/Metrics";

type CategoriesProps = {
  data: SocialVisitorsDataType[];
};

const Categories: React.FC<CategoriesProps> = ({ data }) => {
  return (
    <StyledSocialVisitorCategories>
      {data.map((item) => {
        return (
          <StyledSocialVisitorCategoryItem key={item.id}>
            <StyledSocialVisitorCategoryTitle>
              <span className="dot" style={{ backgroundColor: item.color }} />
              <p className="categories-title">{item.visitors}</p>
            </StyledSocialVisitorCategoryTitle>
            <p>{item.name}</p>
          </StyledSocialVisitorCategoryItem>
        );
      })}
    </StyledSocialVisitorCategories>
  );
};

export default Categories;
