import React from "react";
import AppPage from "@crema/core//DefaultPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const SignUP = asyncComponent(() => import("../modules/auth/Signup"));
export default AppPage(() => <SignUP />);
