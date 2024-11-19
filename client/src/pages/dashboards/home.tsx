import asyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";
import DashboardContextProvider from "modules/apps/context/DashboardContextProvider";

const Home = asyncComponent(() => import("../../modules/dashboards/home"), {
  ssr: false,
});
export default AppPage(() => (
  <DashboardContextProvider>
    <Home />
  </DashboardContextProvider>
));
