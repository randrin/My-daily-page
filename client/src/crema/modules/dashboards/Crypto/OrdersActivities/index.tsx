import React from "react";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import OrdersActivitiesTable from "./OrdersActivitiesTable";
import { OrdersActivityType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  ordersActivities: OrdersActivityType[];
};
const OrdersActivities = ({ ordersActivities }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.crypto.ordersActivities"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <OrdersActivitiesTable ordersActivities={ordersActivities} />
    </AppCard>
  );
};

export default OrdersActivities;
