import React from "react";
import { Select } from "antd";
import { useIntl } from "react-intl";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

import { TodoObjType, LabelObjType } from "@crema/types/models/apps/Todo";

type TaskLabelProps = {
  selectedTask: TodoObjType;
  onUpdateSelectedTask: (data: TodoObjType) => void;
};

const TaskLabel: React.FC<TaskLabelProps> = ({
  selectedTask,
  onUpdateSelectedTask,
}) => {
  const [{ apiData: labelList }] = useGetDataApi("/api/todo/labels/list", []);
  const infoViewActionsContext = useInfoViewActionsContext();

  const onChangePriority = (value: string) => {
    selectedTask.label = labelList.filter((label: LabelObjType) =>
      value.includes(String(label.id))
    );
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
    <Select
      placeholder={messages["common.label"] as string}
      maxTagCount={2}
      style={{ minWidth: 100 }}
      mode="multiple"
      defaultValue={
        selectedTask?.label.find((label: LabelObjType) => label.id)?.name
      }
      onChange={onChangePriority}
    >
      {labelList.map((label: LabelObjType) => {
        return (
          <Select.Option value={label.id} key={label.id}>
            {label.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};
export default TaskLabel;
