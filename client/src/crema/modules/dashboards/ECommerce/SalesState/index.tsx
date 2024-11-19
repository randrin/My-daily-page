import React from "react";
import { Typography } from "antd";
import {
  StyledRow,
  StyledStateCard,
  StyledStateContent,
  StyledStateThumb,
} from "./index.styled";
import type { SalesStateDataType } from "@crema/types/models/dashboards/Ecommerce";

const { Title } = Typography;

type SalesStateProps = {
  state: SalesStateDataType;
};

const SalesState: React.FC<SalesStateProps> = (props) => {
  const { bgColor, icon, type, value } = props.state;
  return (
    <StyledStateCard
      className="card-hover"
      style={{ backgroundColor: bgColor }}
    >
      <StyledRow>
        <StyledStateThumb>
          <img src={icon} alt={value} />
        </StyledStateThumb>
        <StyledStateContent>
          <Title className="text-truncate" level={3}>
            {value}
          </Title>
          <p className="text-truncate">{type}</p>
        </StyledStateContent>
      </StyledRow>
    </StyledStateCard>
  );
};

export default SalesState;
