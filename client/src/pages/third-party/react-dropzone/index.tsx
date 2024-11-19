import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const ReactDropzone = asyncComponent(
  () => import("../../../modules/thirdParty/reactDropzone"),
  { ssr: false }
);
export default AppPage(() => <ReactDropzone />);
