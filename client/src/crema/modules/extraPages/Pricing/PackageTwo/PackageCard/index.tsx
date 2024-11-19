import React from "react";
import { List } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  StyledPricingTwoCard,
  StyledPricingTwoCardBtn,
  StyledPricingTwoCardBtnView,
  StyledPricingTwoCardContent,
  StyledPricingTwoCardHeader,
  StyledPricingTwoCardHeaderTitle,
  StyledPricingTwoCardList,
  StyledPricingTwoCardPricingValue,
  StyledPricingTwoCardValue,
} from "./index.styled";
import { PricingObj } from "@crema/mockapi/fakedb/extraPages";

type PackageCardProps = {
  pricing: PricingObj;
};

const PackageCard: React.FC<PackageCardProps> = ({ pricing }) => {
  return (
    <StyledPricingTwoCard>
      <StyledPricingTwoCardHeader>
        <StyledPricingTwoCardHeaderTitle>
          {pricing.title}
        </StyledPricingTwoCardHeaderTitle>
        <p>{pricing.description}</p>
      </StyledPricingTwoCardHeader>
      <StyledPricingTwoCardValue>
        <StyledPricingTwoCardPricingValue>
          <h3>
            <span className="dollar">$</span>
            <span
              className="price"
              style={{
                color: pricing.priceColor,
              }}
            >
              {pricing.price}
            </span>
            /month
          </h3>
        </StyledPricingTwoCardPricingValue>
        <p>{pricing.priceDescription}</p>
      </StyledPricingTwoCardValue>
      <StyledPricingTwoCardContent>
        <StyledPricingTwoCardList>
          {pricing.pricingList.map((data, index) => (
            <List.Item key={index}>
              <CheckOutlined className="icon" />
              <p>{data.title}</p>
            </List.Item>
          ))}
        </StyledPricingTwoCardList>
        <StyledPricingTwoCardBtnView>
          <StyledPricingTwoCardBtn
            style={{
              backgroundColor: pricing.priceColor,
              color: "white",
              borderColor: pricing.priceColor,
            }}
          >
            Get started
          </StyledPricingTwoCardBtn>
        </StyledPricingTwoCardBtnView>
      </StyledPricingTwoCardContent>
    </StyledPricingTwoCard>
  );
};

export default PackageCard;
