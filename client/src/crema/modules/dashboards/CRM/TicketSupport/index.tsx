import React from "react";
import TicketSupportTable from "./TicketSupportTable";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import type { TicketSupportDataType } from "@crema/types/models/dashboards/CRM";

type TicketSupportProps = {
  ticketSupportData: TicketSupportDataType[];
};

const TicketSupport: React.FC<TicketSupportProps> = ({ ticketSupportData }) => {
  const { messages } = useIntl();

  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.latestTicketSupport"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <TicketSupportTable ticketSupportData={ticketSupportData} />
    </AppCard>
  );
};

export default TicketSupport;
