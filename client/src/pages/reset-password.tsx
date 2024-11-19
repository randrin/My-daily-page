import React from "react";
import AppPage from "@crema/core//DefaultPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ResetPassword = asyncComponent(
  () => import("../modules/auth/ForgetPassword/ResetPasswordAwsCognito"),
  { ssr: false }
);
export default AppPage(() => <ResetPassword />);
