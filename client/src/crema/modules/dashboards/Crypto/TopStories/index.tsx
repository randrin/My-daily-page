import React from "react";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import StoriesItem from "./StoriesItem";
import AppScrollbar from "@crema/components/AppScrollbar";
import { StyledStoryWrapper } from "./index.styled";
import { StoryType } from "@crema/types/models/dashboards/Crypto";

type Props = {
  stories: StoryType[];
};

const TopStories = ({ stories }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      title={messages["dashboard.crypto.topStories"] as string}
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <AppScrollbar style={{ maxHeight: 388, px: 5 }}>
        <StyledStoryWrapper>
          {stories.map((stories, index) => (
            <div key={index} className="stories-item">
              <StoriesItem stories={stories} />
            </div>
          ))}
        </StyledStoryWrapper>
      </AppScrollbar>
    </AppCard>
  );
};

export default TopStories;
