import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { StyledSendMessage, StyledSendMessageTitle } from "./index.styled";
import { SendMessageData } from "@crema/mockapi/fakedb/extraPages";

type SendMessageProps = {
  sendMessage: SendMessageData;
};

const SendMessage: React.FC<SendMessageProps> = ({ sendMessage }) => {
  return (
    <StyledSendMessage>
      <StyledSendMessageTitle>
        <IntlMessages id="extraPages.sendUsMessage" />
      </StyledSendMessageTitle>
      <p>{sendMessage.description}</p>
    </StyledSendMessage>
  );
};

export default SendMessage;
