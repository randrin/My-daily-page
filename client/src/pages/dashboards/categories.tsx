import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import CategoryContextProvider from "modules/apps/context/CategoryContextProvider";

const Categories = asyncComponent(
  () => import("../../modules/dashboards/categories")
);
export default AppPage(() => (
  <CategoryContextProvider>
    <Categories />
  </CategoryContextProvider>
));
