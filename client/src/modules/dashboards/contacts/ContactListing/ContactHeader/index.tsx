import { ViewSelectButtons } from "@crema/modules/apps/Contact";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import React from "react";
import { useIntl } from "react-intl";
import {
  StyledContactContentHeader,
  StyledContactHeaderPagination,
  StyledContactSearch,
} from "../index.styled";
import CheckBox from "./CheckBox";
import ContactCheckedActions from "./ContactCheckedActions";

type ContactHeaderProps = {
  checkedContacts: string[];
  setCheckedContacts: (checkedContacts: string[]) => void;
  onUpdateContacts: (checkedContacts: ContactType[]) => void;
  filterText: string;
  onSetFilterText: (filterText: string) => void;
  onSelectContactsForDelete: (ids: string[]) => void;
};

const ContactHeader: React.FC<ContactHeaderProps> = ({
  checkedContacts,
  setCheckedContacts,
  filterText,
  onSetFilterText,
  onSelectContactsForDelete,
  onUpdateContacts,
}) => {
  // States
  const { page, pageView, contactList } = useContactsContext();
  const { onPageChange, onChangePageView } = useContactsActionsContext();

  // Destructing
  const { messages } = useIntl();

  // Render
  return (
    <>
      <StyledContactContentHeader>
        <CheckBox
          checkedContacts={checkedContacts}
          setCheckedContacts={setCheckedContacts}
        />

        {checkedContacts.length > 0 ? (
          <ContactCheckedActions
            onSelectContactsForDelete={onSelectContactsForDelete}
            checkedContacts={checkedContacts}
            setCheckedContacts={setCheckedContacts}
          />
        ) : null}

        <StyledContactSearch
          value={filterText}
          onChange={(event) => onSetFilterText(event.target.value)}
          placeholder={messages["common.searchHere"] as string}
        />

        <ViewSelectButtons
          pageView={pageView}
          onChangePageView={onChangePageView}
        />
      </StyledContactContentHeader>
      {contactList?.data?.length > 0 ? (
        <StyledContactHeaderPagination
          count={contactList?.count}
          page={page}
          onChange={onPageChange}
        />
      ) : null}
    </>
  );
};

export default ContactHeader;
