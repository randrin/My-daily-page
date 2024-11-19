import React from "react";
import AppPage from "@crema/core//DefaultPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ForgetPassword = asyncComponent(
  () => import("../modules/auth/ForgetPassword"),
  { ssr: false }
);
export default AppPage(() => <ForgetPassword />);
