import React, { useState } from "react";
import dayjs from "dayjs";
import { useIntl } from "react-intl";
import { Form, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledMailModal,
  StyledMailModalContent,
  StyledMailModalSuffix,
  StyledMailModalTextArea,
  StyledMainForm,
  StyledMainModalBtn,
  StyledMainModalFooter,
  StyledMainModalScrollbar,
} from "./index.styled";
import { postDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

export const isValidEmail = (value: string) => {
  return value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
};

type ComposeMailProps = {
  isComposeMail: boolean;
  onCloseComposeMail: (val: boolean) => void;
};

const ComposeMail: React.FC<ComposeMailProps> = ({
  isComposeMail,
  onCloseComposeMail,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();

  const [isShowBcc, onShowBcc] = useState(false);

  const [isShowCC, onShowCC] = useState(false);

  const { messages } = useIntl();

  const onFinish = (values: any) => {
    const mail = {
      id: generateRandomUniqueNumber(),
      isChecked: false,
      isStarred: false,
      label: {
        id: 211,
        name: "Crema",
        alias: "crema",
        icon: <MailOutlined />,
      },
      messages: [
        {
          description: values.content ? values.content : "No Message",
          sender: {
            name: values.displayName ? values.displayName : values.username,
            email: values.username,
            profilePic: "",
          },
          to: [
            {
              id: 1,
              name: "Crema",
              email: "info@cremawork.com",
              profilePic: "",
            },
          ],
          cc: [],
          bcc: [],
          messageId: generateRandomUniqueNumber(),
          sentOn: dayjs().format("ddd, MMM DD, YYYY"),
          isRead: false,
          isStarred: false,
        },
      ],
      hasAttachments: false,
      isRead: true,
      folderValue: 122,
      sentOn: dayjs().format("llll"),
      subject: values.subject !== "" ? values.subject : "No Subject",
    };
    postDataApi("/api/mailApp/compose", infoViewActionsContext, { mail })
      .then(() => {
        infoViewActionsContext.showMessage("Mail Sent Successfully");
        onCloseComposeMail(false);
      })
      .catch((error) => {
        onCloseComposeMail(false);
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <StyledMailModal
      title={messages["mailApp.compose"] as string}
      open={isComposeMail}
      width={800}
      // onOk={isComposeMail}
      onCancel={() => onCloseComposeMail(false)}
      footer={false}
    >
      <StyledMainModalScrollbar>
        <StyledMainForm
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <StyledMailModalContent>
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input email!",
                },
              ]}
            >
              <Input
                prefix={
                  <span className="mail-modal-prefix">
                    <IntlMessages id="common.to" />
                  </span>
                }
                suffix={
                  <StyledMailModalSuffix>
                    <span onClick={() => onShowCC(!isShowCC)}>
                      <IntlMessages id="common.cc" />
                    </span>

                    <span onClick={() => onShowBcc(!isShowBcc)}>
                      <IntlMessages id="common.bcc" />
                    </span>
                  </StyledMailModalSuffix>
                }
              />
            </Form.Item>

            {isShowCC ? (
              <Form.Item
                name="cc"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please input your cc!",
                  },
                ]}
              >
                <Input placeholder={messages["common.cc"] as string} />
              </Form.Item>
            ) : null}

            {isShowBcc ? (
              <Form.Item
                name="bcc"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Please input your bcc!",
                  },
                ]}
              >
                <Input placeholder={messages["common.bcc"] as string} />
              </Form.Item>
            ) : null}
            <Form.Item
              name="subject"
              rules={[
                { required: true, message: "Please input your Subject!" },
              ]}
            >
              <Input placeholder={messages["common.subject"] as string} />
            </Form.Item>

            <Form.Item name="content">
              <StyledMailModalTextArea
                theme="snow"
                placeholder={messages["common.writeContent"] as string}
              />
            </Form.Item>
          </StyledMailModalContent>

          <StyledMainModalFooter>
            <StyledMainModalBtn type="primary" htmlType="submit">
              <IntlMessages id="common.send" />
            </StyledMainModalBtn>
          </StyledMainModalFooter>
        </StyledMainForm>
      </StyledMainModalScrollbar>
    </StyledMailModal>
  );
};

export default ComposeMail;
