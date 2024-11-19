import React from "react";
import SenderMessageItem from "./SenderMessageItem";
import ReceiverMessageItem from "./ReceiverMessageItem";
import AppList from "@crema/components/AppList";
import { AppAnimates } from "@crema/constants/AppEnums";
import { StyledChatMsgList } from "./MessageItem.style";
import {
  ConnectionObjType,
  MessageDataObjType,
  MessageObjType,
} from "@crema/types/models/apps/Chat";
import { AuthUserType } from "@crema/types/models/AuthUser";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type MessagesListProps = {
  userMessages: MessageObjType;
  authUser: AuthUserType;
  selectedUser: ConnectionObjType;
  onClickEditMessage: (data: MessageDataObjType) => void;
  deleteMessage: (id: number) => void;
  loading?: boolean;
};

const MessagesList: React.FC<MessagesListProps> = ({
  userMessages,
  authUser,
  selectedUser,
  onClickEditMessage,
  deleteMessage,
}) => {
  return (
    <StyledChatMsgList>
      <AppList
        data={userMessages.messageData}
        ListEmptyComponent={<ListEmptyResult title="test" />}
        renderItem={(item, index) => {
          if (item.sender === authUser._id) {
            return (
              <SenderMessageItem
                authUser={authUser}
                item={item}
                isPreviousSender={
                  index > 0 &&
                  item.sender === userMessages.messageData[index - 1].sender
                }
                isLast={
                  (index + 1 < userMessages.messageData.length &&
                    item.sender !==
                      userMessages.messageData[index + 1].sender) ||
                  index + 1 === userMessages.messageData.length
                }
                key={item.id}
                onClickEditMessage={onClickEditMessage}
                deleteMessage={deleteMessage}
              />
            );
          } else {
            return (
              <ReceiverMessageItem
                isPreviousSender={
                  index > 0 &&
                  item.sender === userMessages.messageData[index - 1].sender
                }
                isLast={
                  (index + 1 < userMessages.messageData.length &&
                    item.sender !==
                      userMessages.messageData[index + 1].sender) ||
                  index + 1 === userMessages.messageData.length
                }
                selectedUser={selectedUser}
                item={item}
                key={item.id}
              />
            );
          }
        }}
      />
    </StyledChatMsgList>
  );
};

export default MessagesList;
