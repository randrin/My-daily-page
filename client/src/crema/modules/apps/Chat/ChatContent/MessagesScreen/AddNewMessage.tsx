import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PaperClipOutlined, SendOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { Button, Input } from "antd";
import {
  StyledAddNewMessage,
  StyledNewMessageAction,
  StyledNewMsgActionFirst,
} from "../index.styled";
import { generateUniqueID } from "@crema/helpers/StringHelper";
import { MessageDataObjType, MessageType } from "@crema/types/models/apps/Chat";

type AddNewMessageProps = {
  sendFileMessage: (message: MessageDataObjType) => void;
  onSendMessage: (message: string) => void;
  currentMessage: string | undefined;
};

const AddNewMessage: React.FC<AddNewMessageProps> = ({
  sendFileMessage,
  onSendMessage,
  currentMessage = "",
}) => {
  const [message, setMessage] = useState(currentMessage);
  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: (acceptedFiles) => {
      sendFileMessage({
        message: "",
        message_type: MessageType.MEDIA,
        media: acceptedFiles.map((file) => {
          return {
            id: generateUniqueID(),
            url: URL.createObjectURL(file),
            mime_type: file.type,
            file_name: file.name,
            file_size: file.size,
          };
        }),
      });
    },
  });

  useEffect(() => {
    setMessage(currentMessage);
  }, [currentMessage]);

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onClickSendMessage();
    }
  };

  const onClickSendMessage = () => {
    if (message) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const { messages } = useIntl();

  return (
    <StyledAddNewMessage>
      <StyledNewMsgActionFirst>
        {message === "" ? (
          <Button
            {...getRootProps({
              className: "message-btn dropzone",
            })}
          >
            <input {...getInputProps()} />
            <PaperClipOutlined />
          </Button>
        ) : null}
      </StyledNewMsgActionFirst>
      <Input
        placeholder={messages["chatApp.sendMessagePlaceholder"] as string}
        value={message}
        onChange={(event) => {
          if (event.target.value !== "\n") setMessage(event.target.value);
        }}
        onKeyPress={onKeyPress}
      />

      <StyledNewMessageAction>
        <Button className="message-btn" onClick={onClickSendMessage}>
          <SendOutlined />
        </Button>
      </StyledNewMessageAction>
    </StyledAddNewMessage>
  );
};

export default AddNewMessage;
