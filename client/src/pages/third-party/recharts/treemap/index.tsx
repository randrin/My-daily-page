import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Treemap = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Treemap"),
  { ssr: false }
);
export default AppPage(() => <Treemap />);
