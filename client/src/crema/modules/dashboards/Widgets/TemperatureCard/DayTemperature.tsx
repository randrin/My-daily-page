import React from "react";
import { StyledDayTempItem } from "./index.styled";
import type { TemperaturesType } from "@crema/types/models/dashboards/Widgets";

type DayTemperatureProps = {
  day: TemperaturesType;
};

const DayTemperature: React.FC<DayTemperatureProps> = ({ day }) => {
  return (
    <StyledDayTempItem>
      <p>{day.day}</p>
      <span>
        <img src={day.image} alt="weather" />
      </span>
    </StyledDayTempItem>
  );
};

export default DayTemperature;
