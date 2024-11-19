import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const CreateBlog = asyncComponent(
  () => import("../../../modules/extraPages/Blog/CreateBlog"),
  {
    ssr: false,
  }
);
export default AppPage(() => <CreateBlog />);
