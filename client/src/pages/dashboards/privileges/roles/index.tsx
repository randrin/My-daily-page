import AppAsyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";
import PermissionContextProvider from "modules/apps/context/PermissionContextProvider";
import RoleContextProvider from "modules/apps/context/RoleContextProvider";

const Roles = AppAsyncComponent(
  () => import("../../../../modules/dashboards/privileges/roles")
);
export default AppPage(() => (
  <RoleContextProvider>
    <PermissionContextProvider>
      <Roles />
    </PermissionContextProvider>
  </RoleContextProvider>
));
