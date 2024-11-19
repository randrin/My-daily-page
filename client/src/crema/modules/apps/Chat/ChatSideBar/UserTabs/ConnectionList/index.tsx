import React from "react";
import ConnectionItem from "./ConnectionItem";
import AppList from "@crema/components/AppList";
import ChatListSkeleton from "@crema/components/AppSkeleton/ChatListSkeleton";
import { useIntl } from "react-intl";
import { StyledAppScrollbar, StyledChatSidebarTitle } from "../../index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type ConnectionListProps = {
  connectionListData: ConnectionObjType[];
  setSelectedUser: any;
  selectedUser: ConnectionObjType | null;
  loading: boolean | undefined;
};

const ConnectionList: React.FC<ConnectionListProps> = ({
  connectionListData,
  loading,
  selectedUser,
  setSelectedUser,
}) => {
  const { messages } = useIntl();
  return (
    <StyledAppScrollbar>
      <StyledChatSidebarTitle>Contacts</StyledChatSidebarTitle>
      <AppList
        data={connectionListData}
        ListEmptyComponent={
          <ListEmptyResult
            content={messages["chatApp.noUserFound"] as string}
            loading={loading}
            placeholder={<ChatListSkeleton />}
          />
        }
        renderItem={(item) => (
          <ConnectionItem
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

export default ConnectionList;
