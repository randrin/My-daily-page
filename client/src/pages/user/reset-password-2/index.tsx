import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ResetPassword = asyncComponent(
  () => import("../../../modules/userPages/StyledUserPages/ResetPassword")
);
export default AppPage(() => <ResetPassword />);
