import React, { useState } from "react";
import AddNewTask from "../AddNewTask";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import { TaskCalender } from "@crema/modules/apps/Calendar";
import {
  useCalendarActionsContext,
  useCalendarContext,
} from "../../context/CalendarContextProvider";

const TasksList = () => {
  const { taskLists } = useCalendarContext();
  const { setCalenderData, reCallAPI } = useCalendarActionsContext();

  const [filterText, onSetFilterText] = useState("");

  const [isAddTaskOpen, setAddTaskOpen] = React.useState(false);

  const onCloseAddTask = () => {
    setAddTaskOpen(false);
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

  const onUpdateTask = (task: any) => {
    setCalenderData({
      data: taskLists?.data.map((item) => (item.id === task.id ? task : item)),
      count: taskLists?.count,
    });
  };

  const list = onGetFilteredItems();

  return (
    <>
      <AppsContent fullView>
        <TaskCalender
          taskList={list}
          onUpdateTask={onUpdateTask}
          onSetFilterText={onSetFilterText}
        />
      </AppsContent>

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
