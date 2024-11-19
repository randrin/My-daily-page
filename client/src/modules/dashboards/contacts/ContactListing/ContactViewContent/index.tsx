import AppGrid from "@crema/components/AppGrid";
import AppList from "@crema/components/AppList";
import ListEmptyResult from "@crema/components/AppList/ListEmptyResult";
import ContactListSkeleton from "@crema/components/AppSkeleton/ContactListSkeleton";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import { useContactsContext } from "modules/apps/context/ContactsContextProvider";
import React from "react";
import { useIntl } from "react-intl";
import {
  StyledContactGridView,
  StyledContactListDesktop,
  StyledContactListMobile,
} from "../index.styled";
import ContactListItem from "./ContactListItem";
import ContactListItemMobile from "./ContactListItemMobile";
import ContactGridItem from "./ContactGridItem";
import { VIEW_TYPE } from "utils/common-constants.utils";

type ContactViewContentProps = {
  list: ContactType[];
  loading: boolean;
  handleOnAddContact: () => void;
  onChangeStarred: (contactId: string) => void;
  onChangeCheckedContacts: (event: any, id: string) => void;
  checkedContacts: string[];
  onSelectContactsForDelete: (contactIds: string[]) => void;
  onOpenEditContact: (contact: ContactType) => void;
  onViewContactDetail: (contact: ContactType) => void;
};

const ContactViewContent: React.FC<ContactViewContentProps> = ({
  list,
  loading,
  handleOnAddContact,
  onChangeStarred,
  onChangeCheckedContacts,
  checkedContacts,
  onSelectContactsForDelete,
  onOpenEditContact,
  onViewContactDetail,
}) => {
  // States
  const { labelList, pageView } = useContactsContext();

  // Desctructing
  const { messages } = useIntl();

  // Render
  return pageView === VIEW_TYPE.LIST ? (
    <>
      <StyledContactListDesktop>
        <AppList
          data={list}
          ListEmptyComponent={
            <ListEmptyResult
              loading={loading}
              actionTitle={messages["contactApp.createContact"] as string}
              onClick={handleOnAddContact}
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
              onChangeStarred={() => onChangeStarred(contact._id)}
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
              onClick={handleOnAddContact}
              placeholder={<ContactListSkeleton />}
            />
          }
          renderItem={(contact) => (
            <ContactListItemMobile
              key={contact.id}
              contact={contact}
              labelList={labelList}
              checkedContacts={checkedContacts}
              onChangeStarred={() => onChangeStarred(contact._id)}
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
            onChangeStarred={() => onChangeStarred(contact._id)}
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
