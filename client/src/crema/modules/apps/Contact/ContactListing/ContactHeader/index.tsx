import React from "react";
import { useIntl } from "react-intl";
import CheckBox from "./CheckBox";
import ContactCheckedActions from "./ContactCheckedActions";
import ViewSelectButtons from "./ViewSelectButtons";
import {
  StyledContactContentHeader,
  StyledContactHeaderPagination,
  StyledContactSearch,
} from "../index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type ContactHeaderProps = {
  apiData: {
    data: ContactObjType[];
    count: number;
  };
  checkedContacts: number[];
  setCheckedContacts: (checkedContacts: number[]) => void;
  onUpdateContacts: (checkedContacts: ContactObjType[]) => void;
  filterText: string;
  onSetFilterText: (filterText: string) => void;
  onChangePageView: (pageView: string) => void;
  onSelectContactsForDelete: (ids: number[]) => void;
  page: number;
  onChange: (page: number) => void;
  pageView: string;
};

const ContactHeader: React.FC<ContactHeaderProps> = ({
  checkedContacts,
  setCheckedContacts,
  filterText,
  onSetFilterText,
  onChangePageView,
  onSelectContactsForDelete,
  onUpdateContacts,
  page,
  apiData,
  onChange,
  pageView,
}) => {
  const { messages } = useIntl();

  return (
    <>
      <StyledContactContentHeader>
        <CheckBox
          contactList={apiData?.data || []}
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
      {apiData?.data?.length > 0 ? (
        <StyledContactHeaderPagination
          count={apiData?.count}
          page={page}
          onChange={onChange}
        />
      ) : null}
    </>
  );
};
export default ContactHeader;
