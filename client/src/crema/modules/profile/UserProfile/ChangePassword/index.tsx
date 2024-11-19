import React from "react";
import { Button, Col, Form, Input, Row } from "antd";
import AppRowContainer from "@crema/components/AppRowContainer";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledUserProfileForm,
  StyledUserProfileFormTitle,
  StyledUserProfileGroupBtn,
} from "../index.styled";
import { useIntl } from "react-intl";
import { useJWTAuthActions } from "@crema/services/auth/jwt-auth/JWTAuthProvider";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { UsersProfileStepEnums } from "utils/common-constants.utils";
import { LuCheckCircle } from "react-icons/lu";

const ChangePassword = () => {
  // States
  const { messages } = useIntl();
  const { user } = useAuthUser();
  const { handleOnUpdateUserProfile } = useJWTAuthActions();

  // Functions
  const onFinish = (values: any) => {
    console.log("Success:", values);
    handleOnUpdateUserProfile(values, user._id, UsersProfileStepEnums.CHANGE_PASSWORD);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  // Render
  return (
    <StyledUserProfileForm
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <StyledUserProfileFormTitle>
        <IntlMessages id="userProfile.changePassword" />
      </StyledUserProfileFormTitle>
      <AppRowContainer gutter={16}>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.enterOldPassword" />,
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder={messages["common.oldPassword"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.enterNewPassword" />,
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder={messages["common.newPassword"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="confirmPassword"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.reTypePassword" />,
                },
                ({ getFieldValue }) => ({
                  validator(rule, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      <IntlMessages id="validation.passwordMisMatch" />
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder={messages["common.retypePassword"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin pt-10">
          <Col xs={24} md={24}>
            <StyledUserProfileGroupBtn
              shouldUpdate
              className="user-profile-group-btn"
            >
              <Button
                type="primary"
                htmlType="submit"
                className="tt-expenses-space-center"
              >
                <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
                <IntlMessages id="common.save" />
              </Button>
              {/* <Button>
                <IntlMessages id="common.delete" />
              </Button> */}
            </StyledUserProfileGroupBtn>
          </Col>
        </Row>
      </AppRowContainer>
    </StyledUserProfileForm>
  );
};

export default ChangePassword;
