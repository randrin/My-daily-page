import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Reporting = asyncComponent(
  () => import("../../modules/dashboards/reporting")
);
export default AppPage(() => <Reporting />);
