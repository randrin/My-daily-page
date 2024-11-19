import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { CheckOutlined } from "@ant-design/icons";
import { StyledTodoDetailStatusBtn } from "../index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { TodoObjType } from "@crema/types/models/apps/Todo";

type Props = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const StatusToggleButton = ({ selectedTask, onUpdateSelectedTask }: Props) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const onChangeTaskStatus = (status: number) => {
    const task = selectedTask;
    task.status = status;

    putDataApi<{ task: TodoObjType }>(
      "/api/calendar/task/",
      infoViewActionsContext,
      {
        task,
      }
    )
      .then((data) => {
        onUpdateSelectedTask(data.task);
        infoViewActionsContext.showMessage("Task Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  return (
    <>
      {selectedTask.status === 1003 ? (
        <StyledTodoDetailStatusBtn
          className="bg-color"
          onClick={() => onChangeTaskStatus(1001)}
        >
          <CheckOutlined className="check-icon" />
          <IntlMessages id="todo.completed" />
        </StyledTodoDetailStatusBtn>
      ) : (
        <StyledTodoDetailStatusBtn onClick={() => onChangeTaskStatus(3)}>
          <CheckOutlined className="check-icon" />
          <IntlMessages id="todo.markAsCompleted" />
        </StyledTodoDetailStatusBtn>
      )}
    </>
  );
};

export default StatusToggleButton;
