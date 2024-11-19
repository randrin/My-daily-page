import React from "react";
import AppPage from "@crema/core/DefaultPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const SignIn = asyncComponent(() => import("../modules/auth/Signin"), {
  ssr: false,
});
export default AppPage(() => <SignIn />);
