import React from "react";
import { useIntl } from "react-intl";
import AppCard from "@crema/components/AppCard";
import GainerLooserTable from "./GainerLooserTable";
import { GainerLooserType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  data: GainerLooserType[];
};
const GainerLooser = ({ data }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.crypto.topGainersTopLosers"] as string}
    >
      <GainerLooserTable data={data} />
    </AppCard>
  );
};

export default GainerLooser;
