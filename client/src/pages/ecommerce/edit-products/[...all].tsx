import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const EditProduct = asyncComponent(
  () => import("../../../modules/ecommerce/Admin/EditProduct"),
  {
    ssr: false,
  }
);
export default AppPage(() => <EditProduct />);
