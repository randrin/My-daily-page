import React from "react";
import AppCard from "@crema/components/AppCard";

import AppSelect from "@crema/components/AppSelect";
import OrderTable from "./OrderTable";
import { useIntl } from "react-intl";
import type { RecentOrderDataType } from "@crema/types/models/dashboards/Ecommerce";

type RecentOrdersProps = {
  recentOrders: RecentOrderDataType[];
};

const RecentOrders: React.FC<RecentOrdersProps> = ({ recentOrders }) => {
  const { messages } = useIntl();
  const handleSelectionType = (data: RecentOrderDataType) => {
    console.log("data: ", data);
  };
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["eCommerce.recentOrders"] as string}
      extra={
        <AppSelect
          menus={[
            messages["dashboard.thisWeek"],
            messages["dashboard.lastWeeks"],
            messages["dashboard.lastMonth"],
          ]}
          defaultValue={messages["dashboard.thisWeek"]}
          onChange={handleSelectionType}
        />
      }
    >
      <OrderTable orderData={recentOrders} />
    </AppCard>
  );
};

export default RecentOrders;
