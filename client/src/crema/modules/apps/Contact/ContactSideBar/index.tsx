import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import CreateContact from "../CreateContact";
import LabelItem from "./LabelItem";
import AppsSideBarFolderItem from "@crema/components/AppsSideBarFolderItem";
import AppList from "@crema/components/AppList";
import SidebarPlaceholder from "@crema/components/AppSkeleton/SidebarListSkeleton";
import { Button } from "antd";
import { AppAnimates } from "@crema/constants/AppEnums";
import { PlusOutlined } from "@ant-design/icons";
import {
  StyledContactSidebarContent,
  StyledContactSidebarHeader,
  StyledContactSidebarList,
  StyledContactSidebarScroll,
  StyledContactSidebarTitle,
} from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type SideBarContentProps = {
  reCallAPI?: () => void;
};

const SideBarContent: React.FC<SideBarContentProps> = ({ reCallAPI }) => {
  const [{ apiData: labelList }] = useGetDataApi(
    "/api/contactApp/labels/list",
    []
  );
  const [{ apiData: folderList }] = useGetDataApi(
    "/api/contactApp/folders/list",
    []
  );

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
              animation={AppAnimates.SLIDELEFTIN}
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
            animation={AppAnimates.SLIDELEFTIN}
            data={labelList}
            ListEmptyComponent={
              <ListEmptyResult
                loading={true}
                placeholder={<SidebarPlaceholder />}
              />
            }
            renderItem={(label) => <LabelItem key={label.id} label={label} />}
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
