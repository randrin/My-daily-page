import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Line = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Line"),
  { ssr: false }
);
export default AppPage(() => <Line />);
