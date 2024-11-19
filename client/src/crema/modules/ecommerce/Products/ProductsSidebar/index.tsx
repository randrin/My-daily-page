import React, { useEffect, useState } from "react";
import ProductsCategory from "./ProductsCategory";
import PriceSelector from "./PriceSelector";
import AppList from "@crema/components/AppList";
import CheckedCell from "./CheckedCell";
import RatingCell from "./RatingCell";
import AppScrollbar from "@crema/components/AppScrollbar";
import AppGrid from "@crema/components/AppGrid";
import ColorCell from "./ColorCell";
import {
  StyledProductSidebar,
  StyledProductSidebarItem,
  StyledProductSidebarItemTitle,
  StyledProductSidebarTitle,
} from "./index.styled";
import {
  brandData,
  discountList,
  idealFor,
  productColors,
} from "@crema/mockapi/fakedb";
import type { ProductDataFilterType } from "@crema/types/models/ecommerce/EcommerceApp";

type Props = {
  filterData: ProductDataFilterType;
  setFilterData: (data: ProductDataFilterType) => void;
};
const ProductSidebar = ({ filterData, setFilterData }: Props) => {
  const [selectedBrand, setSelectedBrand] = useState<number[]>(
    filterData.brand
  );
  const [selectedFor, setSelectedFor] = useState<number[]>(filterData.ideaFor);
  const [selectedDiscount, setSelectedDiscount] = useState<number[]>(
    filterData.discount
  );
  const [selectedColor, setSelectedColor] = useState<number[]>(
    filterData.color
  );
  const [customerRating, setCustomerRating] = useState<number[]>(
    filterData.rating
  );

  useEffect(() => {
    setFilterData({
      title: filterData.title,
      brand: selectedBrand,
      ideaFor: selectedFor,
      discount: selectedDiscount,
      color: selectedColor,
      rating: customerRating,
    });
  }, [
    filterData.title,
    selectedBrand,
    selectedFor,
    selectedDiscount,
    selectedColor,
    customerRating,
  ]);

  const onSelectBrand = (brandId: number) => {
    if (selectedBrand.some((brand) => brand === brandId)) {
      setSelectedBrand(selectedBrand.filter((brand) => brand !== brandId));
    } else {
      setSelectedBrand(selectedBrand.concat(brandId));
    }
  };

  const onSelectFor = (id: number) => {
    if (selectedFor.some((item) => item === id)) {
      setSelectedFor(selectedFor.filter((item) => item !== id));
    } else {
      setSelectedFor(selectedFor.concat(id));
    }
  };

  const onSelectDiscount = (id: number) => {
    if (selectedDiscount.some((item) => item === id)) {
      setSelectedDiscount(selectedDiscount.filter((item) => item !== id));
    } else {
      setSelectedDiscount(selectedDiscount.concat(id));
    }
  };

  const onSelectColor = (id: number) => {
    if (selectedColor.some((item) => item === id)) {
      setSelectedColor(selectedColor.filter((item) => item !== id));
    } else {
      setSelectedColor(selectedColor.concat(id));
    }
  };

  const onSelectRating = (id: number) => {
    if (customerRating.some((item) => item === id)) {
      setCustomerRating(customerRating.filter((item) => item !== id));
    } else {
      setCustomerRating(customerRating.concat(id));
    }
  };

  return (
    <AppScrollbar>
      <StyledProductSidebar>
        <StyledProductSidebarTitle>Filter By</StyledProductSidebarTitle>

        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>
            Categories
          </StyledProductSidebarItemTitle>
          <ProductsCategory />
        </StyledProductSidebarItem>
        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>Price</StyledProductSidebarItemTitle>
          <PriceSelector />
        </StyledProductSidebarItem>
        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>Brand</StyledProductSidebarItemTitle>
          <AppList
            data={brandData}
            renderItem={(data) => (
              <CheckedCell
                key={data.id}
                data={data}
                onChange={onSelectBrand}
                selected={selectedBrand}
              />
            )}
          />
        </StyledProductSidebarItem>
        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>
            Ideal For
          </StyledProductSidebarItemTitle>
          <AppList
            data={idealFor}
            renderItem={(data) => (
              <CheckedCell
                key={data.id}
                data={data}
                onChange={onSelectFor}
                selected={selectedFor}
              />
            )}
          />
        </StyledProductSidebarItem>

        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>
            Discount
          </StyledProductSidebarItemTitle>
          <AppList
            data={discountList}
            renderItem={(data) => (
              <CheckedCell
                key={data.id}
                data={data}
                onChange={onSelectDiscount}
                selected={selectedDiscount}
              />
            )}
          />
        </StyledProductSidebarItem>

        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>Color</StyledProductSidebarItemTitle>
          <AppGrid
            data={Object.values(productColors)}
            responsive={{
              xs: 5,
              sm: 5,
              md: 5,
              lg: 5,
              xl: 5,
              xxl: 5,
            }}
            itemPadding={1}
            renderItem={(data, index) => (
              <ColorCell
                key={"color-" + index}
                data={data}
                selected={selectedColor}
                onChange={onSelectColor}
              />
            )}
          />
        </StyledProductSidebarItem>

        <StyledProductSidebarItem>
          <StyledProductSidebarItemTitle>
            Customer Ratings
          </StyledProductSidebarItemTitle>
          <AppList
            data={[5, 4, 3, 2, 1]}
            renderItem={(data) => (
              <RatingCell
                key={data}
                data={data}
                onChange={onSelectRating}
                selected={customerRating}
              />
            )}
          />
        </StyledProductSidebarItem>
      </StyledProductSidebar>
    </AppScrollbar>
  );
};

export default ProductSidebar;
