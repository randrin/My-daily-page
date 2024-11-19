import React, { useState } from "react";
import CategoryItem from "./CategoryItem";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { Button } from "antd";

import { CloseOutlined } from "@ant-design/icons";
import {
  StyledCategoryListHalf,
  StyledCategoryScrollbar,
} from "./index.styled";
import type { CategoriesDataType } from "@crema/types/models/dashboards/Widgets";
import { CheckboxChangeEvent } from "antd/es/checkbox/Checkbox";

type CategoriesProps = {
  data: CategoriesDataType[];
};

const Categories: React.FC<CategoriesProps> = ({ data }) => {
  const { messages } = useIntl();

  const [categoryList, handleList] = useState(data);

  const handleChange = (
    e: CheckboxChangeEvent,
    category: CategoriesDataType
  ) => {
    category.isChecked = e.target.checked;
    const list = categoryList.map((item) =>
      item.id === category.id ? category : item
    );
    handleList(list);
  };

  return (
    <AppCard
      heightFull
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.categories"] as string}
      extra={
        <Button className="close-btn">
          <CloseOutlined />
        </Button>
      }
    >
      <StyledCategoryScrollbar>
        <StyledCategoryListHalf
          dataSource={categoryList}
          renderItem={(item: any, index: number) => (
            <CategoryItem key={index} item={item} handleChange={handleChange} />
          )}
        />
      </StyledCategoryScrollbar>
    </AppCard>
  );
};

export default Categories;
