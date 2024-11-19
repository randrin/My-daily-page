import React from "react";
import PackageCard from "./PackageCard";
import { Col } from "antd";
import { StyledPackageThreeCard, StyledPackageThreeRow } from "./index.styled";
import { PricingObj } from "@crema/mockapi/fakedb/extraPages";

type PackageThreeProps = {
  pricing: PricingObj[];
};

const PackageThree: React.FC<PackageThreeProps> = ({ pricing }) => {
  return (
    <StyledPackageThreeCard title="Pricing Package Style 3">
      <StyledPackageThreeRow>
        {pricing.map((data, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <PackageCard pricing={data} />
          </Col>
        ))}
      </StyledPackageThreeRow>
    </StyledPackageThreeCard>
  );
};

export default PackageThree;
