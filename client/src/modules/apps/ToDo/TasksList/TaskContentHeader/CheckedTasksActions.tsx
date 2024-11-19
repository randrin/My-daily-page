import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppsDeleteIcon from "@crema/components/AppsDeleteIcon";
import { useRouter } from "next/router";
import { Dropdown } from "antd";
import { MdLabelOutline } from "react-icons/md";
import AppIconButton from "@crema/components/AppIconButton";
import { StyledTodoHeaderCheckedAction } from "../index.styled";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";

import { LabelObjType, TodoObjType } from "@crema/types/models/apps/Todo";
import {
  useTodoActionsContext,
  useTodoContext,
} from "../../../context/TodoContextProvider";

type CheckedTasksActionsProps = {
  checkedTasks: number[];
  setCheckedTasks: (tasks: number[]) => void;
  onUpdateTasks: (tasks: TodoObjType[]) => void;
};

const CheckedTasksActions: React.FC<CheckedTasksActionsProps> = ({
  checkedTasks,
  setCheckedTasks,
  onUpdateTasks,
}) => {
  const { asPath } = useRouter();
  const path = asPath.split("/");
  const { labelList, page } = useTodoContext();
  const { setTodoData } = useTodoActionsContext();
  const infoViewActionsContext = useInfoViewActionsContext();

  const onDeleteTasks = () => {
    putDataApi<TodoObjType[]>(
      "/api/todo/update/folder",
      infoViewActionsContext,
      {
        taskIds: checkedTasks,
        type: path[path.length - 2],
        name: path[path.length - 1],
        page,
      }
    )
      .then((data) => {
        setTodoData({ data, count: data.length });
        infoViewActionsContext.showMessage("Task Deleted Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });

    setCheckedTasks([]);
  };

  const onSelectLabel = (key: number) => {
    putDataApi("/api/todo/update/label", infoViewActionsContext, {
      taskIds: checkedTasks,
      type: +key,
    })
      .then((data) => {
        onUpdateTasks(data as TodoObjType[]);
        infoViewActionsContext.showMessage("Task Updated Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
    setCheckedTasks([]);
  };

  const menuLabel = labelList.map((label: LabelObjType, index: number) => {
    return {
      key: index,
      label: <span onClick={() => onSelectLabel(label.id)}> {label.name}</span>,
    };
  });

  return (
    <StyledTodoHeaderCheckedAction>
      <AppsDeleteIcon
        deleteAction={onDeleteTasks}
        deleteTitle={<IntlMessages id="todo.deleteMessage" />}
      />

      <Dropdown menu={{ items: menuLabel }} trigger={["click"]}>
        <AppIconButton
          title={<IntlMessages id="common.label" />}
          icon={<MdLabelOutline />}
        />
      </Dropdown>
    </StyledTodoHeaderCheckedAction>
  );
};
export default CheckedTasksActions;
