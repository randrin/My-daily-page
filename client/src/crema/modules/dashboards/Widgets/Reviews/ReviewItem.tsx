import React from "react";
import { Rate } from "antd";
import {
  StyledItemBy,
  StyledReviewBy,
  StyledReviewItem,
  StyledReviewItemHeader,
} from "./index.styled";
import type { ReviewsListType } from "@crema/types/models/dashboards/Widgets";

type ReviewItemProps = {
  item: ReviewsListType;
};

const ReviewItem: React.FC<ReviewItemProps> = ({ item }) => {
  return (
    <StyledReviewItem className="item-hover" key={item.id}>
      <StyledReviewItemHeader>
        <Rate value={item.rating} />
        <StyledReviewBy>{item.time}</StyledReviewBy>
      </StyledReviewItemHeader>
      <p>{item.content}</p>
      <StyledItemBy>- {item.by}</StyledItemBy>
    </StyledReviewItem>
  );
};

export default ReviewItem;
