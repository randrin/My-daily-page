import React from "react";
import NoUserScreen from "./NoUserScreen";
import MessagesScreen from "./MessagesScreen";
import { StyledChatContentScreen, StyledChatNoScreen } from "./index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";

type ChatContentProps = {
  selectedUser: ConnectionObjType | undefined;
  setSelectedUser: any;
  setConnectionData: any;
};

const ChatContent: React.FC<ChatContentProps> = ({
  selectedUser,
  setConnectionData,
  setSelectedUser,
}) => {
  return (
    <>
      {selectedUser ? (
        <StyledChatContentScreen>
          <MessagesScreen
            selectedUser={selectedUser}
            setConnectionData={setConnectionData}
            setSelectedUser={setSelectedUser}
          />
        </StyledChatContentScreen>
      ) : (
        <StyledChatNoScreen>
          <NoUserScreen />
        </StyledChatNoScreen>
      )}
    </>
  );
};

export default ChatContent;
