import React from "react";
import { StyledDesc, StyledTitle } from "./index.styled";
import { CardDetailType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  cardDetail: CardDetailType;
};
const CardDetailItem = ({ cardDetail }: Props) => {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <StyledTitle level={5}>{cardDetail.title}</StyledTitle>
      <StyledDesc>{cardDetail.name}</StyledDesc>
    </div>
  );
};

export default CardDetailItem;
