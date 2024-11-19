import AppAsyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";
import PermissionContextProvider from "modules/apps/context/PermissionContextProvider";

const Permissions = AppAsyncComponent(
  () => import("../../../../modules/dashboards/privileges/permissions")
);
export default AppPage(() => (
  <PermissionContextProvider>
    <Permissions />
  </PermissionContextProvider>
));
