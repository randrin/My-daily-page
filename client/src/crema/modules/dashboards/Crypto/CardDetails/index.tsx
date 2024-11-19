import React from "react";
import AppCard from "@crema/components/AppCard";
import CardDetailItem from "./CardDetailItem";
import MonthlyLimitItem from "./MonthlyLimitItem";
import { useIntl } from "react-intl";
import {
  StyledCardDetailContainer,
  StyledCardDetailWrapper,
  StyledCardWrapper,
  StyledDetailItemContainer,
  StyledText,
} from "./index.styled";
import { CardDetailsType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  cardDetails: CardDetailsType;
};

const CardDetails = ({ cardDetails }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard title={messages["dashboard.crypto.cardDetails"] as string}>
      <StyledCardWrapper>
        <StyledCardDetailWrapper>
          {cardDetails.cardDetail.map((data, index) => (
            <StyledCardDetailContainer key={index}>
              <CardDetailItem cardDetail={data} />
            </StyledCardDetailContainer>
          ))}
        </StyledCardDetailWrapper>
      </StyledCardWrapper>
      <div
        style={{
          position: "relative",
        }}
      >
        <StyledText>Monthly Limits</StyledText>
        <StyledCardDetailWrapper>
          {cardDetails.monthlyLimit.map((data, index) => (
            <StyledDetailItemContainer key={index}>
              <MonthlyLimitItem monthlyLimit={data} />
            </StyledDetailItemContainer>
          ))}
        </StyledCardDetailWrapper>
      </div>
    </AppCard>
  );
};

export default CardDetails;
