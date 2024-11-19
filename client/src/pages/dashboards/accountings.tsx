import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import AccountingContextProvider from "modules/apps/context/AccountingContextProvider";
import ExpenseContextProvider from "../../modules/apps/context/ExpenseContextProvider";

const Accountings = asyncComponent(
  () => import("../../modules/dashboards/accountings")
);
export default AppPage(() => (
  <AccountingContextProvider>
    <ExpenseContextProvider>
      <Accountings />
    </ExpenseContextProvider>
  </AccountingContextProvider>
));
