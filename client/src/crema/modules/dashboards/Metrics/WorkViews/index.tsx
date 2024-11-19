import React from "react";
import WorkViewsGraph from "./WorkViewsGraph";
import IntlMessages from "@crema/helpers/IntlMessages";
import { StyledWorkViewCard } from "./index.styled";
import type { WorkViewsDataType } from "@crema/types/models/dashboards/Metrics";

type WorkViewsProps = {
  data: WorkViewsDataType;
};

const WorkViews: React.FC<WorkViewsProps> = ({ data }) => {
  return (
    <StyledWorkViewCard heightFull>
      <h3>{data.views}</h3>
      <p>
        <IntlMessages id="dashboard.workViews" />
      </p>

      <WorkViewsGraph data={data.graphData} />
    </StyledWorkViewCard>
  );
};

export default WorkViews;
