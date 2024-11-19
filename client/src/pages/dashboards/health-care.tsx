import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import AppPageMeta from "@crema/components/AppPageMeta";

const HealthCare = asyncComponent(
  () => import("../../modules/dashboards/HealthCare")
);

export default AppPage(() => {
  return (
    <React.Fragment>
      <AppPageMeta title="Health Care | Crema " />
      <HealthCare />
    </React.Fragment>
  );
});
