import React from "react";
import { Tag } from "antd";
import { PriorityObjType } from "@crema/types/models/apps/Todo";

type PriorityProps = {
  priority: PriorityObjType;
};

const Priority: React.FC<PriorityProps> = ({ priority }) => {
  return (
    <Tag color={priority.color + "20"} style={{ color: priority.color }}>
      {priority.name}
    </Tag>
  );
};

export default Priority;
