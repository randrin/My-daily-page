import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Calendar = asyncComponent(
  () => import("../../../modules/thirdParty/calendar"),
  { ssr: false }
);
export default AppPage(() => <Calendar />);
