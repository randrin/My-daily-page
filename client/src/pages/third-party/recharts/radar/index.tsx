import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Radar = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Radar"),
  { ssr: false }
);
export default AppPage(() => <Radar />);
