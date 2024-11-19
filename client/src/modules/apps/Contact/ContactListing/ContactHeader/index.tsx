import React from "react";
import { useIntl } from "react-intl";
import CheckBox from "./CheckBox";
import ContactCheckedActions from "./ContactCheckedActions";
import {
  StyledContactContentHeader,
  StyledContactHeaderPagination,
  StyledContactSearch,
} from "../index.styled";
import { ViewSelectButtons } from "@crema/modules/apps/Contact";
import type { ContactObjType } from "@crema/types/models/apps/Contact";
import {
  useContactActionsContext,
  useContactContext,
} from "../../../context/ContactContextProvider";

type ContactHeaderProps = {
  checkedContacts: number[];
  setCheckedContacts: (checkedContacts: number[]) => void;
  onUpdateContacts: (checkedContacts: ContactObjType[]) => void;
  filterText: string;
  onSetFilterText: (filterText: string) => void;
  onSelectContactsForDelete: (ids: number[]) => void;
};

const ContactHeader: React.FC<ContactHeaderProps> = ({
  checkedContacts,
  setCheckedContacts,
  filterText,
  onSetFilterText,
  onSelectContactsForDelete,
  onUpdateContacts,
}) => {
  const { page, pageView, contactList } = useContactContext();
  const { onPageChange, onChangePageView } = useContactActionsContext();

  const { messages } = useIntl();

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
            onUpdateContacts={onUpdateContacts}
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
