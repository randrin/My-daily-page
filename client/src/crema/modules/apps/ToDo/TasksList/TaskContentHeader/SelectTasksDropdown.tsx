import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Select } from 'antd';
import {
  StyledTodoTaskDropdown,
  StyledTodoTaskDropdownView,
} from '../index.styled';

type SelectTasksDropdownProps = {
  onSelectTasks: (value: number) => void;
}

const SelectTasksDropdown: React.FC<SelectTasksDropdownProps> = ({
  onSelectTasks,
}) => {
  const [selectedItems, setSelectedItems] = useState(0);

  const onChangeSelectValue = (value: any) => {
    setSelectedItems(value);
    onSelectTasks(value);
  };

  const { messages } = useIntl();

  return (
    <StyledTodoTaskDropdownView>
      <StyledTodoTaskDropdown
        value={selectedItems}
        onChange={onChangeSelectValue}
        defaultValue={messages['common.all']}
        style={{ width: '100%' }}>
        <Select.Option value={0}>{messages['common.all'] as string}</Select.Option>
        <Select.Option value={1}>{messages['common.none'] as string}</Select.Option>
        <Select.Option value={2}>{messages['common.starred'] as string}</Select.Option>
        <Select.Option value={3}>
          {messages['common.attachments'] as string}
        </Select.Option>
      </StyledTodoTaskDropdown>
    </StyledTodoTaskDropdownView>
  );
};

export default SelectTasksDropdown;

