import React from "react";
import { Button, Typography } from "antd";
import { BiPencil } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
import { StyledText, StyledTodoCellWrapper } from "./index.styled";
import { TodoListType } from "@crema/types/models/dashboards/CRM";

type Props = {
  todo: TodoListType;
  key?: number;
};
const TodoCell = ({ todo, key }: Props) => {
  return (
    <StyledTodoCellWrapper>
      <div className="date-view">
        <h4 className="date-view">{todo.date.split(" ")[0]}</h4>
        <p>{todo.date.split(" ")[1]}</p>
      </div>
      <div className="contentArea">
        <div
          style={{
            flex: 1,
            marginRight: 4,
          }}
        >
          <Typography.Title level={5}>{todo.title}</Typography.Title>
          <StyledText>{todo.time_from}</StyledText>
        </div>
        <span
          style={{
            position: "relative",
          }}
        >
          <Button
            type="primary"
            shape="circle"
            className="icon-btn icon-btn-pencil"
            icon={<BiPencil />}
          />
          <Button
            type="primary"
            shape="circle"
            className="icon-btn"
            icon={<BsCheck />}
          />
        </span>
      </div>
    </StyledTodoCellWrapper>
  );
};

export default TodoCell;
