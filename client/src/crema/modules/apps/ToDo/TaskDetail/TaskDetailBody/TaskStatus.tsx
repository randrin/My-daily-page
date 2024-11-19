import React from "react";
import { Select } from "antd";
import { useIntl } from "react-intl";
import { StyledTodoSelectBox } from "../index.styled";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { StatusObjType, TodoObjType } from "@crema/types/models/apps/Todo";

type TaskDetailHeaderProps = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask?: (data: TodoObjType) => void;
};

const TaskStatus: React.FC<TaskDetailHeaderProps> = ({
  selectedTask,
  onUpdateSelectedTask,
}) => {
  const [{ apiData: statusList }] = useGetDataApi("/api/todo/status/list", []);
  const infoViewActionsContext = useInfoViewActionsContext();

  const onChangeStatus = (value: number) => {
    selectedTask.status = value;
    putDataApi<TodoObjType[]>("/api/todoApp/task/", infoViewActionsContext, {
      task: selectedTask,
    })
      .then((data) => {
        if (onUpdateSelectedTask) onUpdateSelectedTask(data[0]);
        infoViewActionsContext.showMessage("Task Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const { messages } = useIntl();

  return (
    <StyledTodoSelectBox
      onChange={(value) => onChangeStatus(value as number)}
      value={selectedTask?.status}
      placeholder={messages["common.status"] as string}
    >
      {statusList.map((status: StatusObjType) => {
        return (
          <Select.Option key={status.type} value={status.type}>
            {status.name}
          </Select.Option>
        );
      })}
    </StyledTodoSelectBox>
  );
};

export default TaskStatus;
