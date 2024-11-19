import React from "react";
import {
  StyledSuggestionAvatar,
  StyledSuggestionItem,
  StyledSuggestionItemContent,
} from "./index.styled";
import { SuggestionObjType } from "@crema/types/models/apps/Wall";

type SuggestionItemProps = {
  item: SuggestionObjType;
};

const SuggestionItem: React.FC<SuggestionItemProps> = ({ item }) => {
  return (
    <StyledSuggestionItem className="item-hover">
      <StyledSuggestionAvatar src={item.thumb} alt={item.name} />
      <StyledSuggestionItemContent>
        <h4>{item.name}</h4>
        <p>{item.desc}</p>
      </StyledSuggestionItemContent>
    </StyledSuggestionItem>
  );
};

export default SuggestionItem;
