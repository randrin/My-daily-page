import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const GoogleMap = asyncComponent(
  () => import("../../../modules/thirdParty/googleMap"),
  { ssr: false }
);
export default AppPage(() => <GoogleMap />);
