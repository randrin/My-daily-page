import SignupForm from "@/components/forms/signup.form";
import AuthLayout from "@/components/layout/auth.layout";

const SignupScreen = () => {
  return (
    <AuthLayout variant="signup">
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupScreen;
