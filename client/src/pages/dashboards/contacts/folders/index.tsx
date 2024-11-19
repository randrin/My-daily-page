import React from "react";
import AppPage from "@crema/core/AppLayout/AppPage";
import asyncComponent from "@crema/components/AppAsyncComponent";
import ContactsContextProvider from "modules/apps/context/ContactsContextProvider";

const Folders = asyncComponent(
  () => import("../../../../modules/dashboards/contacts/folders")
);
export default AppPage(() => (
  <ContactsContextProvider>
    <Folders />
  </ContactsContextProvider>
));
