import React from "react";
import PackageCard from "./PackageCard";
import { Col } from "antd";
import { StyledPackageTwoCard, StyledPackageTwoRow } from "./index.styled";
import { PricingObj } from "@crema/mockapi/fakedb/extraPages";

type PackageTwoProps = {
  pricing: PricingObj[];
};

const PackageTwo: React.FC<PackageTwoProps> = ({ pricing }) => {
  return (
    <StyledPackageTwoCard title="Pricing Package Style 2">
      <StyledPackageTwoRow>
        {pricing.map((data, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <PackageCard pricing={data} />
          </Col>
        ))}
      </StyledPackageTwoRow>
    </StyledPackageTwoCard>
  );
};

export default PackageTwo;
