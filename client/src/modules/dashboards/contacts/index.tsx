import AppPageMeta from "@crema/components/AppPageMeta";
import AppsContainer from "@crema/components/AppsContainer";
import { useIntl } from "react-intl";
import ContactListing from "./ContactListing";
import SideBarContent from "./ContactSideBar";
import { useRouter } from "next/router";

const Contacts = () => {
  // States
  const { messages } = useIntl();
  const router = useRouter();
  console.log(router);
  

  // Desctruction
  const { query} = router;
  console.log(query);

  // Functions

  // Render
  return (
    <AppsContainer
      title={messages["common.contacts"] as string}
      sidebarContent={<SideBarContent />}
    >
      <AppPageMeta title={messages["common.contacts"] as string} />
      <ContactListing />
    </AppsContainer>
  );
};

export default Contacts;
