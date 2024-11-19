import { AxiosRequestConfig } from "axios";
import connectionList from "../../fakedb/apps/chat/connectionList";
import mock from "../MockConfig";
import chatList from "../../fakedb/apps/chat/chatList";
import {
  ConnectionObjType,
  MessageDataObjType,
  MessageObjType,
} from "@crema/types/models/apps/Chat";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

let connectionData = connectionList;
let chatData = chatList;

mock.onGet("/api/chatApp/connections").reply(200, connectionData);

mock
  .onGet("/api/chatApp/connection/messages")
  .reply((request: AxiosRequestConfig) => {
    const { id } = request.params;
    const response = chatData.find(
      (chat: MessageObjType) => chat.channelId === parseInt(id)
    );
    if (response) {
      return [200, response];
    }
    return [200, null];
  });

mock.onPost("/api/chatApp/message").reply((request: AxiosRequestConfig) => {
  const { channelId, message } = JSON.parse(request.data);
  const id = generateRandomUniqueNumber();
  const data = { ...message, id };
  let user: ConnectionObjType = connectionData.find(
    (connection: ConnectionObjType) => connection.channelId === channelId
  )!;
  user = { ...user, lastMessage: data };
  connectionData = connectionData.map((item: ConnectionObjType) =>
    item.channelId === user?.channelId ? user : item
  );
  let userMessages = chatData.find(
    (chat: MessageObjType) => chat.channelId === channelId
  );
  if (userMessages) {
    userMessages.messageData = userMessages.messageData.concat(data);
  } else {
    userMessages = {
      channelId,
      messageData: [data],
    };
    chatData = chatData.concat(userMessages);
  }
  return [200, { user, userMessages }];
});

mock.onPut("/api/chatApp/message").reply((request: AxiosRequestConfig) => {
  const { channelId, message } = JSON.parse(request.data);
  let user = connectionData.find(
    (connection: ConnectionObjType) => connection.channelId === channelId
  )!;
  if (user?.lastMessage?.id === message.id) {
    user = { ...user, lastMessage: message };
    connectionData = connectionData.map((item: ConnectionObjType) =>
      item.channelId === user.channelId ? user : item
    );
  }
  const userMessages = chatData.find(
    (chat: MessageObjType) => chat.channelId === channelId
  );
  if (userMessages)
    userMessages.messageData = userMessages.messageData.map(
      (item: MessageDataObjType) => (item.id === message.id ? message : item)
    );
  return [200, { user, userMessages }];
});

mock
  .onPost("/api/chatApp/delete/message")
  .reply((request: AxiosRequestConfig) => {
    const { channelId, messageId } = JSON.parse(request.data);
    const userMessages = chatData.find(
      (chat: MessageObjType) => chat.channelId === channelId
    )!;
    let user = connectionData.find(
      (connection) => connection.channelId === channelId
    )!;
    if (userMessages) {
      userMessages.messageData = userMessages.messageData.filter(
        (item) => item.id !== messageId
      );
      if (user?.lastMessage?.id === messageId) {
        const lastMessage = userMessages.messageData[
          userMessages.messageData.length - 1
        ] as MessageDataObjType;
        user = {
          ...user,
          lastMessage: {
            id: lastMessage.id!,
            message: lastMessage.message!,
            type: "",
            time: lastMessage.time!,
          },
        };
        connectionData = connectionData.map((item: ConnectionObjType) =>
          item.id === user?.id ? user : item
        )!;
      }
    }
    return [200, { user, userMessages }];
  });

mock
  .onPost("/api/chatApp/delete/user/messages")
  .reply((request: AxiosRequestConfig) => {
    const { channelId } = JSON.parse(request.data);
    chatData = chatData.filter(
      (chat: MessageObjType) => chat.channelId !== channelId
    );
    const user = connectionData.find(
      (connection: ConnectionObjType) => connection.channelId === channelId
    )! as ConnectionObjType;
    // let user.lastMessage;
    connectionData = connectionData.map((item: ConnectionObjType) =>
      item.id === user.id ? user : item
    );
    return [200, user];
  });

mock.onPost("/api/chatApp/clearChat").reply((request) => {
  const { channelId } = JSON.parse(request.data);
  let user = connectionData.find(
    (connection) => connection.channelId === channelId
  );
  if (user) user = { ...user, lastMessage: null };

  connectionData = connectionData.map((item) =>
    item.channelId === user?.channelId ? user : item
  );

  return [200, { connectionData, userMessages: [] }];
});
