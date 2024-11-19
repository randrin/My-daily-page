import React, { useState } from "react";
import TaskContentHeader from "./TaskContentHeader";
import AddNewTask from "../AddNewTask";
import AppsPagination from "@crema/components/AppsPagination";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import TodoListSkeleton from "@crema/components/AppSkeleton/TodoListSkeleton";
import AppList from "@crema/components/AppList";
import {
  StyledTodoFooter,
  StyledTodoListDesktop,
  StyledTodoListMobile,
} from "./index.styled";
import { putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { TaskListItem, TaskListItemMobile } from "@crema/modules/apps/ToDo";

import { TodoObjType } from "@crema/types/models/apps/Todo";
import {
  useTodoActionsContext,
  useTodoContext,
} from "../../context/TodoContextProvider";

const TasksList = () => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const { page, loading, taskLists } = useTodoContext();
  const { onPageChange, setTodoData } = useTodoActionsContext();

  const [filterText, onSetFilterText] = useState<string>("");
  const [checkedTasks, setCheckedTasks] = useState<number[]>([]);
  const [isAddTaskOpen, setAddTaskOpen] = useState<boolean>(false);

  const onOpenAddTask = () => {
    setAddTaskOpen(true);
  };

  const onCloseAddTask = () => {
    setAddTaskOpen(false);
  };

  const onChangeCheckedTasks = (checked: boolean, id: number) => {
    if (checked) {
      setCheckedTasks(checkedTasks.concat(id));
    } else {
      setCheckedTasks(checkedTasks.filter((taskId) => taskId !== id));
    }
  };

  const onChangeStarred = (checked: boolean, task: TodoObjType) => {
    putDataApi<TodoObjType[]>(
      "/api/todo/update/starred",
      infoViewActionsContext,
      {
        taskIds: [task.id],
        status: checked,
      }
    )
      .then((data) => {
        onUpdateSelectedTask(data[0]);
        infoViewActionsContext.showMessage(
          data[0].isStarred
            ? "Todo Marked as Starred Successfully"
            : "Todo Marked as Unstarred Successfully"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onUpdateSelectedTask = (task: TodoObjType) => {
    setTodoData({
      data: taskLists?.data.map((item) => {
        if (item.id === task.id) {
          return task;
        }
        return item;
      }),
      count: taskLists?.count,
    });
  };

  const onDeleteSelectedTask = (task: TodoObjType) => {
    setTodoData({
      data: taskLists?.data.filter((item) => item.id !== task.id),
      count: taskLists?.count ? taskLists?.count - 1 : 0,
    });
  };

  const onGetFilteredItems = () => {
    if (filterText === "") {
      return taskLists?.data;
    } else {
      return taskLists?.data.filter((task) =>
        task.title.toUpperCase().includes(filterText.toUpperCase())
      );
    }
  };

  const onUpdateTasks = (tasks: TodoObjType[]) => {
    setTodoData({
      data: taskLists?.data.map((item) => {
        const contact = tasks.find((contact) => contact.id === item.id);
        if (contact) {
          return contact;
        }
        return item;
      }),
      count: taskLists?.count,
    });
  };

  const list = onGetFilteredItems();
  return (
    <>
      <AppsHeader>
        <TaskContentHeader
          taskLists={taskLists?.data}
          checkedTasks={checkedTasks}
          setCheckedTasks={setCheckedTasks}
          filterText={filterText}
          onSetFilterText={onSetFilterText}
          onUpdateTasks={onUpdateTasks}
        />
      </AppsHeader>
      <AppsContent>
        <>
          <StyledTodoListDesktop>
            <AppList
              data={list}
              renderItem={(task) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  onChangeCheckedTasks={onChangeCheckedTasks}
                  checkedTasks={checkedTasks}
                  onChangeStarred={onChangeStarred}
                  onUpdateSelectedTask={onDeleteSelectedTask}
                />
              )}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={loading}
                  actionTitle="Add Task"
                  onClick={onOpenAddTask}
                  placeholder={<TodoListSkeleton />}
                />
              }
            />
          </StyledTodoListDesktop>
          <StyledTodoListMobile>
            <AppList
              data={list}
              renderItem={(task) => (
                <TaskListItemMobile
                  key={task.id}
                  task={task}
                  checkedTasks={checkedTasks}
                  onChangeStarred={onChangeStarred}
                  onChangeCheckedTasks={onChangeCheckedTasks}
                />
              )}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={loading}
                  actionTitle="Add Task"
                  onClick={onOpenAddTask}
                  placeholder={<TodoListSkeleton />}
                />
              }
            />
          </StyledTodoListMobile>
        </>
      </AppsContent>

      {taskLists?.data?.length > 0 ? (
        <StyledTodoFooter>
          <AppsPagination
            count={taskLists?.count || 0}
            page={page}
            onChange={onPageChange}
          />
        </StyledTodoFooter>
      ) : null}

      {isAddTaskOpen ? (
        <AddNewTask
          isAddTaskOpen={isAddTaskOpen}
          onCloseAddTask={onCloseAddTask}
        />
      ) : null}
    </>
  );
};
export default TasksList;
