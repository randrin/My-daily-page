import React from "react";
import AppList from "@crema/components/AppList";
import AppGrid from "@crema/components/AppGrid";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import ContactListSkeleton from "@crema/components/AppSkeleton/ContactListSkeleton";
import {
  StyledContactGridView,
  StyledContactListDesktop,
  StyledContactListMobile,
} from "../index.styled";
import { useIntl } from "react-intl";
import {
  ContactGridItem,
  ContactListItem,
  ContactListItemMobile,
} from "@crema/modules/apps/Contact";
import type { ContactObjType } from "@crema/types/models/apps/Contact";
import { useContactContext } from "../../../context/ContactContextProvider";

type ContactViewContentProps = {
  list: ContactObjType[];
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
  handleAddContactOpen,
  onChangeStarred,
  onChangeCheckedContacts,
  checkedContacts,
  onSelectContactsForDelete,
  onOpenEditContact,
  onViewContactDetail,
}) => {
  const { labelList, loading, pageView } = useContactContext();

  const { messages } = useIntl();

  return pageView === "list" ? (
    <>
      <StyledContactListDesktop>
        <AppList
          data={list}
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
  );
};

export default ContactViewContent;
