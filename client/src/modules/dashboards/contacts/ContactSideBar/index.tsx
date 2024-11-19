import { PlusOutlined } from "@ant-design/icons";
import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import SidebarPlaceholder from "@crema/components/AppSkeleton/SidebarListSkeleton";
import AppsSideBarFolderItem from "@crema/components/AppsSideBarFolderItem";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Button } from "antd";
import {
  StyledContactSidebarContent,
  StyledContactSidebarHeader,
  StyledContactSidebarList,
  StyledContactSidebarScroll,
  StyledContactSidebarTitle,
} from "./index.styled";

import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import CreateContact from "../CreateContact";
import LabelItem from "./LabelItem";

const SideBarContent = () => {
  // States
  const {
    labelList,
    folderList,
    isContactDrawerOpen,
    contact,
    labelLoading,
    folderLoading,
  } = useContactsContext();
  const { setContactDrawerOpen, handleOnAddContact, setContact } =
    useContactsActionsContext();

  // Functions

  // Render
  return (
    <>
      <StyledContactSidebarHeader>
        <Button
          ghost
          type="primary"
          icon={<PlusOutlined style={{ marginRight: 8 }} />}
          onClick={handleOnAddContact}
        >
          <IntlMessages id="contactApp.createContact" />
        </Button>
      </StyledContactSidebarHeader>
      <StyledContactSidebarScroll>
        <StyledContactSidebarContent>
          <StyledContactSidebarList>
            <AppList
              data={folderList}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={folderLoading}
                  placeholder={<SidebarPlaceholder />}
                />
              }
              renderItem={(item) => (
                <AppsSideBarFolderItem
                  key={item.id}
                  item={item}
                  path={`/dashboards/contacts/folder/${item.alias}`}
                />
              )}
            />
          </StyledContactSidebarList>

          <StyledContactSidebarTitle>
            <IntlMessages id="common.labels" />
          </StyledContactSidebarTitle>

          <AppList
            data={labelList}
            ListEmptyComponent={
              <ListEmptyResult
                loading={labelLoading}
                placeholder={<SidebarPlaceholder />}
              />
            }
            renderItem={(label) => <LabelItem key={label.id} label={label} />}
          />
          {isContactDrawerOpen ? (
            <CreateContact
              isContactDrawerOpen={isContactDrawerOpen}
              setContactDrawerOpen={setContactDrawerOpen}
              contact={contact}
              setContact={setContact}
            />
          ) : null}
        </StyledContactSidebarContent>
      </StyledContactSidebarScroll>
    </>
  );
};
export default SideBarContent;
