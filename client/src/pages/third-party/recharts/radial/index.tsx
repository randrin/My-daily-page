import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Radial = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Radial"),
  { ssr: false }
);
export default AppPage(() => <Radial />);
