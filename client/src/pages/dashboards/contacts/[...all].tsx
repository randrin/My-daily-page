import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import ContactsContextProvider from "modules/apps/context/ContactsContextProvider";

const Contacts = asyncComponent(
  () => import("../../../modules/dashboards/contacts"),
  {
    ssr: false,
  }
);
export default AppPage(() => (
  <ContactsContextProvider>
    <Contacts />
  </ContactsContextProvider>
));
