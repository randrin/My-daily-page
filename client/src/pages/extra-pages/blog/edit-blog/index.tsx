import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const EditBlog = asyncComponent(
  () => import("../../../../modules/extraPages/Blog/EditBlog"),
  {
    ssr: false,
  }
);
export default AppPage(() => <EditBlog />);
