import React from "react";
import AccountGraph from "./AccountGraph";
import { useIntl } from "react-intl";
import {
  StyledYourAccountCard,
  StyledYourAccountCardGraph,
} from "./index.styled";
import type { AccountDataType } from "@crema/types/models/dashboards/Metrics";

type YourAccountPorps = {
  data: AccountDataType[];
};

const YourAccount: React.FC<YourAccountPorps> = ({ data }) => {
  const { messages } = useIntl();
  return (
    <StyledYourAccountCard heightFull title={messages["dashboard.yourAccount"]}>
      <StyledYourAccountCardGraph>
        <AccountGraph data={data} />
      </StyledYourAccountCardGraph>
    </StyledYourAccountCard>
  );
};

export default YourAccount;
