import React from "react";
import AppCard from "@crema/components/AppCard";
import ProductCell from "./ProductCell";
import { useIntl } from "react-intl";
import { StyledPopularScrollbar, StyledPowerGrid } from "./index.styled";
import type { PopularProductDataType } from "@crema/types/models/dashboards/Ecommerce";
import AppSelect from "@crema/components/AppSelect";

type PopularProductsProps = {
  popularProducts: PopularProductDataType[];
};

const PopularProducts: React.FC<PopularProductsProps> = ({
  popularProducts,
}) => {
  const { messages } = useIntl();
  const handleSelectionType = () => {
    // console.log('handleSelectionType');
  };

  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["eCommerce.popularProducts"] as string}
      extra={
        <AppSelect
          menus={[
            messages["dashboard.thisWeek"],
            messages["dashboard.lastWeeks"],
            messages["dashboard.lastMonth"],
          ]}
          defaultValue={messages["dashboard.thisWeek"]}
          onChange={handleSelectionType}
        />
      }
    >
      <StyledPopularScrollbar style={{ height: 355 }}>
        <StyledPowerGrid
          dataSource={popularProducts}
          renderItem={(data: any, index) => (
            <ProductCell key={"product-" + index} data={data} />
          )}
        />
      </StyledPopularScrollbar>
    </AppCard>
  );
};

export default PopularProducts;
