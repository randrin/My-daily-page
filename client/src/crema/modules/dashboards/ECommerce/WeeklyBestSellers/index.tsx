import React from "react";
import AppCard from "@crema/components/AppCard";
import AppList from "@crema/components/AppList";
import AppScrollbar from "@crema/components/AppScrollbar";

import BestSellersCell from "./BestSellersCell";
import { useIntl } from "react-intl";
import type { BestSellerType } from "@crema/types/models/dashboards/Ecommerce";

type Props = {
  data: BestSellerType[];
};

const WeeklyBestSellers = ({ data }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["dashboard.eCommerce.weeklyBestSellers"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <AppScrollbar style={{ maxHeight: 230 }}>
        <AppList
          data={data}
          renderItem={(bestSeller) => (
            <BestSellersCell key={bestSeller.id} bestSeller={bestSeller} />
          )}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default WeeklyBestSellers;
