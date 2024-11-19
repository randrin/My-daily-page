import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const PricingDetail = asyncComponent(
  () => import("../../../modules/extraPages/Pricing/Detail")
);
export default AppPage(() => <PricingDetail />);
