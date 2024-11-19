import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Composed = asyncComponent(
  () => import("../../../../modules/thirdParty/recharts/Composed"),
  { ssr: false }
);
export default AppPage(() => <Composed />);
