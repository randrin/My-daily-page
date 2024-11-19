import React from "react";
import PremiumBrandWrapper from "./PremiumBrandWrapper";
import { StyledTitlewrapper2, StyledTitlewrapper5 } from "./index.styled";
import type { PremiumBrandType } from "@crema/types/models/extrapages/Portfolio";

type Props = {
  premiumBrand: PremiumBrandType;
};

const PremiumBrand = ({ premiumBrand }: Props) => {
  return (
    <PremiumBrandWrapper>
      <img src={premiumBrand.srcImg} alt={premiumBrand.subTitle} />
      <div className="premium-brand-content">
        <StyledTitlewrapper5>{premiumBrand.subTitle}</StyledTitlewrapper5>
        <StyledTitlewrapper2>{premiumBrand.title}</StyledTitlewrapper2>
      </div>
    </PremiumBrandWrapper>
  );
};

export default PremiumBrand;
