import React from "react";
import ConnectionList from "./ConnectionList";
import ChatList from "./ChatList";
import IntlMessages from "@crema/helpers/IntlMessages";
import { BsChatSquareText } from "react-icons/bs";
import { BiUserPin } from "react-icons/bi";
import { StyledChatSidebarTabs, StyledTabItem } from "../index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";

const tabs = [
  { id: 333, name: <IntlMessages id="dashboard.messages" /> },
  { id: 323, name: <IntlMessages id="chatApp.contacts" /> },
];

type UserTabsProps = {
  connectionListData: ConnectionObjType[];
  chatListData: ConnectionObjType[];
  setSelectedUser: any;
  selectedUser: ConnectionObjType | null;
  loading: boolean | undefined;
};

const UserTabs: React.FC<UserTabsProps> = ({
  connectionListData = [],
  chatListData = [],
  loading,
  selectedUser,
  setSelectedUser,
}) => {
  const items = [
    {
      label: (
        <StyledTabItem>
          <BsChatSquareText />
          {tabs[0].name}
        </StyledTabItem>
      ),
      key: "1",
      children: (
        <ChatList
          chatListData={chatListData}
          loading={loading}
          setSelectedUser={setSelectedUser}
          selectedUser={selectedUser}
        />
      ),
    }, // remember to pass the key prop
    {
      label: (
        <StyledTabItem>
          <BiUserPin />
          {tabs[1].name}
        </StyledTabItem>
      ),
      key: "2",
      children: (
        <ConnectionList
          connectionListData={connectionListData}
          loading={loading}
          setSelectedUser={setSelectedUser}
          selectedUser={selectedUser}
        />
      ),
    },
  ];
  return <StyledChatSidebarTabs defaultActiveKey="1" items={items} />;
};

export default UserTabs;
