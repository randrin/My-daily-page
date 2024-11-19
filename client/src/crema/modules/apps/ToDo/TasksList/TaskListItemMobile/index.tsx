import React from "react";
import clsx from "clsx";
import Priority from "./Priority";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import dayjs from "dayjs";
import { CheckOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import {
  StyledTodoListMobileAction,
  StyledTodoListMobileAvatar,
  StyledTodoListMobileContent,
  StyledTodoListMobileDate,
  StyledTodoListMobileItem,
  StyledTodoListMobileMain,
  StyledTodoListMobilePriority,
  StyledTodoListMobileTitle,
  StyledTodoListMobileView,
  StyledTodoListStarMobile,
} from "./index.styled";
import { TodoObjType } from "@crema/types/models/apps/Todo";

type TaskListItemProps = {
  task: TodoObjType;
  checkedTasks: number[];
  onChangeStarred: (checked: boolean, task: TodoObjType) => void;
  onChangeCheckedTasks: (checked: boolean, taskNo: number) => void;
};

const TaskListItemMobile: React.FC<TaskListItemProps> = ({
  task,
  checkedTasks,
  onChangeCheckedTasks,
  onChangeStarred,
}) => {
  const router = useRouter();
  const { query } = router;
  const { all } = query;

  const onViewTaskDetail = (task: TodoObjType) => {
    router.push(`/apps/todo/${all?.[0]}/${all?.[1]}/${task.id}`);
  };

  return (
    <StyledTodoListMobileItem
      key={task.id}
      className={clsx("item-hover", {
        checked: checkedTasks.includes(task.id),
      })}
      onClick={() => onViewTaskDetail(task)}
    >
      <StyledTodoListMobileMain>
        <StyledTodoListMobileView
          className={clsx({
            checked: checkedTasks.includes(task.id),
          })}
          onClick={(event) => {
            event.stopPropagation();
            onChangeCheckedTasks(!checkedTasks.includes(task.id), task.id);
          }}
        >
          {checkedTasks.includes(task.id) ? (
            <CheckOutlined />
          ) : (
            <StyledTodoListMobileAvatar src={task?.assignedTo?.image} />
          )}
        </StyledTodoListMobileView>

        <StyledTodoListMobileContent>
          <StyledTodoListMobileTitle>
            <span className="text-truncate">{task.title}</span>

            {task.priority ? (
              <StyledTodoListMobilePriority>
                <Priority priority={task.priority} />
              </StyledTodoListMobilePriority>
            ) : null}
          </StyledTodoListMobileTitle>
          <p className="text-truncate ">{task.content}</p>
        </StyledTodoListMobileContent>
      </StyledTodoListMobileMain>

      <StyledTodoListMobileAction>
        <StyledTodoListMobileDate>
          {dayjs(task.startDate).format("HH:mm A")}
        </StyledTodoListMobileDate>
        <StyledTodoListStarMobile onClick={(event) => event.stopPropagation()}>
          <AppsStarredIcon item={task} onChange={onChangeStarred} />
        </StyledTodoListStarMobile>
      </StyledTodoListMobileAction>
    </StyledTodoListMobileItem>
  );
};

export default TaskListItemMobile;
