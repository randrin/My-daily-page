import React from "react";
import ChatItem from "./ChatItem";
import AppList from "@crema/components/AppList";
import { useIntl } from "react-intl";
import ChatListSkeleton from "@crema/components/AppSkeleton/ChatListSkeleton";
import { StyledAppScrollbar, StyledChatSidebarTitle } from "../../index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type ChatListProps = {
  chatListData: ConnectionObjType[];
  setSelectedUser: any;
  selectedUser: ConnectionObjType | null;
  loading: boolean | undefined;
};

const ChatList: React.FC<ChatListProps> = ({
  chatListData,
  loading,
  setSelectedUser,
  selectedUser,
}) => {
  const { messages } = useIntl();
  return (
    <StyledAppScrollbar>
      <StyledChatSidebarTitle>Connections</StyledChatSidebarTitle>
      <AppList
        data={chatListData}
        ListEmptyComponent={
          <ListEmptyResult
            content={messages["chatApp.noUserFound"] as string}
            loading={loading}
            placeholder={<ChatListSkeleton />}
          />
        }
        renderItem={(item) => (
          <ChatItem
            key={item.id}
            item={item}
            setSelectedUser={setSelectedUser}
            selectedUser={selectedUser}
          />
        )}
      />
    </StyledAppScrollbar>
  );
};

export default ChatList;
