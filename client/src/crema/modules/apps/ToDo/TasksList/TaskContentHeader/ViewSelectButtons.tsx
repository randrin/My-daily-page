import React from 'react';
import clsx from 'clsx';
import { BarsOutlined, CalendarOutlined } from '@ant-design/icons';
import AppIconButton from '@crema/components/AppIconButton';
import { useIntl } from 'react-intl';
import { StyledTodoViewSelect } from '../index.styled';

type ViewSelectButtonsProps = {
  onChangePageView: (str: string) => void;
  pageView: string;
}

const ViewSelectButtons: React.FC<ViewSelectButtonsProps> = ({
  pageView,
  onChangePageView,
}) => {
  const { messages } = useIntl();
  return (
    <StyledTodoViewSelect>
      <AppIconButton
        className={clsx({
          active: pageView === 'calendar',
        })}
        onClick={() => onChangePageView('calendar')}
        title={messages['sidebar.dataDisplay.calender'] as string}
        icon={<CalendarOutlined />}
      />

      <AppIconButton
        title={messages['sidebar.ecommerce.listView'] as string}
        className={clsx({
          active: pageView === 'list',
        })}
        icon={<BarsOutlined />}
        onClick={() => onChangePageView('list')}
      />
    </StyledTodoViewSelect>
  );
};

export default ViewSelectButtons;

