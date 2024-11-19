import React from "react";
import NewsList from "./NewsList";
import { useIntl } from "react-intl";
import { StyledLatestNewsCard } from "./NewsList.styled";
import type { NewsDataType } from "@crema/types/models/dashboards/Crypto";

type LatestNewsProps = {
  newsData: NewsDataType[];
};

const LatestNews: React.FC<LatestNewsProps> = ({ newsData }) => {
  const { messages } = useIntl();

  return (
    <StyledLatestNewsCard
      className="no-card-space-ltr-rtl"
      heightFull
      title={messages["dashboard.latestNews"]}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <NewsList newsData={newsData} />
    </StyledLatestNewsCard>
  );
};

export default LatestNews;
