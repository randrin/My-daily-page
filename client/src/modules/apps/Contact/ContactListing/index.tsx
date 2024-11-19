import React, { useState } from "react";
import ContactHeader from "./ContactHeader";
import IntlMessages from "@crema/helpers/IntlMessages";
import CreateContact from "../CreateContact";
import ContactViewContent from "./ContactViewContent";
import ContactDetail from "../ContactDetail";
import AppsPagination from "@crema/components/AppsPagination";
import AppsHeader from "@crema/components/AppsContainer/AppsHeader";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import ConfirmationModal from "@crema/components/AppConfirmationModal";
import { StyledAppFooter } from "./index.styled";
import { postDataApi, putDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import type { ContactObjType } from "@crema/types/models/apps/Contact";
import { DataType } from "../index";
import {
  useContactContext,
  useContactActionsContext,
} from "../../context/ContactContextProvider";

const ContactListing = () => {
  const { all, page, contactList } = useContactContext();
  const { onPageChange, setContactData, reCallAPI } =
    useContactActionsContext();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [filterText, onSetFilterText] = useState("");

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const [checkedContacts, setCheckedContacts] = useState<number[]>([]);

  const [toDeleteContacts, setToDeleteContacts] = useState<number[]>([]);

  const [isAddContact, onSetIsAddContact] = useState<boolean>(false);

  const [isShowDetail, onShowDetail] = useState<boolean>(false);

  const [selectedContact, setSelectedContact] = useState<ContactObjType | null>(
    null
  );

  const handleAddContactOpen = () => {
    onSetIsAddContact(true);
  };

  const handleAddContactClose = () => {
    onSetIsAddContact(false);
  };

  const onViewContactDetail = (contact: ContactObjType) => {
    setSelectedContact(contact);
    onShowDetail(true);
  };

  const onOpenEditContact = (contact: ContactObjType | null) => {
    setSelectedContact(contact);
    handleAddContactOpen();
  };

  const onChangeCheckedContacts = (checked: any, id: number) => {
    if (checked) {
      setCheckedContacts(checkedContacts.concat(id));
    } else {
      setCheckedContacts(
        checkedContacts.filter((contactId) => contactId !== id)
      );
    }
  };

  const onChangeStarred = (status: boolean, contact: ContactObjType) => {
    putDataApi<ContactObjType[]>(
      "/api/contactApp/update/starred",
      infoViewActionsContext,
      {
        contactIds: [contact.id],
        status: status,
      }
    )
      .then((data) => {
        onUpdateSelectedContact(data[0]);
        infoViewActionsContext.showMessage(
          data[0].isStarred
            ? "Contact Marked as Starred Successfully"
            : "Contact Marked as Unstarred Successfully"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });
  };

  const onUpdateSelectedContact = (contact: ContactObjType) => {
    setContactData({
      data: contactList?.data.map((item) => {
        if (item.id === contact.id) {
          return contact;
        }
        return item;
      }),
      count: contactList?.count,
    });
  };

  const onUpdateContact = (contact: ContactObjType) => {
    setSelectedContact(contact);
    handleAddContactClose();
  };

  const onUpdateContacts = (contacts: ContactObjType[]) => {
    console.log(
      contactList?.data.map((item) => {
        const contact = contacts.find(
          (contact: ContactObjType) => contact.id === item.id
        );
        if (contact) {
          return contact;
        }
        return item;
      })
    );
    setContactData({
      data: contactList?.data.map((item) => {
        const contact = contacts.find(
          (contact: ContactObjType) => contact.id === item.id
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
      return contactList?.data.filter((contact: ContactObjType) =>
        contact.name.toUpperCase().includes(filterText.toUpperCase())
      );
    }
  };

  const onDeleteSelectedContacts = () => {
    postDataApi<DataType>(
      "/api/contactApp/delete/contact",
      infoViewActionsContext,
      {
        type: all?.[0],
        name: all?.[1],
        contactIds: toDeleteContacts,
        page,
      }
    )
      .then((data) => {
        setContactData(data);
        infoViewActionsContext.showMessage("Contact Deleted Successfully");
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });

    setDeleteDialogOpen(false);
    setCheckedContacts([]);
  };

  const onSelectContactsForDelete = (contactIds: number[]) => {
    setToDeleteContacts(contactIds);
    setDeleteDialogOpen(true);
  };

  const list = onGetFilteredItems();

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
          handleAddContactOpen={handleAddContactOpen}
          onChangeCheckedContacts={onChangeCheckedContacts}
          onChangeStarred={onChangeStarred}
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

      {isAddContact ? (
        <CreateContact
          isAddContact={isAddContact}
          handleAddContactClose={handleAddContactClose}
          selectContact={selectedContact}
          onUpdateContact={onUpdateContact}
          reCallAPI={reCallAPI}
        />
      ) : null}

      {isShowDetail ? (
        <ContactDetail
          selectedContact={selectedContact}
          isShowDetail={isShowDetail}
          onShowDetail={onShowDetail}
          onChangeStarred={onChangeStarred}
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
