import React from 'react';
import AddTaskForm from './AddTaskForm';
import { useIntl } from 'react-intl';
import { StyledTodoModal } from './index.styled';

type Props = {
  isAddTaskOpen: boolean;
  onCloseAddTask: () => void;
  selectedDate?: string;
};

const AddNewTask = ({ isAddTaskOpen, onCloseAddTask, selectedDate }: Props) => {
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
      <AddTaskForm
        onCloseAddTask={onCloseAddTask}
        selectedDate={selectedDate}
      />
    </StyledTodoModal>
  );
};

export default AddNewTask;
