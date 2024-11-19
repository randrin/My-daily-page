import React, { useState } from "react";
import AppCard from "@crema/components/AppCard";
import RecentContact from "./RecentContact";
import AppScrollbar from "@crema/components/AppScrollbar";
import CoinDropdown from "./CoinDropdown";
import { useIntl } from "react-intl";
import {
  StyledAmountTag,
  StyledAmountWrapper,
  StyledCoinInput,
  StyledCoinWrapper,
  StyledFlexWrapper,
  StyledRecentContact,
  StyledSecondaryText,
} from "./index.styled";
import { Button } from "antd";
import { QuickTransferType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  quickTransfer: QuickTransferType;
};
const QuickTransfer = ({ quickTransfer }: Props) => {
  const [selectedCoinId, setSelectedCoinID] = useState(
    quickTransfer.coinList[0].id
  );

  const selectedCoin = () => {
    return quickTransfer.coinList.find((coin) => coin.id === selectedCoinId);
  };
  const handleCoinChange = (value: any) => {
    setSelectedCoinID(value);
  };
  const coin = selectedCoin();
  const { messages } = useIntl();
  return (
    <AppCard
      title={messages["dashboard.crypto.quickTransfer"] as string}
      extra={
        <CoinDropdown
          coinList={quickTransfer.coinList}
          selectedCoinId={selectedCoinId}
          handleCoinChange={handleCoinChange}
        />
      }
    >
      <StyledCoinWrapper>
        <StyledCoinInput style={{ padding: "14px 0" }} />
        <StyledAmountTag>Amount {coin?.shortName}</StyledAmountTag>
      </StyledCoinWrapper>
      <StyledAmountWrapper>
        <StyledSecondaryText>Recent Contact</StyledSecondaryText>
        <AppScrollbar>
          <StyledFlexWrapper>
            {quickTransfer.recentContact.map((contact, index) => (
              <StyledRecentContact key={index}>
                <RecentContact recentContact={contact} />
              </StyledRecentContact>
            ))}
          </StyledFlexWrapper>
        </AppScrollbar>
      </StyledAmountWrapper>
      <div
        style={{
          textAlign: "right",
        }}
      >
        <Button type="primary">TRANSFER NOW</Button>
      </div>
    </AppCard>
  );
};

export default QuickTransfer;
