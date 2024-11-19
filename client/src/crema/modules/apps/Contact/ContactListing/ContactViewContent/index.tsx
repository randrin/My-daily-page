import React from "react";
import ContactListItem from "./ContactListItem";
import ContactGridItem from "./ContactGridItem";
import AppList from "@crema/components/AppList";
import AppGrid from "@crema/components/AppGrid";
import ContactListSkeleton from "@crema/components/AppSkeleton/ContactListSkeleton";
import { AppAnimates } from "@crema/constants/AppEnums";
import ContactListItemMobile from "./ContactListItemMobile";
import {
  StyledContactGridView,
  StyledContactListDesktop,
  StyledContactListMobile,
} from "../index.styled";
import { useIntl } from "react-intl";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { ContactObjType } from "@crema/types/models/apps/Contact";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";

type ContactViewContentProps = {
  list: ContactObjType[];
  pageView: string;
  loading?: boolean;
  handleAddContactOpen: () => void;
  onChangeStarred: (isStarred: boolean, contact: ContactObjType) => void;
  onChangeCheckedContacts: (event: any, id: number) => void;
  checkedContacts: number[];
  onSelectContactsForDelete: (contactIds: number[]) => void;
  onOpenEditContact: (contact: ContactObjType) => void;
  onViewContactDetail: (contact: ContactObjType) => void;
};

const ContactViewContent: React.FC<ContactViewContentProps> = ({
  list,
  pageView,
  loading,
  handleAddContactOpen,
  onChangeStarred,
  onChangeCheckedContacts,
  checkedContacts,
  onSelectContactsForDelete,
  onOpenEditContact,
  onViewContactDetail,
}) => {
  const [{ apiData: labelList }] = useGetDataApi(
    "/api/contactApp/labels/list",
    []
  );
  const { messages } = useIntl();
  return (
    <>
      {pageView === "list" ? (
        <>
          <StyledContactListDesktop>
            <AppList
              data={list}
              animation={AppAnimates.SLIDEUPIN}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={loading}
                  actionTitle={messages["contactApp.createContact"] as string}
                  onClick={handleAddContactOpen}
                  placeholder={<ContactListSkeleton />}
                />
              }
              renderItem={(contact) => (
                <ContactListItem
                  key={contact.id}
                  contact={contact}
                  labelList={labelList}
                  onChangeCheckedContacts={onChangeCheckedContacts}
                  checkedContacts={checkedContacts}
                  onSelectContactsForDelete={onSelectContactsForDelete}
                  onChangeStarred={onChangeStarred}
                  onViewContactDetail={onViewContactDetail}
                  onOpenEditContact={onOpenEditContact}
                />
              )}
            />
          </StyledContactListDesktop>
          <StyledContactListMobile>
            <AppList
              data={list}
              animation={AppAnimates.SLIDEUPIN}
              ListEmptyComponent={
                <ListEmptyResult
                  loading={loading}
                  actionTitle={messages["contactApp.createContact"] as string}
                  onClick={handleAddContactOpen}
                  placeholder={<ContactListSkeleton />}
                />
              }
              renderItem={(contact) => (
                <ContactListItemMobile
                  key={contact.id}
                  contact={contact}
                  labelList={labelList}
                  checkedContacts={checkedContacts}
                  onChangeStarred={onChangeStarred}
                  onViewContactDetail={onViewContactDetail}
                  onChangeCheckedContacts={onChangeCheckedContacts}
                />
              )}
            />
          </StyledContactListMobile>
        </>
      ) : (
        <StyledContactGridView>
          <AppGrid
            responsive={{
              xs: 1,
              sm: 2,
              md: 2,
              lg: 2,
              xl: 2,
              xxl: 3,
            }}
            data={list}
            renderItem={(contact) => (
              <ContactGridItem
                key={contact.id}
                contact={contact}
                labelList={labelList}
                onChangeCheckedContacts={onChangeCheckedContacts}
                checkedContacts={checkedContacts}
                onChangeStarred={onChangeStarred}
                onSelectContactsForDelete={onSelectContactsForDelete}
                onViewContactDetail={onViewContactDetail}
                onOpenEditContact={onOpenEditContact}
              />
            )}
          />
        </StyledContactGridView>
      )}
    </>
  );
};

export default ContactViewContent;
