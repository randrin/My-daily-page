import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import UserContextProvider from "modules/apps/context/UserContextProvider";
import OrganizationContextProvider from "modules/apps/context/OrganizationContextProvider";
import RoleContextProvider from "modules/apps/context/RoleContextProvider";

const Users = asyncComponent(() => import("../../modules/dashboards/users"));
export default AppPage(() => (
  <OrganizationContextProvider>
    <RoleContextProvider>
      <UserContextProvider>
        <Users />
      </UserContextProvider>
    </RoleContextProvider>
  </OrganizationContextProvider>
));
