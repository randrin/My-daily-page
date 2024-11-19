import React from "react";
import PopularCoinsTable from "./PopularCoinsTable";
import { useIntl } from "react-intl";
import { StyledPopularCoinCard } from "./index.styled";
import type { PopularCoinsDataType } from "@crema/types/models/dashboards/Crypto";

type PopularCoinsProps = {
  popularCoins: PopularCoinsDataType[];
};

const PopularCoins: React.FC<PopularCoinsProps> = ({ popularCoins }) => {
  const { messages } = useIntl();

  return (
    <StyledPopularCoinCard
      className="no-card-space-ltr-rtl"
      heightFull
      title={messages["dashboard.popularCoins"]}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <PopularCoinsTable popularCoins={popularCoins} />
    </StyledPopularCoinCard>
  );
};

export default PopularCoins;
