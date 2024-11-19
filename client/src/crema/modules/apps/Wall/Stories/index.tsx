import React from "react";
import StoriesItem from "./StoriesItem";
import { useIntl } from "react-intl";
import {
  StyledStoriesCard,
  StyledStoriesCol,
  StyledStoriesRow,
} from "./index.styled";
import { StoriesDataType } from "@crema/types/models/apps/Wall";

type StoriesProps = {
  stories: StoriesDataType[];
};

const Stories: React.FC<StoriesProps> = ({ stories }) => {
  const { messages } = useIntl();

  return (
    <StyledStoriesCard
      title={messages["wall.stories"]}
      extra={<a href="#/">{messages["common.viewAll"] as string}</a>}
    >
      <StyledStoriesRow>
        {stories.map((data) => (
          <StyledStoriesCol key={data.id}>
            <StoriesItem data={data} />
          </StyledStoriesCol>
        ))}
      </StyledStoriesRow>
    </StyledStoriesCard>
  );
};

export default Stories;
