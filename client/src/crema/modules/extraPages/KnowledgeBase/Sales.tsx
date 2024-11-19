import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import KBItem from "./KBItem";
import AppRowContainer from "@crema/components/AppRowContainer";
import { StyledKnowSales } from "./index.styled";
import AppAnimate from "@crema/components/AppAnimate";
import { SalesData } from "@crema/mockapi/fakedb/extraPages";

type SalesDataProps = {
  saleQueries: SalesData[];
};

const Sales: React.FC<SalesDataProps> = ({ saleQueries }) => {
  return (
    <StyledKnowSales>
      <AppAnimate animation="transition.slideLeftIn" delay={200}>
        <h3>
          <IntlMessages id="knowledge.sales" />
        </h3>
      </AppAnimate>
      <AppRowContainer>
        {saleQueries.map((sale, index) => (
          <KBItem data={sale} key={index} />
        ))}
      </AppRowContainer>
    </StyledKnowSales>
  );
};

export default Sales;
