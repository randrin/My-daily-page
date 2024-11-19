import React from "react";
import { Tooltip } from "antd";
import { MdLabelOutline } from "react-icons/md";
import {
  StyledTodoLabelGroup,
  StyledTodoLabelGroupItem,
} from "../index.styled";
import { LabelObjType } from "@crema/types/models/apps/Todo";

type LabelsProps = {
  labels: LabelObjType[];
};

const Labels: React.FC<LabelsProps> = ({ labels }) => {
  return (
    <StyledTodoLabelGroup className="todo-list-item-label-group">
      {labels.map((label) => {
        return (
          <Tooltip title={label.name} placement="top" key={label.id}>
            <StyledTodoLabelGroupItem style={{ color: label.color }}>
              <MdLabelOutline />
            </StyledTodoLabelGroupItem>
          </Tooltip>
        );
      })}
    </StyledTodoLabelGroup>
  );
};

export default Labels;
