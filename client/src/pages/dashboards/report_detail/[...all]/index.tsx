import AppAsyncComponent from "@crema/components/AppAsyncComponent";
import AppPage from "@crema/core/AppLayout/AppPage";
import ExpenseContextProvider from "modules/apps/context/ExpenseContextProvider";

const ReportDetail = AppAsyncComponent(
  () => import("../../../../modules/dashboards/expenses/inc/detailReport")
);
export default AppPage(() => (
  <ExpenseContextProvider>
    <ReportDetail />
  </ExpenseContextProvider>
));
