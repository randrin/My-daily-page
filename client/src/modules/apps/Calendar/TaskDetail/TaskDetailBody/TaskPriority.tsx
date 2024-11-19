import React from "react";
import { Select } from "antd";
import { useIntl } from "react-intl";
import { StyledTodoSelectBox } from "../index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useCalendarContext } from "../../../context/CalendarContextProvider";
import { PriorityObjType, TodoObjType } from "@crema/types/models/apps/Todo";

type Props = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const TaskPriority = ({ selectedTask, onUpdateSelectedTask }: Props) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const { priorityList } = useCalendarContext();

  const onChangePriority = (value: number) => {
    const priority = priorityList.find(
      (priority) => priority.type.toString() === value.toString()
    );
    const task = selectedTask;
    task.priority = priority as PriorityObjType;

    putDataApi<{ task: TodoObjType }>(
      "/api/calendar/task/",
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
      {priorityList.map((priority) => {
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
