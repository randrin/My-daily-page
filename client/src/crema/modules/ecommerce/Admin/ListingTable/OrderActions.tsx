import React from 'react';
import { useRouter } from 'next/router';
import { Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import AppIconButton from '@crema/components/AppIconButton';

type Props = {
  id: number;
};

const OrderActions = ({ id }: Props) => {
  const router = useRouter();

  const items = [
    {
      key: 1,
      label: <span style={{ fontSize: 14 }}>View Order</span>,
    },
    {
      key: 2,
      label: <span style={{ fontSize: 14 }}>Edit</span>,
    },
    { key: 3, label: <span style={{ fontSize: 14 }}>Delete</span> },
  ];

  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case '1':
        router.push('/ecommerce/orders');
        break;
      case '2':
        router.push(`/ecommerce/edit-products/${id}`);
        break;
      case '3':
        break;
      default:
        break;
    }
  };

  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} trigger={['click']}>
      <AppIconButton icon={<MoreOutlined />} />
    </Dropdown>
  );
};
export default OrderActions;
