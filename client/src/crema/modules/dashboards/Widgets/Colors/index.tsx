import React, { useState } from "react";
import ColorItem from "./ColorItem";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { List } from "antd";
import { StyledColorScrollbar } from "./index.styled";
import type { ColorsListType } from "@crema/types/models/dashboards/Widgets";

type ColorsProps = {
  data: ColorsListType[];
};

const Colors: React.FC<ColorsProps> = ({ data }) => {
  const [colorsList, handleList] = useState(data);

  const handleChange = (e: any, color: ColorsListType) => {
    color.isChecked = e.target.checked;
    const list = colorsList.map((item) =>
      item.id === color.id ? color : item
    );
    handleList(list);
  };
  const { messages } = useIntl();
  return (
    <AppCard
      heightFull
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.colors"] as string}
    >
      <StyledColorScrollbar>
        <List
          dataSource={data}
          renderItem={(item) => {
            return (
              <ColorItem
                key={item.id}
                item={item}
                handleChange={handleChange}
              />
            );
          }}
        />
      </StyledColorScrollbar>
    </AppCard>
  );
};

export default Colors;
