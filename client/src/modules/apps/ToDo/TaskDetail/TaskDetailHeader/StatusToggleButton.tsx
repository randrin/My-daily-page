import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { CheckOutlined } from "@ant-design/icons";
import { StyledTodoDetailStatusBtn } from "../index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { TodoObjType } from "@crema/types/models/apps/Todo";

type StatusToggleButtonProps = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const StatusToggleButton: React.FC<StatusToggleButtonProps> = ({
  selectedTask,
  onUpdateSelectedTask,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const onChangeTaskStatus = (status: number) => {
    const task = selectedTask;
    task.status = status;

    putDataApi<{ task: TodoObjType }>(
      "/api/todoApp/task/",
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

  return selectedTask.status === 3 ? (
    <StyledTodoDetailStatusBtn
      className="bg-color"
      onClick={() => onChangeTaskStatus(1)}
    >
      <CheckOutlined className="check-icon" />
      <IntlMessages id="todo.completed" />
    </StyledTodoDetailStatusBtn>
  ) : (
    <StyledTodoDetailStatusBtn onClick={() => onChangeTaskStatus(3)}>
      <CheckOutlined className="check-icon" />
      <IntlMessages id="todo.markAsCompleted" />
    </StyledTodoDetailStatusBtn>
  );
};

export default StatusToggleButton;
