import React from 'react';
import AddTaskForm from './AddTaskForm';
import { useIntl } from 'react-intl';
import { StyledTodoModal, StyledTodoModalScrollbar } from './index.styled';
import { Dayjs } from 'dayjs';

type AddNewTaskProps = {
  isAddTaskOpen: boolean;
  reCallAPI?: any;
  onOpenAddTask?: () => void;
  onCloseAddTask: () => void;
  selectedDate?: Dayjs;
};

const AddNewTask: React.FC<AddNewTaskProps> = ({
  isAddTaskOpen,
  reCallAPI,
  onCloseAddTask,
  selectedDate,
}) => {
  const { messages } = useIntl();

  return (
    <StyledTodoModal
      width={900}
      title={messages['todo.addNewTask'] as string}
      open={isAddTaskOpen}
      footer={false}
      // onOk={isAddTaskOpen}
      onCancel={onCloseAddTask}
    >
      <StyledTodoModalScrollbar>
        <AddTaskForm onCloseAddTask={onCloseAddTask} reCallAPI={reCallAPI} />
      </StyledTodoModalScrollbar>
    </StyledTodoModal>
  );
};

export default AddNewTask;
