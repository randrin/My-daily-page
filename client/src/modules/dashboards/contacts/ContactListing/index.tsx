import ConfirmationModal from "@crema/components/AppConfirmationModal";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsPagination from "@crema/components/AppsPagination";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import { useState } from "react";
import ContactDetail from "../ContactDetail";
import CreateContact from "../CreateContact";
import ContactHeader from "./ContactHeader";
import ContactViewContent from "./ContactViewContent";
import { StyledAppFooter } from "./index.styled";

const ContactListing = () => {
  // States
  const { isContactDrawerOpen, all, page, contactList, loading, contact } =
    useContactsContext();
  const {
    setContactDrawerOpen,
    onPageChange,
    setContactData,
    handleOnChangeStarred,
    handleOnDeleteContact,
    setContact,
    handleOnAddContact,
    handleOnEditContact,
  } = useContactsActionsContext();
  const [filterText, onSetFilterText] = useState("");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [checkedContacts, setCheckedContacts] = useState<string[]>([]);
  const [toDeleteContacts, setToDeleteContacts] = useState<string[]>([]);
  const [isShowDetail, onShowDetail] = useState<boolean>(false);

  // Functions
  const onViewContactDetail = (contact: ContactType) => {
    setContact(contact);
    onShowDetail(true);
  };

  const onOpenEditContact = (contact: ContactType | null) => {
    handleOnEditContact(contact);
  };

  const onChangeCheckedContacts = (checked: any, id: string) => {
    if (checked) {
      setCheckedContacts(checkedContacts.concat(id));
    } else {
      setCheckedContacts(
        checkedContacts.filter((contactId) => contactId !== id)
      );
    }
  };

  const onUpdateContacts = (contacts: ContactType[]) => {
    setContactData({
      data: contactList?.data.map((item) => {
        const contact = contacts.find(
          (contact: ContactType) => contact._id === item._id
        );
        if (contact) {
          return contact;
        }
        return item;
      }),
      count: contactList?.count,
    });
  };

  const onGetFilteredItems = () => {
    if (filterText === "") {
      return contactList?.data;
    } else {
      return contactList?.data.filter((contact: ContactType) =>
        contact.displayName.toUpperCase().includes(filterText.toUpperCase())
      );
    }
  };

  const onDeleteSelectedContacts = () => {
    handleOnDeleteContact(toDeleteContacts);
    setDeleteDialogOpen(false);
    setCheckedContacts([]);
  };

  const onSelectContactsForDelete = (contactIds: string[]) => {
    setToDeleteContacts(contactIds);
    setDeleteDialogOpen(true);
  };

  const list = onGetFilteredItems();

  // Render
  return (
    <>
      <AppsHeader>
        <ContactHeader
          checkedContacts={checkedContacts}
          setCheckedContacts={setCheckedContacts}
          filterText={filterText}
          onSelectContactsForDelete={onSelectContactsForDelete}
          onSetFilterText={onSetFilterText}
          onUpdateContacts={onUpdateContacts}
        />
      </AppsHeader>
      <AppsContent>
        <ContactViewContent
          list={list}
          loading={loading}
          handleOnAddContact={handleOnAddContact}
          onChangeCheckedContacts={onChangeCheckedContacts}
          onChangeStarred={handleOnChangeStarred}
          checkedContacts={checkedContacts}
          onSelectContactsForDelete={onSelectContactsForDelete}
          onViewContactDetail={onViewContactDetail}
          onOpenEditContact={onOpenEditContact}
        />
      </AppsContent>

      {contactList?.data?.length > 0 ? (
        <StyledAppFooter>
          <AppsPagination
            count={contactList?.count}
            page={page}
            onChange={() => onPageChange}
          />
        </StyledAppFooter>
      ) : null}

      {isContactDrawerOpen ? (
        <CreateContact
          isContactDrawerOpen={isContactDrawerOpen}
          setContactDrawerOpen={setContactDrawerOpen}
          contact={contact}
          setContact={setContact}
        />
      ) : null}

      {isShowDetail ? (
        <ContactDetail
          selectedContact={contact}
          isShowDetail={isShowDetail}
          onShowDetail={onShowDetail}
          onChangeStarred={handleOnChangeStarred}
          onSelectContactsForDelete={onSelectContactsForDelete}
          onOpenEditContact={onOpenEditContact}
        />
      ) : null}

      {isDeleteDialogOpen ? (
        <ConfirmationModal
          open={isDeleteDialogOpen}
          onDeny={setDeleteDialogOpen}
          onConfirm={onDeleteSelectedContacts}
          modalTitle={<IntlMessages id="common.deleteItem" />}
        />
      ) : null}
    </>
  );
};

export default ContactListing;
