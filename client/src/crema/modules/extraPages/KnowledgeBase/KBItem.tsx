import React from "react";
import { Col } from "antd";
import {
  StyledKnowBadge,
  StyledKnowBadgeGroup,
  StyledKnowKbCard,
  StyledKnowKbScrollbar,
} from "./index.styled";
import { InstallationData } from "@crema/mockapi/fakedb/extraPages";

type KbItemProps = {
  data: InstallationData;
};

const KbItem: React.FC<KbItemProps> = ({ data }) => {
  return (
    <Col xs={24} sm={12} lg={8}>
      <StyledKnowKbCard>
        <h5>{data.ques}</h5>
        <StyledKnowKbScrollbar>
          <p className="mb-0">{data.ans}</p>
        </StyledKnowKbScrollbar>
        <StyledKnowBadgeGroup>
          {data.tags.map((tag, index) => {
            return <StyledKnowBadge key={index}>{tag}</StyledKnowBadge>;
          })}
        </StyledKnowBadgeGroup>
      </StyledKnowKbCard>
    </Col>
  );
};

export default KbItem;
