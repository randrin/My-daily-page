import React from "react";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
} from "antd";
import AppRowContainer from "@crema/components/AppRowContainer";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledUserProfileForm,
  StyledUserProfileFormTitle,
  StyledUserProfileGroupBtn,
} from "../index.styled";
import { useIntl } from "react-intl";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { useJWTAuthActions } from "@crema/services/auth/jwt-auth/JWTAuthProvider";
import dayjs from "dayjs";
import {
  FORMAT_DATE_FOURTH,
  UsersProfileStepEnums,
} from "utils/common-constants.utils";
import { LuCheckCircle } from "react-icons/lu";
import { useUtilContext } from "modules/apps/context/UtilContextProvider";
import moment from "moment";

const Information = () => {
  // States
  const { messages } = useIntl();
  const { user } = useAuthUser();
  const { handleOnUpdateUserProfile } = useJWTAuthActions();
  const { countries } = useUtilContext();

  // Destructing
  const { Option } = Select;
  const { TextArea } = Input;

  // Functions
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onFinish = (values: any) => {
    console.log("Success:", values);
    handleOnUpdateUserProfile(values, user._id, UsersProfileStepEnums.ADDRESS);
  };

  // Render
  return (
    <StyledUserProfileForm
      initialValues={{
        ...user,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <StyledUserProfileFormTitle>
        <IntlMessages id="userProfile.information" />
      </StyledUserProfileFormTitle>
      <AppRowContainer gutter={16}>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={24} lg={24}>
            <Form.Item
              name="biography"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.biographyRequired" />,
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder={messages["placeholder.textarea"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              initialValue={moment(user.dateOfBorn).format(FORMAT_DATE_FOURTH)}
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.dateOfBornRequired" />,
                },
              ]}
            >
              <DatePicker
                size="large"
                value={dayjs(user.dateOfBorn) || undefined}
                style={{ width: "100%" }}
                placeholder={messages["placeholder.select"] as string}
                name="dateOfBorn"
                format={FORMAT_DATE_FOURTH}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="country"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.countryRequired" />,
                },
              ]}
            >
              <Select
                size="large"
                showSearch
                style={{ width: "100%" }}
                placeholder={messages["placeholder.select"] as string}
                optionFilterProp="label"
                optionLabelProp="label"
              >
                {countries.map((country, index) => {
                  return (
                    <Option
                      key={index}
                      value={country.name}
                      label={country.name}
                    >
                      <Avatar
                        size={25}
                        src={country.flag}
                        shape="square"
                        style={{ marginRight: 5 }}
                      />
                      {country.name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="city"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.cityRequired" />,
                },
              ]}
            >
              <Input
                size="large"
                placeholder={messages["common.city"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="address"
              rules={[
                {
                  required: true,
                  message: <IntlMessages id="validation.addressRequired" />,
                },
              ]}
            >
              <Input
                size="large"
                placeholder={messages["common.address"] as string}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row className="tt-expenses-without-margin">
          <Col xs={24} md={12}>
            <Form.Item
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  pattern: new RegExp(
                    /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/
                  ),
                  message: <IntlMessages id="validation.phoneNumberRequired" />,
                },
              ]}
            >
              <Input
                size="large"
                placeholder={messages["common.phone"] as string}
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

export default Information;
