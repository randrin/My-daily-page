import React from "react";
import EarningGraph from "./EarningGraph";
import Categories from "./Categories";
import { useIntl } from "react-intl";
import {
  StyledEarningMonthCard,
  StyledEarningMonthGraphView,
} from "./index.styled";
import type { EarningInMonthDataType } from "@crema/types/models/dashboards/Metrics";

type EarningInMonthProps = {
  data: EarningInMonthDataType[];
};

const EarningInMonth: React.FC<EarningInMonthProps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <StyledEarningMonthCard
      title={messages["dashboard.earningInMonth"]}
      actions={[<Categories key={1} data={data} />]}
      heightFull
    >
      <StyledEarningMonthGraphView>
        <EarningGraph data={data} />
      </StyledEarningMonthGraphView>
    </StyledEarningMonthCard>
  );
};

export default EarningInMonth;
