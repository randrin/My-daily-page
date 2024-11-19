import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import OrganizationContextProvider from "modules/apps/context/OrganizationContextProvider";
import UserContextProvider from "modules/apps/context/UserContextProvider";

const Organisations = asyncComponent(
  () => import("../../modules/dashboards/organisations")
);
export default AppPage(() => (
  <OrganizationContextProvider>
    <UserContextProvider>
      <Organisations />
    </UserContextProvider>
  </OrganizationContextProvider>
));
