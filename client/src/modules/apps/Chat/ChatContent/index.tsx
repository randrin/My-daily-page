import React from "react";
import { StyledChatContentScreen, StyledChatNoScreen } from "./index.styled";
import { NoUserScreen } from "@crema/modules/apps/Chat";
import MessagesScreen from "./ChatViewContainer";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";

type ChatContentProps = {
  selectedUser: ConnectionObjType | null;
  setSelectedUser: (data: ConnectionObjType | null) => void;
  setConnectionData: (data: ConnectionObjType[]) => void;
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
