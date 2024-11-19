import React from "react";
import AppCard from "@crema/components/AppCard";
import StatGraphs from "./StatGraphs";
import { useIntl } from "react-intl";
import { AtcStaticType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  data: AtcStaticType[];
};

const ATCStatics = ({ data }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard title={messages["dashboard.crypto.atcStatics"] as string}>
      <StatGraphs data={data} />
    </AppCard>
  );
};

export default ATCStatics;
