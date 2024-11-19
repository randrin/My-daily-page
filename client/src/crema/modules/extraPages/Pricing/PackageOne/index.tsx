import React from "react";
import PackageCard from "./PackageCard";
import { Col } from "antd";
import { StyledPackageOneCard, StyledPackageOneRow } from "./index.styled";
import { PricingObj } from "@crema/mockapi/fakedb/extraPages";

type PackageOneProps = {
  pricing: PricingObj[];
};

const PackageOne: React.FC<PackageOneProps> = ({ pricing }) => {
  return (
    <StyledPackageOneCard title="Pricing Package Style 1">
      <StyledPackageOneRow>
        {pricing.map((data, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <PackageCard pricing={data} />
          </Col>
        ))}
      </StyledPackageOneRow>
    </StyledPackageOneCard>
  );
};

export default PackageOne;
