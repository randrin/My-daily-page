import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ScrumBoard = asyncComponent(
  () => import("../../../modules/apps/ScrumBoard"),
  { ssr: false }
);
export default AppPage(() => <ScrumBoard />);
