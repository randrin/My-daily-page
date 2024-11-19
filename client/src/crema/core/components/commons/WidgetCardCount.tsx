import AppCard from "@crema/components/AppCard";
import React from "react";
import {
  StyledWidgetCardCountStaticsContent,
  StyledWidgetCardCountStaticsThumb,
  StyledWidgetCardCountStatistics,
} from "../index.styled";

type WidgetStaticsProps = {
  icon: any;
  value: number;
  name: string;
};
const WidgetCardCount: React.FC<WidgetStaticsProps> = ({
  icon,
  value,
  name,
}) => {
  // Render
  return (
    <AppCard heightFull className="card-hover">
      <StyledWidgetCardCountStatistics>
        <StyledWidgetCardCountStaticsThumb>
          {icon}
        </StyledWidgetCardCountStaticsThumb>
        <StyledWidgetCardCountStaticsContent>
          <h5 className="text-truncate title">{value}</h5>
          <p className="text-truncate">{name}</p>
        </StyledWidgetCardCountStaticsContent>
      </StyledWidgetCardCountStatistics>
    </AppCard>
  );
};

export default WidgetCardCount;
