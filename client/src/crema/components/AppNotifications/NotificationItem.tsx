import React from 'react';

import {List} from 'antd';
import {
    StyledNotifyListItem,
    StyledNotifyMsgAvatar,
} from './NotificationItem.styled';

type NotificationItemProps = {
    item: {
        image: string;
        name: string;
        message: string;
    };
}

const NotificationItem: React.FC<NotificationItemProps> = ({item}) => {
    return (
        <StyledNotifyListItem className='item-hover'>
            <List.Item.Meta
                avatar={<StyledNotifyMsgAvatar src={item.image} alt={item.name} />}
                title={item.name}
                description={item.message}
            />
        </StyledNotifyListItem>
    );
};

export default NotificationItem;