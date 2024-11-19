import React from "react";
import { Select } from "antd";
import { useIntl } from "react-intl";
import { StyledTodoSelectBox } from "../index.styled";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

import { PriorityObjType, TodoObjType } from "@crema/types/models/apps/Todo";

type TaskPriorityProps = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const TaskPriority: React.FC<TaskPriorityProps> = ({
  selectedTask,
  onUpdateSelectedTask,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [{ apiData: priorityList }] = useGetDataApi<PriorityObjType[]>(
    "/api/todo/priority/list",
    []
  );

  const onChangePriority = (value: number) => {
    selectedTask.priority = priorityList.find(
      (priority: PriorityObjType) => priority.type === value
    ) as PriorityObjType;
    putDataApi<{ task: TodoObjType }>(
      "/api/todoApp/task/",
      infoViewActionsContext,
      {
        task: selectedTask,
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

  const { messages } = useIntl();
  return (
    <StyledTodoSelectBox
      defaultValue={selectedTask?.priority?.type}
      placeholder={messages["common.priority"] as string}
      onChange={(value) => onChangePriority(value as number)}
    >
      {priorityList.map((priority: PriorityObjType) => {
        return (
          <Select.Option key={priority.id} value={priority.type}>
            {priority.name}
          </Select.Option>
        );
      })}
    </StyledTodoSelectBox>
  );
};
export default TaskPriority;
