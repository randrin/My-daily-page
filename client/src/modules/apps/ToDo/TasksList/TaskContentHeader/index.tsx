import React from "react";
import { useIntl } from "react-intl";
import CheckedTasksActions from "./CheckedTasksActions";
import { Checkbox } from "antd";
import {
  StyledContentHeader,
  StyledTodoHeaderCheckboxView,
  StyledTodoHeaderPagination,
  StyledTodoSearch,
} from "../index.styled";
import {
  SelectTasksDropdown,
  ViewSelectButtons,
} from "@crema/modules/apps/ToDo";

import { TodoObjType } from "@crema/types/models/apps/Todo";
import {
  useTodoActionsContext,
  useTodoContext,
} from "../../../context/TodoContextProvider";

type TaskContentHeaderProps = {
  taskLists: TodoObjType[];
  checkedTasks: number[];
  setCheckedTasks: (checkedTasks: number[]) => void;
  filterText: string;
  onSetFilterText: (text: string) => void;
  onUpdateTasks: (tasks: TodoObjType[]) => void;
  onViewModeSelect?: (mode: string) => void;
};

const TaskContentHeader: React.FC<TaskContentHeaderProps> = ({
  taskLists,
  checkedTasks,
  setCheckedTasks,
  filterText,
  onSetFilterText,
  onUpdateTasks,
}) => {
  const { page, viewMode } = useTodoContext();
  const { onPageChange, setViewMode } = useTodoActionsContext();

  const onHandleMasterCheckbox = (event: any) => {
    if (event.target.checked) {
      const taskIds = taskLists?.map((task) => task.id);
      setCheckedTasks(taskIds);
    } else {
      setCheckedTasks([]);
    }
  };

  const onSelectTasks = (value: number) => {
    switch (value) {
      case 0:
        setCheckedTasks(taskLists?.map((task) => task.id));
        break;
      case 1:
        setCheckedTasks([]);
        break;

      case 2:
        setCheckedTasks(
          taskLists?.filter((task) => task.isStarred).map((task) => task.id)
        );
        break;

      case 3:
        setCheckedTasks(
          taskLists
            ?.filter((task) => task.hasAttachments)
            .map((task) => task.id)
        );
        break;

      default:
        setCheckedTasks([]);
    }
  };

  const { messages } = useIntl();

  return (
    <>
      <StyledContentHeader>
        <StyledTodoHeaderCheckboxView>
          <Checkbox
            indeterminate={
              checkedTasks?.length > 0 &&
              checkedTasks?.length < taskLists?.length
            }
            checked={
              taskLists?.length > 0 && checkedTasks.length === taskLists?.length
            }
            onChange={onHandleMasterCheckbox}
          />
        </StyledTodoHeaderCheckboxView>

        <SelectTasksDropdown onSelectTasks={onSelectTasks} />

        <StyledTodoHeaderCheckboxView>
          {checkedTasks.length > 0 ? (
            <CheckedTasksActions
              checkedTasks={checkedTasks}
              setCheckedTasks={setCheckedTasks}
              onUpdateTasks={onUpdateTasks}
            />
          ) : null}
        </StyledTodoHeaderCheckboxView>

        <StyledTodoSearch
          placeholder={messages["common.searchHere"] as string}
          value={filterText}
          onChange={(event) => onSetFilterText(event.target.value)}
        />
        <ViewSelectButtons pageView={viewMode} onChangePageView={setViewMode} />
      </StyledContentHeader>
      {viewMode === "list" && taskLists?.length > 0 ? (
        <StyledTodoHeaderPagination
          count={taskLists?.length}
          page={page}
          onChange={onPageChange}
        />
      ) : null}
    </>
  );
};

export default TaskContentHeader;
