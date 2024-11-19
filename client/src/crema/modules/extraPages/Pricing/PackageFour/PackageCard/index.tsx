import React from "react";
import { List } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  StyledPricingFourBtn,
  StyledPricingFourBtnView,
  StyledPricingFourCard,
  StyledPricingFourCardCircle,
  StyledPricingFourCardList,
  StyledPricingFourContent,
  StyledPricingFourHeader,
} from "./index.styled";
import { PricingObj } from "@crema/mockapi/fakedb/extraPages";

type PackageCardProps = {
  pricing: PricingObj;
};

const PackageCard = ({ pricing }: PackageCardProps) => {
  return (
    <StyledPricingFourCard>
      <StyledPricingFourContent>
        <StyledPricingFourHeader>
          <StyledPricingFourCardCircle
            style={{ backgroundColor: pricing.priceColor }}
          >
            <h3>
              <span className="price">${pricing.price}</span>
              /month
            </h3>
            <h5>{pricing.title}</h5>
          </StyledPricingFourCardCircle>
        </StyledPricingFourHeader>
        <StyledPricingFourCardList>
          {pricing.pricingList.map((data, index) => (
            <List.Item key={index}>
              <CheckOutlined className="icon" />
              <p>{data.title}</p>
            </List.Item>
          ))}
        </StyledPricingFourCardList>
      </StyledPricingFourContent>
      <StyledPricingFourBtnView>
        <StyledPricingFourBtn style={{ backgroundColor: pricing.priceColor }}>
          Get started
        </StyledPricingFourBtn>
      </StyledPricingFourBtnView>
    </StyledPricingFourCard>
  );
};

export default PackageCard;
