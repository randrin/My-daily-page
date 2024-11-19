import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Scatter = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Scatter"),
  { ssr: false }
);
export default AppPage(() => <Scatter />);
