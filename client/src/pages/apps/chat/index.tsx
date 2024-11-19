import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Chat = asyncComponent(() => import("../../../modules/apps/Chat"), {
  ssr: false,
});
export default AppPage(() => <Chat />);
