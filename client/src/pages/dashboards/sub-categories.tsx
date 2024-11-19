import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import SubCategoryContextProvider from "modules/apps/context/SubCategoryContextProvider";

const SubCategories = asyncComponent(
  () => import("../../modules/dashboards/sub-categories")
);
export default AppPage(() => (
  <SubCategoryContextProvider>
    <SubCategories />
  </SubCategoryContextProvider>
));
