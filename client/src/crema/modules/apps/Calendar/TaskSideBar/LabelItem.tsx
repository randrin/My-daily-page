import React from "react";
import NavLink from "next/link";
import { StyledTodoDots, StyledTodoLabelItem } from "./index.styled";
import { LabelObjType } from "@crema/types/models/apps/Todo";

type Props = {
  label: LabelObjType;
};

const LabelItem = ({ label }: Props) => {
  return (
    <StyledTodoLabelItem>
      <NavLink href={`/apps/calender/label/${label.alias}`}>
        <StyledTodoDots
          className="todo-dots"
          style={{ backgroundColor: label.color }}
        />
        {label.name}
      </NavLink>
    </StyledTodoLabelItem>
  );
};

export default LabelItem;
