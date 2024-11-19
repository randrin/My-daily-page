import React from 'react';
import clsx from 'clsx';
import {
  StyledFaqSidebarIcon,
  StyledFaqSidebarListItem,
} from '../index.styled';
import { FaqFolderData } from '.';

type SideBarItemProps = {
  item: FaqFolderData;
  onGetFaqData: (num: number) => void;
  selectionId: number;
};

const SideBarItem: React.FC<SideBarItemProps> = ({
  item,
  onGetFaqData,
  selectionId,
}) => {
  return (
    <StyledFaqSidebarListItem
      className={clsx({
        active: item.id === selectionId,
      })}
      onClick={() => onGetFaqData(item.id)}
    >
      <StyledFaqSidebarIcon>{item.icon}</StyledFaqSidebarIcon>
      <p>{item.name}</p>
    </StyledFaqSidebarListItem>
  );
};

export default SideBarItem;
