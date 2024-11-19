import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AppCard from "@crema/components/AppCard";
import {
  StyledCityInfoImg,
  StyledCityInfoImgContent,
  StyledCityInfoSlide,
  StyledCityInfoSlider,
  StyledSliderImgContentAction,
} from "./index.styled";
import type { CityDataType } from "@crema/types/models/dashboards/Widgets";

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

type CityInfoProps = {
  cityData: CityDataType[];
};

const CityInfo: React.FC<CityInfoProps> = ({ cityData }) => {
  return (
    <AppCard heightFull className="no-card-space">
      <StyledCityInfoSlider {...settings}>
        {cityData.map((city) => {
          return (
            <StyledCityInfoSlide key={city.id}>
              <StyledCityInfoImg src={city.image} alt="building" />
              <StyledCityInfoImgContent>
                <h3>{city.name}</h3>

                <StyledSliderImgContentAction>
                  <p>{city.desc}</p>
                </StyledSliderImgContentAction>
              </StyledCityInfoImgContent>
            </StyledCityInfoSlide>
          );
        })}
      </StyledCityInfoSlider>
    </AppCard>
  );
};

export default CityInfo;
