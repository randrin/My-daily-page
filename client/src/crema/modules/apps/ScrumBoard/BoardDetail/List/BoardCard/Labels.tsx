import React from "react";
import { Tooltip } from "antd";
import {
  StyledScrumBoardLabel,
  StyledScrumBoardLabelFlex,
} from "./index.styled";
import { LabelObjType } from "@crema/types/models/apps/ScrumbBoard";

type LabelsProps = {
  labels: LabelObjType[];
};

const Labels: React.FC<LabelsProps> = ({ labels }) => {
  return (
    <StyledScrumBoardLabelFlex>
      {labels.map((label) => {
        return (
          <Tooltip title={label.name} placement="top" key={label.id}>
            <StyledScrumBoardLabel
              key={label.id}
              style={{ backgroundColor: label.color }}
            />
          </Tooltip>
        );
      })}
    </StyledScrumBoardLabelFlex>
  );
};

export default Labels;
