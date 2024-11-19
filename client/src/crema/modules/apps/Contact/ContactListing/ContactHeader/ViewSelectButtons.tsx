import React from 'react';
import clsx from 'clsx';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import AppIconButton from '@crema/components/AppIconButton';
import { useIntl } from 'react-intl';
import { StyledContactViewSelect } from '../index.styled';

type ViewSelectButtonsProps = {
  pageView: string;
  onChangePageView: (pageView: string) => void;
}

const ViewSelectButtons: React.FC<ViewSelectButtonsProps> =
  ({ pageView, onChangePageView }) => {
    const { messages } = useIntl();
    return (
      <StyledContactViewSelect>
        <AppIconButton
          title={messages['sidebar.ecommerce.gridView'] as string}
          className={clsx({
            active: pageView === 'grid',
          })}
          icon={<AppstoreOutlined />}
          onClick={() => onChangePageView('grid')}
        />

        <AppIconButton
          icon={<BarsOutlined />}
          title={messages['sidebar.ecommerce.listView'] as string}
          className={clsx({
            active: pageView === 'list',
          })}
          onClick={() => onChangePageView('list')}
        />
      </StyledContactViewSelect>
    );
  };

export default ViewSelectButtons;

