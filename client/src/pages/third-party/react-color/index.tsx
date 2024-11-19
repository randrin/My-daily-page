import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ReactColor = asyncComponent(
  () => import("../../../modules/thirdParty/reactColor"),
  { ssr: false }
);
export default AppPage(() => <ReactColor />);
