import React from "react";
import AppCard from "@crema/components/AppCard";
import MarketingTable from "./MarketingTable";
import { useIntl } from "react-intl";
import type { MarketingCampaignDataType } from "@crema/types/models/dashboards/Ecommerce";

type MarketingCampaignProps = {
  marketingCampaign: MarketingCampaignDataType[];
};

const MarketingCampaign: React.FC<MarketingCampaignProps> = ({
  marketingCampaign,
}) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["eCommerce.marketingCampaign"] as string}
    >
      <MarketingTable marketingCampaignData={marketingCampaign} />
    </AppCard>
  );
};

export default MarketingCampaign;
