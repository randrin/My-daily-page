import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const Todo = asyncComponent(() => import("../../../modules/apps/ToDo"), {
  ssr: false,
});
export default AppPage(() => <Todo />);
