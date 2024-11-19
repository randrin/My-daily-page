import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import { ContactObjType } from "@crema/types/models/apps/Contact";

type DataType = {
  data: ContactObjType[];
  count: number;
};

type ContactListingProps = {
  apiData: DataType;
  loading?: boolean;
  setQueryParams: (data: any) => void;
  setData?: (data: { data: ContactObjType[]; count: number }) => void;
  reCallAPI?: () => void;
};

const ContactListing: React.FC<ContactListingProps> = ({
  apiData,
  loading,
  setQueryParams,
  setData,
  reCallAPI,
}) => {
  const { pathname } = useRouter();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [filterText, onSetFilterText] = useState("");

  const [page, setPage] = useState(0);

  const [pageView, setPageView] = useState<string>("list");

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const [checkedContacts, setCheckedContacts] = useState<number[]>([]);

  const [toDeleteContacts, setToDeleteContacts] = useState<number[]>([]);

  const [isAddContact, onSetIsAddContact] = useState<boolean>(false);

  const [isShowDetail, onShowDetail] = useState<boolean>(false);

  const [selectedContact, setSelectedContact] = useState<ContactObjType | null>(
    null
  );

  useEffect(() => {
    setPage(0);
  }, [pathname]);

  useEffect(() => {
    const path = pathname.split("/");
    setQueryParams({
      type: path[path.length - 2],
      name: path[path.length - 1],
      page: page,
    });
  }, [pathname, pageView, page]);

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

  const onChange = (page: number) => {
    setPage(page);
  };

  const onChangePageView = (view: string) => {
    setPageView(view);
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
    if (setData)
      setData({
        data: apiData?.data.map((item) => {
          if (item.id === contact.id) {
            return contact;
          }
          return item;
        }),
        count: apiData?.count,
      });
  };

  const onUpdateContact = (contact: ContactObjType) => {
    setSelectedContact(contact);
    handleAddContactClose();
  };

  const onUpdateContacts = (contacts: ContactObjType[]) => {
    console.log(
      apiData?.data.map((item) => {
        const contact = contacts.find(
          (contact: ContactObjType) => contact.id === item.id
        );
        if (contact) {
          return contact;
        }
        return item;
      })
    );
    if (setData)
      setData({
        data: apiData?.data.map((item) => {
          const contact = contacts.find(
            (contact: ContactObjType) => contact.id === item.id
          );
          if (contact) {
            return contact;
          }
          return item;
        }),
        count: apiData?.count,
      });
  };

  const onGetFilteredItems = () => {
    if (filterText === "") {
      return apiData?.data;
    } else {
      return apiData?.data.filter((contact: ContactObjType) =>
        contact.name.toUpperCase().includes(filterText.toUpperCase())
      );
    }
  };

  const onDeleteSelectedContacts = () => {
    const path = pathname.split("/");
    postDataApi<DataType>(
      "/api/contactApp/delete/contact",
      infoViewActionsContext,
      {
        type: path[path.length - 2],
        name: path[path.length - 1],
        contactIds: toDeleteContacts,
        page,
      }
    )
      .then((data) => {
        if (setData) setData(data);
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
          onChange={onChange}
          onUpdateContacts={onUpdateContacts}
          page={page}
          apiData={apiData}
          onChangePageView={onChangePageView}
          pageView={pageView}
        />
      </AppsHeader>
      <AppsContent>
        <ContactViewContent
          list={list}
          loading={loading}
          pageView={pageView}
          handleAddContactOpen={handleAddContactOpen}
          onChangeCheckedContacts={onChangeCheckedContacts}
          onChangeStarred={onChangeStarred}
          checkedContacts={checkedContacts}
          onSelectContactsForDelete={onSelectContactsForDelete}
          onViewContactDetail={onViewContactDetail}
          onOpenEditContact={onOpenEditContact}
        />
      </AppsContent>

      {apiData?.data?.length > 0 ? (
        <StyledAppFooter>
          <AppsPagination
            count={apiData?.count}
            page={page}
            onChange={onChange}
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
