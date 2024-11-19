import React from "react";
import AppCircularProgress from "@crema/components/AppCircularProgress";
import { rgba } from "polished";
import { Typography } from "antd";
import { StyledTextNoSpace } from "./index.styled";
import { MonthlyLimitType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  monthlyLimit: MonthlyLimitType;
};
const MonthlyLimitItem = ({ monthlyLimit }: Props) => {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          marginBottom: 6,
        }}
      >
        <AppCircularProgress
          strokeColor={monthlyLimit.activeColor}
          trailColor={rgba(monthlyLimit.activeColor, 0.1)}
          percent={monthlyLimit.value}
          thickness={3}
        />
      </div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <Typography.Text strong>{monthlyLimit.title}</Typography.Text>
        <StyledTextNoSpace>{monthlyLimit.income}</StyledTextNoSpace>
      </div>
    </div>
  );
};

export default MonthlyLimitItem;
