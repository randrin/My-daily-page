import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Area = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Area"),
  { ssr: false }
);
export default AppPage(() => <Area />);
