import React from "react";

import { Typography } from "antd";
import AppCard from "@crema/components/AppCard";
import {
  StyledAvatar,
  StyledFlex,
  StyledFlexWrapper,
  StyledPercentText,
  StyledSecondaryText,
  StyledSuccessContainer,
  StyledText,
  StyledToggleContainer,
} from "./index.styled";
import { StateDataType } from "@crema/types/models/dashboards/CRM";

type Props = {
  data: StateDataType;
};

const StateCard = ({ data }: Props) => {
  return (
    <AppCard className="card-hover">
      <StyledFlexWrapper>
        <StyledFlex>
          <StyledAvatar
            style={{
              color: data.color,
              backgroundColor: data.color + "22",
            }}
          >
            {data.icon}
            {/* <Icon
              sx={{
                fontSize: 24,
              }}
            >
              {data.icon}
            </Icon> */}
          </StyledAvatar>

          <div style={{ marginRight: 8, overflow: "hidden" }}>
            <Typography.Title level={4}>{data.value}</Typography.Title>
            <StyledText>{data.name}</StyledText>
          </div>
        </StyledFlex>
        <StyledToggleContainer>
          <StyledSuccessContainer>
            <span style={{ marginRight: 4 }}>
              <img
                src={
                  data.percentageChange > 0
                    ? "/assets/images/dashboard/up-arrow.svg"
                    : "/assets/images/dashboard/down-arrow.svg"
                }
                alt="up-icon"
              />
            </span>
            <StyledPercentText
              style={{
                color: data.percentageChange > 0 ? "#11C15B" : "#F04F47",
              }}
            >
              {data.percentageChange > 0 ? "+" : ""}
              {data.percentageChange}%
            </StyledPercentText>
          </StyledSuccessContainer>
          <StyledSecondaryText>
            <p>{data.duration}</p>
          </StyledSecondaryText>
        </StyledToggleContainer>
      </StyledFlexWrapper>
    </AppCard>
  );
};

export default StateCard;
