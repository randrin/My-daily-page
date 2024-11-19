import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import ExpenseContextProvider from "modules/apps/context/ExpenseContextProvider";

const Expenses = asyncComponent(
  () => import("../../modules/dashboards/expenses")
);
export default AppPage(() => (
  <ExpenseContextProvider>
    <Expenses />
  </ExpenseContextProvider>
));
