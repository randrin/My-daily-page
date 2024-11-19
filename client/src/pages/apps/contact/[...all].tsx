import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Contact = asyncComponent(() => import("../../../modules/apps/Contact"), {
  ssr: false,
});
export default AppPage(() => <Contact />);
