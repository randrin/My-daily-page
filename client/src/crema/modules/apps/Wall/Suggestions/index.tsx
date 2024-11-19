import React from "react";
import AppList from "@crema/components/AppList";
import SuggestionItem from "./SuggestionItem";
import { useIntl } from "react-intl";
import { StyledSuggestionAction, StyledSuggestionCard } from "./index.styled";
import { SuggestionObjType } from "@crema/types/models/apps/Wall";

type SuggestionsProps = {
  suggestions: SuggestionObjType[];
};

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions }) => {
  const { messages } = useIntl();
  return (
    <StyledSuggestionCard
      className="no-card-space-ltr-rtl"
      title={messages["wall.suggestions"]}
      actions={[
        <StyledSuggestionAction key={1}>View More</StyledSuggestionAction>,
      ]}
    >
      <AppList
        data={suggestions}
        renderItem={(item, index) => <SuggestionItem key={index} item={item} />}
      />
    </StyledSuggestionCard>
  );
};

export default Suggestions;
