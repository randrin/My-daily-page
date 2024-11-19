import AppAnimate from "@crema/components/AppAnimate";
import AppCard from "@crema/components/AppCard";
import AppRowContainer from "@crema/components/AppRowContainer";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Button, Col, Form, Input } from "antd";
import React from "react";
import {
  StyledAvatarIcon,
  StyledContactAddress,
  StyledContactAddressItem,
  StyledSendMessage,
  StyledSendMessageTitle,
} from "../index.styled";
import { FiMail, FiPhone } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import AppPageMeta from "@crema/components/AppPageMeta";
import { useIntl } from "react-intl";
import { LuCheckCircle } from "react-icons/lu";
import { useJWTAuth } from "@crema/services/auth/jwt-auth/JWTAuthProvider";

const ContactUs = () => {
  // States
  const { user } = useJWTAuth();
  console.log(user);

  // Desctructing
  const { messages } = useIntl();

  // Functions
  const onFinish = (values: any) => {
    console.log("Finish:", values);
  };

  // Render
  return (
    <AppAnimate animation="transition.slideUpIn" delay={200}>
      <AppPageMeta title={messages["extraPages.contactUs"] as string} />
      <AppCard>
        <StyledSendMessage>
          <StyledSendMessageTitle>
            <IntlMessages id="extraPages.sendUsMessage" />
          </StyledSendMessageTitle>
          <p>{messages["extraPages.contactUs.description"] as string}</p>
        </StyledSendMessage>
        <AppRowContainer className="d-flex">
          <Col xs={24} md={12}>
            <Form
              onFinish={onFinish}
              initialValues={{
                email: user.email,
                displayName: user.displayName,
              }}
            >
              <AppRowContainer gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    name="displayName"
                    rules={[
                      {
                        required: true,
                        message: (
                          <IntlMessages id="validation.fullNameRequired" />
                        ),
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      size="large"
                      disabled={!!user?.displayName}
                      placeholder={messages["common.fullname"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: <IntlMessages id="validation.emailRequired" />,
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      size="large"
                      disabled={!!user?.email}
                      placeholder={messages["common.email"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="subject"
                    rules={[
                      {
                        required: true,
                        message: <IntlMessages id="validation.subjectRequired" />,
                      },
                    ]}
                  >
                    <Input
                      type="text"
                      size="large"
                      placeholder={messages["common.subject"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="message"
                    rules={[
                      {
                        required: true,
                        message: (
                          <IntlMessages id="validation.commentRequired" />
                        ),
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder={messages["placeholder.textarea"] as string}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item shouldUpdate>
                    <Button
                      type="primary"
                      className="tt-expenses-space-center"
                      htmlType="submit"
                    >
                      <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
                      {messages["common.submit"] as string}
                    </Button>
                  </Form.Item>
                </Col>
              </AppRowContainer>
            </Form>
          </Col>
          <Col xs={24} md={12}>
            <StyledContactAddress>
              <StyledContactAddressItem>
                <StyledAvatarIcon>
                  <HiOutlineLocationMarker />
                </StyledAvatarIcon>
                <p>
                  795 Folsom Ave, Suite 600 <br /> San Francisco, CA 94107
                </p>
              </StyledContactAddressItem>
              <StyledContactAddressItem>
                <StyledAvatarIcon>
                  <FiPhone />
                </StyledAvatarIcon>
                <p>(120) 456-789-123</p>
              </StyledContactAddressItem>
              <StyledContactAddressItem>
                <StyledAvatarIcon>
                  <FiMail />
                </StyledAvatarIcon>
                <p>support@yourmail.com</p>
              </StyledContactAddressItem>
            </StyledContactAddress>
          </Col>
        </AppRowContainer>
      </AppCard>
    </AppAnimate>
  );
};

export default ContactUs;
