import React from "react";
import PackageCard from "./PackageCard";
import { Col } from "antd";
import { StyledPackageOneCard, StyledPackageOneRow } from "./index.styled";
import type { PricingOneNewType } from "@crema/types/models/extrapages/Pricing";

type Props = {
  billingFormat: string;
  pricing: PricingOneNewType[];
};

const PackageOneNew = ({ billingFormat, pricing }: Props) => {
  return (
    <StyledPackageOneCard>
      <StyledPackageOneRow>
        {pricing.map((data, index) => (
          <Col xs={24} md={12} lg={6} key={index}>
            <PackageCard billingFormat={billingFormat} pricing={data} />
          </Col>
        ))}
      </StyledPackageOneRow>
    </StyledPackageOneCard>
  );
};

export default PackageOneNew;
