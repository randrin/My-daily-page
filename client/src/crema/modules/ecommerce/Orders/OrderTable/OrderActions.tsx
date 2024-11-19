import React from 'react';
import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import AppIconButton from '@crema/components/AppIconButton';

const items = [
  { key: 1, label: <span style={{ fontSize: 14 }}>View Order</span> },
  { key: 2, label: <span style={{ fontSize: 14 }}>Edit</span> },
  { key: 3, label: <span style={{ fontSize: 14 }}>Delete</span> },
];

const OrderActions = () => {
  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <AppIconButton icon={<MoreOutlined />} />
    </Dropdown>
  );
};
export default OrderActions;
