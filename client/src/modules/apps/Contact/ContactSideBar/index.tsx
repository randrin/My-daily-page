import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import CreateContact from "../CreateContact";
import AppsSideBarFolderItem from "@crema/components/AppsSideBarFolderItem";
import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import SidebarPlaceholder from "@crema/components/AppSkeleton/SidebarListSkeleton";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  StyledContactSidebarContent,
  StyledContactSidebarHeader,
  StyledContactSidebarList,
  StyledContactSidebarScroll,
  StyledContactSidebarTitle,
} from "./index.styled";
import { ContactListLabelItem } from "@crema/modules/apps/Contact";
import {
  useContactContext,
  useContactActionsContext,
} from "../../context/ContactContextProvider";

const SideBarContent = () => {
  const { reCallAPI } = useContactActionsContext();
  const { labelList, folderList } = useContactContext();

  const [isAddContact, onSetIsAddContact] = useState(false);

  const handleAddContactOpen = () => {
    onSetIsAddContact(true);
  };

  const handleAddContactClose = () => {
    onSetIsAddContact(false);
  };

  return (
    <>
      <StyledContactSidebarHeader>
        <Button
          ghost
          type="primary"
          icon={<PlusOutlined style={{ marginRight: 8 }} />}
          onClick={handleAddContactOpen}
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
                  loading={true}
                  placeholder={<SidebarPlaceholder />}
                />
              }
              renderItem={(item) => (
                <AppsSideBarFolderItem
                  key={item.id}
                  item={item}
                  path={`/apps/contact/folder/${item.alias}`}
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
                loading={true}
                placeholder={<SidebarPlaceholder />}
              />
            }
            renderItem={(label) => (
              <ContactListLabelItem key={label.id} label={label} />
            )}
          />

          {isAddContact ? (
            <CreateContact
              isAddContact={isAddContact}
              handleAddContactClose={handleAddContactClose}
              reCallAPI={reCallAPI}
            />
          ) : null}
        </StyledContactSidebarContent>
      </StyledContactSidebarScroll>
    </>
  );
};
export default SideBarContent;
