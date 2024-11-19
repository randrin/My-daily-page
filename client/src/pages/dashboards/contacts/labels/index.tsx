import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import ContactsContextProvider from "modules/apps/context/ContactsContextProvider";

const Labels = asyncComponent(
  () => import("../../../../modules/dashboards/contacts/labels")
);
export default AppPage(() => (
  <ContactsContextProvider>
    <Labels />
  </ContactsContextProvider>
));
