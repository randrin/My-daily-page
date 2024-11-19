import React from "react";
import { Select } from "antd";
import { useIntl } from "react-intl";
import { StyledTodoSelectBox } from "../index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useCalendarContext } from "../../../context/CalendarContextProvider";
import { TodoObjType } from "@crema/types/models/apps/Todo";

type Props = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const TaskStatus = ({ selectedTask, onUpdateSelectedTask }: Props) => {
  const { statusList } = useCalendarContext();
  const infoViewActionsContext = useInfoViewActionsContext();

  const onChangeStatus = (value: number) => {
    selectedTask.status = value;
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
      onChange={(value) => onChangeStatus(value as number)}
      value={selectedTask?.status}
      placeholder={messages["common.status"] as string}
    >
      {statusList.map((status) => {
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
