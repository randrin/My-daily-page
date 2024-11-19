import React from "react";
import ContactListing from "./ContactListing";
import { useIntl } from "react-intl";
import AppsContainer from "@crema/components/AppsContainer";
import SideBarContent from "./ContactSideBar";
import AppPageMeta from "@crema/components/AppPageMeta";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { ContactObjType } from "@crema/types/models/apps/Contact";
import ContactContextProvider from "../context/ContactContextProvider";

export type DataType = {
  data: ContactObjType[];
  count: number;
};
const Contact = () => {
  const { messages } = useIntl();
  return (
    <ContactContextProvider>
      <AppsContainer
        title={messages["contactApp.contact"] as string}
        sidebarContent={<SideBarContent />}
      >
        <AppPageMeta title="Contact App" />
        <ContactListing />
      </AppsContainer>
    </ContactContextProvider>
  );
};

export default Contact;
