import React from "react";
import AppPage from "@crema/core//DefaultPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ConfirmSignup = asyncComponent(
  () => import("../modules/auth/Signup/ConfirmSignupAwsCognito")
);
export default AppPage(() => <ConfirmSignup />);
