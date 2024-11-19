import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Bar = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Bar"),
  { ssr: false }
);
export default AppPage(() => <Bar />);
