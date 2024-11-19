import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Account = asyncComponent(
  () => import("../../modules/account/MyProfile"),
  { ssr: false }
);
export default AppPage(() => <Account />);
