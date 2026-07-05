import AuthLayout from "@/components/layout/auth.layout";
import SignupForm from "@/components/forms/signup.form";
import React from "react";

const SignupScreen = () => {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupScreen;
