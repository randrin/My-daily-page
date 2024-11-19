import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Maintenance = asyncComponent(
  () => import("../../modules/errorPages/Maintenance")
);
export default AppPage(() => <Maintenance />);
