import { Checkbox, Form, Input } from "antd";
import { useIntl } from "react-intl";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useAuthMethod } from "@crema/hooks/AuthHooks";
import { useRouter } from "next/router";
import {
  SignInButton,
  StyledRememberMe,
  StyledSign,
  StyledSignContent,
  StyledSignForm,
  StyledSignLink,
} from "./index.styled";

const SignInJwtAuth = () => {
  // States
  const router = useRouter();
  const { signInUser } = useAuthMethod();

  // Destructing
  const { messages } = useIntl();

  // Functions
  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const onGoToForgetPassword = () => {
    // navigate('/forget-password', { tab: 'jwtAuth' });
    router.push("/forget-password");
  };

  const onRememberMe = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  // Render
  return (
    <StyledSign>
      <StyledSignContent>
        <StyledSignForm
          name="basic"
          initialValues={{
            remember: true,
            email: "",
            password: "",
          }}
          onFinish={signInUser}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            className="form-field"
            rules={[
              {
                required: true,
                message: <IntlMessages id="validation.emailRequired" />,
              },
            ]}
          >
            <Input
              size="large"
              placeholder={messages["common.email"] as string}
            />
          </Form.Item>
          <Form.Item
            name="password"
            className="form-field"
            rules={[
              {
                required: true,
                message: <IntlMessages id="validation.passwordRequired" />,
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder={messages["common.password"] as string}
            />
          </Form.Item>
          <StyledRememberMe>
            <Checkbox onChange={onRememberMe}>
              <IntlMessages id="common.rememberMe" />
            </Checkbox>
            <StyledSignLink onClick={onGoToForgetPassword}>
              <IntlMessages id="common.forgetPassword" />
            </StyledSignLink>
          </StyledRememberMe>
          <div className="form-btn-field">
            <SignInButton type="primary" htmlType="submit">
              <IntlMessages id="common.login" />
            </SignInButton>
          </div>

          {/* <div className="form-field-action">
            <StyledSignTextGrey>
              <IntlMessages id="common.dontHaveAccount" />
            </StyledSignTextGrey>
            <StyledSignLinkTag href={`/signup`}>
              <IntlMessages id="common.signup" />
            </StyledSignLinkTag>
          </div> */}
        </StyledSignForm>
      </StyledSignContent>
    </StyledSign>
  );
};

export default SignInJwtAuth;
