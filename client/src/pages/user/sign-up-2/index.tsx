import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Signup = asyncComponent(
  () => import("../../../modules/userPages/StyledUserPages/Signup")
);
export default AppPage(() => <Signup />);
