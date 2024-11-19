import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Customers = asyncComponent(
  () => import("../../../modules/ecommerce/Customers")
);
export default AppPage(() => <Customers />);
