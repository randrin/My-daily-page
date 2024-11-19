import React from "react";
import AppList from "@crema/components/AppList";
import NewsItem from "./NewsItem";
import { useIntl } from "react-intl";
import { StyledRecentNews, StyledRecentNewsLink } from "./index.styled";
import { RecentNewsObjType } from "@crema/types/models/apps/Wall";

type RecentNewsProps = {
  recentNews: RecentNewsObjType[];
};

const RecentNews: React.FC<RecentNewsProps> = ({ recentNews }) => {
  const { messages } = useIntl();
  return (
    <StyledRecentNews
      className="no-card-space-ltr-rtl"
      title={messages["wall.recentNews"]}
      actions={[<StyledRecentNewsLink key={1}>View More</StyledRecentNewsLink>]}
    >
      <AppList
        data={recentNews}
        renderItem={(item, index) => <NewsItem key={index} item={item} />}
      />
    </StyledRecentNews>
  );
};

export default RecentNews;
