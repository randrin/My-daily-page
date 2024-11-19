import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const TimeLine = asyncComponent(
  () => import("../../../modules/thirdParty/reactSlick"),
  { ssr: false }
);
export default AppPage(() => <TimeLine />);
