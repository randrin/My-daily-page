import React from "react";
import ReviewItem from "./ReviewItem";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { List } from "antd";
import { StyledReviewScrollbar } from "./index.styled";
import type { ReviewsListType } from "@crema/types/models/dashboards/Widgets";

type ReviewsProps = {
  data: ReviewsListType[];
};

const Reviews: React.FC<ReviewsProps> = ({ data }) => {
  const { messages } = useIntl();

  return (
    <AppCard
      heightFull
      className="no-card-space-ltr-rtl"
      title={messages["common.reviews"] as string}
    >
      <StyledReviewScrollbar>
        <List
          dataSource={data}
          renderItem={(item) => {
            return <ReviewItem key={item.id} item={item} />;
          }}
        />
      </StyledReviewScrollbar>
    </AppCard>
  );
};

export default Reviews;
