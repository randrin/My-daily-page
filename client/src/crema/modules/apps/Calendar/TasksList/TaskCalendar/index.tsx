import React, { useState } from "react";
import { momentLocalizer, stringOrDate } from "react-big-calendar";
import moment from "moment";
import { StyledCalendar } from "./Calendar.style";
// import "./calendar.css";
import CustomToolbar from "./CustomToolbar";
import TaskItem from "./TaskItem";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import { TodoObjType } from "@crema/types/models/apps/Todo";
import { useRouter } from "next/router";

const DragAndDropCalendar = withDragAndDrop(StyledCalendar);

const localizer = momentLocalizer(moment);

type Props = {
  taskList: TodoObjType[];
  onUpdateTask: (data: object) => void;
  onSetFilterText: (text: string) => void;
};
const TaskCalender = ({ taskList, onUpdateTask, onSetFilterText }: Props) => {
  const [isAddTaskOpen, setAddTaskOpen] = useState(false);
  const router = useRouter();
  const { all } = router.query;

  let folder = "";
  let label = "";
  if (all?.length === 2) {
    label = all[1];
  } else if (all?.length === 1) {
    folder = all[0];
  }
  const [selectedDate, setSelectedDate] = useState(null);

  const onSelectDate = ({ start }: { start: any }) => {
    console.log("start: ", start);
    setSelectedDate(start);
    setAddTaskOpen(true);
  };

  const onOpenAddTask = (data: any) => {
    if (data) {
      onViewTaskDetail(data);
    } else {
      if (selectedDate) {
        setAddTaskOpen(true);
      } else {
        setAddTaskOpen(false);
      }
    }
  };

  const onViewTaskDetail = (task: TodoObjType) => {
    if (folder) router.push(`/apps/calender/folder/${folder}/${task.id}`);
    if (label) router.push(`/apps/calender/label/${label}/${task.id}`);
  };

  const resizeEvent = ({
    event,
    start,
    end,
  }: {
    event: object;
    start: stringOrDate;
    end: stringOrDate;
    isAllDay: boolean;
  }) => {
    // onUpdateTask({ ...event, startDate: start, endDate: end });
    console.log("resizeEvent: ", event, start, end);
  };

  const moveEvent = ({
    event,
    start,
    end,
    isAllDay: droppedOnAllDaySlot,
  }: {
    event: object;
    start: stringOrDate;
    end: stringOrDate;
    isAllDay: boolean;
  }) => {
    onUpdateTask({ ...event, startDate: start, endDate: end });
  };

  const getEvents = () => {
    if (taskList?.length > 0)
      return taskList.map((task) => {
        return {
          ...task,
          title: task.title,
          start: task.startDate,
          end: task.endDate,
        };
      });
    return [];
  };

  console.log("taskList", taskList, getEvents());

  return (
    <DragAndDropCalendar
      localizer={localizer}
      events={getEvents()}
      views={["month", "agenda"]}
      tooltipAccessor={undefined}
      showMultiDayTimes
      resizable
      onEventResize={resizeEvent}
      onEventDrop={moveEvent}
      onSelectEvent={onOpenAddTask}
      components={{
        toolbar: (props) => (
          <AppsHeader>
            <CustomToolbar onSetFilterText={onSetFilterText} {...props} />
          </AppsHeader>
        ),
        event: (item) => <TaskItem key={item.title} item={item.event} />,
      }}
      popup
      selectable
      onSelectSlot={onSelectDate}
      defaultView="month"
    />
  );
};
export default TaskCalender;
