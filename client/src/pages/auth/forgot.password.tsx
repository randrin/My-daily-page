import AuthLayout from "@/components/layout/auth.layout";
import ForgotPasswordForm from "@/components/forms/forgot-password.form";
import React from "react";

const ForgotPasswordScreen = () => {
  return (
    <AuthLayout variant="recovery">
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;
