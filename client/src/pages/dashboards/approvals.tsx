import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import ApprovalContextProvider from "modules/apps/context/ApprovalContextProvider";
import ExpenseContextProvider from "modules/apps/context/ExpenseContextProvider";

const Approvals = asyncComponent(
  () => import("../../modules/dashboards/approvals")
);
export default AppPage(() => (
  <ApprovalContextProvider>
    <ExpenseContextProvider>
      <Approvals />
    </ExpenseContextProvider>
  </ApprovalContextProvider>
));
