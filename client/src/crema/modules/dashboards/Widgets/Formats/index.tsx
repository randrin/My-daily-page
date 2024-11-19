import React from "react";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { Radio } from "antd";
import { StyledFormatRadioGroup } from "./index.styled";
import type { FormatListType } from "@crema/types/models/dashboards/Widgets";

type FormatsProps = {
  data: FormatListType[];
};

const Formats: React.FC<FormatsProps> = ({ data }) => {
  const { messages } = useIntl();

  return (
    <AppCard heightFull title={messages["dashboard.formats"] as string}>
      <StyledFormatRadioGroup name="radiogroup" defaultValue={data[0].id}>
        {data.map((item) => {
          return (
            <Radio key={item.id} value={item.name}>
              {item.name}
            </Radio>
          );
        })}
      </StyledFormatRadioGroup>
    </AppCard>
  );
};

export default Formats;
