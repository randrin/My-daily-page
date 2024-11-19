import React from "react";
import CategoriesItem from "./CategoriesItem";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppList from "@crema/components/AppList";
import { StyledRecentPost, StyledTitle3Non } from "../RecentPost/index.styled";
import { CategoriesType } from "@crema/types/models/extrapages/Blog";

type Props = {
  categories: CategoriesType[];
};

const Categories = ({ categories }: Props) => {
  return (
    <StyledRecentPost>
      <StyledTitle3Non>
        <IntlMessages id="dashboard.categories" />
      </StyledTitle3Non>
      <div
        style={{
          position: "relative",
        }}
      >
        <AppList
          data={categories}
          renderItem={(categories, index) => (
            <CategoriesItem key={index} categories={categories} />
          )}
        />
      </div>
    </StyledRecentPost>
  );
};

export default Categories;
