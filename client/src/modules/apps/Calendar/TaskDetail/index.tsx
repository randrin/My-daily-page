import React, { useEffect } from "react";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskDetailBody from "./TaskDetailBody";
import { useRouter } from "next/router";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import { MailDetailSkeleton } from "@crema/components/AppSkeleton/MailDetailSkeleton";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { TodoObjType } from "@crema/types/models/apps/Todo";

const TaskDetail = () => {
  const { query } = useRouter();
  const [{ apiData: selectedTask }, { setQueryParams, setData }] =
    useGetDataApi<TodoObjType>(
      "/api/calendar/task/",
      undefined,
      { id: query?.all?.[query.all.length - 1] },
      false
    );

  useEffect(() => {
    setQueryParams({ id: query?.all?.[query.all.length - 1] });
  }, [query.all]);

  const onUpdateSelectedTask = (data: TodoObjType) => {
    setData(data);
  };

  if (!selectedTask) {
    return <MailDetailSkeleton />;
  }
  return (
    <>
      <AppsHeader>
        <TaskDetailHeader
          selectedTask={selectedTask}
          onUpdateSelectedTask={onUpdateSelectedTask}
        />
      </AppsHeader>
      <AppsContent isDetailView>
        <TaskDetailBody
          selectedTask={selectedTask}
          onUpdateSelectedTask={onUpdateSelectedTask}
        />
      </AppsContent>
    </>
  );
};

export default TaskDetail;
