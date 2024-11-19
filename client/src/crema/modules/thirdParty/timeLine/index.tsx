import React from "react";
import { Col } from "antd";

import AppComponentCard from "@crema/components/AppComponentCard";
import AppComponentHeader from "@crema/components/AppComponentHeader";

import Custom from "./Custom";
import CustomSource from "raw-loader!./Custom";

import ReactImageTimeline from "./ReactImageTimeline";
import ReactImageTimelineSource from "raw-loader!./ReactImageTimeline";
import AppRowContainer from "@crema/components/AppRowContainer/AppRowSimpleContainer";

const Timeline = () => {
  return (
    <>
      <AppComponentHeader
        title="Timeline"
        description="A React component for playing a variety of URLs, including file paths, YouTube, Facebook, Twitch, SoundCloud, Streamable, Vimeo, Wistia, Mixcloud, and DailyMotion."
        refUrl="https://cookpete.com/react-player/"
      />

      <AppRowContainer>
        <Col span={24}>
          <AppComponentCard
            title="Custom"
            maxHeight={700}
            component={Custom}
            source={CustomSource}
          />
        </Col>
        <Col span={24}>
          <AppComponentCard
            title="React Image Timeline"
            maxHeight={700}
            component={ReactImageTimeline}
            source={ReactImageTimelineSource}
          />
        </Col>
      </AppRowContainer>
    </>
  );
};

export default Timeline;
