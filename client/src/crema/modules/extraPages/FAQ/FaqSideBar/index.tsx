import React, { ReactNode } from 'react';
import {
  DollarOutlined,
  FileTextOutlined,
  FrownOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import IntlMessages from '@crema/helpers/IntlMessages';
import SideBarItem from './SideBarItem';
import { StyledFaqSidebarCard, StyledFaqSidebarList } from '../index.styled';

export type FaqFolderData = {
  id: number;
  name: string | any;
  icon: ReactNode;
};

const faqFolderList: FaqFolderData[] = [
  { id: 101, name: <IntlMessages id="faq.general" />, icon: <SyncOutlined /> },
  {
    id: 102,
    name: <IntlMessages id="knowledge.installation" />,
    icon: <SettingOutlined />,
  },
  {
    id: 103,
    name: <IntlMessages id="faq.pricing" />,
    icon: <DollarOutlined />,
  },
  {
    id: 104,
    name: <IntlMessages id="faq.licenseTypes" />,
    icon: <FileTextOutlined />,
  },
  {
    id: 105,
    name: <IntlMessages id="faq.support" />,
    icon: <FrownOutlined />,
  },
];

type FaqSideBarProps = {
  onGetFaqData: (num: number) => void;
  selectionId: number;
};

const FaqSideBar: React.FC<FaqSideBarProps> = ({
  onGetFaqData,
  selectionId,
}) => {
  return (
    <StyledFaqSidebarCard>
      <h3>
        <IntlMessages id="faq.queries" />
      </h3>
      <StyledFaqSidebarList aria-label="main mailbox folders">
        {faqFolderList.map((item) => {
          return (
            <SideBarItem
              key={item.id}
              item={item}
              selectionId={selectionId}
              onGetFaqData={onGetFaqData}
            />
          );
        })}
      </StyledFaqSidebarList>
    </StyledFaqSidebarCard>
  );
};

export default FaqSideBar;
