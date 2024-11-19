import AppAnimate from "@crema/components/AppAnimate";
import AppPageMeta from "@crema/components/AppPageMeta";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledUserCard,
  StyledUserCardHeader,
  StyledUserCardLogo,
  StyledUserContainer,
  StyledUserForm,
  StyledUserFormBtn,
  StyledUserPages,
} from "@crema/modules/userPages/index.styled";
import { Form, Image, Input } from "antd";
import { useEffect, useState } from "react";
import { LuCheckCircle } from "react-icons/lu";
import { useIntl } from "react-intl";
import type { FormInstance } from "antd";
import { UsersProfileStepEnums } from "utils/common-constants.utils";
import { useJWTAuthActions } from "@crema/services/auth/jwt-auth/JWTAuthProvider";
import { useAuthUser } from "@crema/hooks/AuthHooks";

interface SubmitButtonProps {
  form: FormInstance;
}

const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({
  form,
  children,
}) => {
  const [submittable, setSubmittable] = useState(false);

  // Watch all values
  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields()
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <StyledUserFormBtn
      className="tt-expenses-space-center"
      type="primary"
      htmlType="submit"
      size="large"
      disabled={!submittable}
    >
      {children}
    </StyledUserFormBtn>
  );
};

const TemporalPasswordJwtAuth = () => {
  // States
  const [form] = Form.useForm();
  const { user } = useAuthUser();
  const { handleOnUpdateUserProfile } = useJWTAuthActions();

  console.log(user);
  
  // Destructing
  const { messages } = useIntl();

  // Functions
  const onFinish = (values: any) => {
    console.log("Success:", values);
    handleOnUpdateUserProfile(
      values,
      user._id,
      UsersProfileStepEnums.RESET_PASSWORD
    );
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  // Render
  return (
    <StyledUserPages>
      <AppPageMeta title={messages["common.resetPassword"] as string} />
      <AppAnimate animation="transition.slideUpIn" delay={200}>
        <StyledUserContainer className="tt-expenses-screen-center" key="a">
          <StyledUserCard>
            <StyledUserCardHeader>
              <StyledUserCardLogo>
                <Image
                  preview={false}
                  src={"/assets/images/logo.png"}
                  alt="crema"
                  width={20}
                  title="crema"
                />
              </StyledUserCardLogo>
              <h3>
                <IntlMessages id="common.resetPassword" />
              </h3>
            </StyledUserCardHeader>

            <StyledUserForm
              form={form}
              autoComplete="off"
              className="mb-0"
              name="validateOnly"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                name="password"
                className="form-field"
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

              <Form.Item
                name="confirmPassword"
                className="form-field"
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
              <SubmitButton form={form}>
                <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
                <IntlMessages id="common.submit" />
              </SubmitButton>
            </StyledUserForm>
          </StyledUserCard>
        </StyledUserContainer>
      </AppAnimate>
    </StyledUserPages>
  );
};
export default TemporalPasswordJwtAuth;
