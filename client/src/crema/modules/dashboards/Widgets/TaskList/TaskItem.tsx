import React from "react";
import { StyledTaskListItem } from "./index.styled";
import type { TaskListDataType } from "@crema/types/models/dashboards/Widgets";

type TaskItemPorps = {
  item: TaskListDataType;
};

const TaskItem: React.FC<TaskItemPorps> = ({ item }) => {
  return (
    <StyledTaskListItem key={item.id} className="item-hover">
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </StyledTaskListItem>
  );
};

export default TaskItem;
