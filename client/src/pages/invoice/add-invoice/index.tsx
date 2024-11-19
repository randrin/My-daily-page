import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";

const AddInvoice = asyncComponent(
  () => import("../../../modules/invoice/AddInvoice")
);
export default AppPage(() => <AddInvoice />);
