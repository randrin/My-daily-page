import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Standard = asyncComponent(
  () => import("../../../modules/userList/Standard")
);
export default AppPage(() => <Standard />);
