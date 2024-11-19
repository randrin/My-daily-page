import React from "react";
import AppCard from "@crema/components/AppCard";
import AppScrollbar from "@crema/components/AppScrollbar";
import AppList from "@crema/components/AppList";
import TodoCell from "./TodoCell";
import { useIntl } from "react-intl";
import { TodoListType } from "@crema/types/models/dashboards/CRM";

type Props = {
  data: TodoListType[];
};

const ToDoLists = ({ data }: Props) => {
  const { messages } = useIntl();
  return (
    <AppCard
      title={messages["dashboard.crm.toDoLists"] as string}
      className="no-card-space-ltr-rtl"
      extra={<a href="#">{messages["common.viewAll"] as string}</a>}
    >
      <AppScrollbar style={{ paddingLeft: 20, paddingRight: 20 }}>
        <AppList
          data={data}
          renderItem={(todo) => <TodoCell key={todo.id} todo={todo} />}
        />
      </AppScrollbar>
    </AppCard>
  );
};

export default ToDoLists;
