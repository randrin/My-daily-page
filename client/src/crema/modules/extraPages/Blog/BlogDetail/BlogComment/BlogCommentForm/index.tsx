import React from "react";
import { Form, Col, Input, Button } from "antd";
import AppRowContainer from "@crema/components/AppRowContainer";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import dayjs from "dayjs";
import { StyledFormWrapper } from "../index.styled";
import { useIntl } from "react-intl";
import { BlogCommentType } from "@crema/types/models/extrapages/Blog";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

const { TextArea } = Input;

type Props = {
  comments: BlogCommentType[];
  setComments: (comments: BlogCommentType[]) => void;
};
const BlogCommentForm = ({ comments, setComments }: Props) => {
  const { user } = useAuthUser();
  const { messages } = useIntl();

  const onCommentSend = (data: Partial<BlogCommentType>) => {
    const item: BlogCommentType = {
      id: generateRandomUniqueNumber(),
      name: data.name!,
      image: user.photoURL.secure_url,
      duration: dayjs().format("MMM DD"),
      comment: data.comment!,
    };
    const newList = comments.concat(item);
    setComments(newList);
  };

  return (
    <Form
      initialValues={{
        name: "",
        email: "",
        comment: "",
      }}
      onFinish={onCommentSend}
    >
      <StyledFormWrapper>
        <AppRowContainer>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: messages["validation.nameRequired"] as string,
                },
              ]}
            >
              <Input placeholder={messages["common.fullName"] as string} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              rules={[
                {
                  type: "email",
                  message: messages["validation.emailFormat"] as string,
                },
                {
                  required: true,
                  message: messages["validation.emailRequired"] as string,
                },
              ]}
            >
              <Input
                type="mail"
                placeholder={messages["common.email"] as string}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="comment"
              rules={[
                {
                  required: true,
                  message: messages["validation.comment"] as string,
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder={messages["common.comments"] as string}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Button
              style={{
                position: "relative",
                minWidth: 100,
              }}
              type="primary"
              htmlType="submit"
            >
              {messages["common.postComment"] as string}
            </Button>
          </Col>
        </AppRowContainer>
      </StyledFormWrapper>
    </Form>
  );
};

export default BlogCommentForm;
