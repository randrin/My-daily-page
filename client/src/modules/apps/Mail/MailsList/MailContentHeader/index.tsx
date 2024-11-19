import React from "react";
import CheckedMailActions from "./CheckedMailActions";
import MoreOptions from "./MoreOptions";
import { useIntl } from "react-intl";
import {
  StyledMailContentHeader,
  StyledMailContentHeaderCheckbox,
  StyledMailContentHeaderPagination,
  StyledMailSearch,
} from "../index.styled";

import type { MailObjType } from "@crema/types/models/apps/Mail";
import {
  useMailContext,
  useMailActionsContext,
} from "../../../context/MailContextProvider";

type MailContentHeaderProps = {
  checkedMails: number[];
  setCheckedMails: (ids: number[]) => void;
  filterText?: any;
  onSetFilterText: (event: any) => void;
};

const MailContentHeader: React.FC<MailContentHeaderProps> = ({
  checkedMails,
  setCheckedMails,
  filterText,
  onSetFilterText,
}) => {
  const { mailList, page } = useMailContext();
  const { onPageChange } = useMailActionsContext();

  const onHandleMasterCheckbox = (event: any) => {
    if (event.target.checked) {
      const mailIds = mailList?.data?.map((mail) => mail.id);
      setCheckedMails(mailIds);
    } else {
      setCheckedMails([]);
    }
  };

  const { messages } = useIntl();

  return (
    <>
      <StyledMailContentHeader>
        <StyledMailContentHeaderCheckbox
          indeterminate={
            checkedMails?.length > 0 &&
            checkedMails?.length < mailList?.data?.length
          }
          checked={
            mailList?.data?.length > 0 &&
            checkedMails?.length === mailList?.data?.length
          }
          onChange={onHandleMasterCheckbox}
        />

        <StyledMailSearch
          placeholder={messages["common.searchHere"] as string}
          value={filterText}
          onChange={(event: any) => onSetFilterText(event.target.value)}
        />

        {checkedMails.length > 0 ? (
          <CheckedMailActions
            checkedMails={checkedMails}
            setCheckedMails={setCheckedMails}
          />
        ) : null}

        <MoreOptions
          checkedMails={checkedMails}
          setCheckedMails={setCheckedMails}
          mailList={mailList?.data || []}
        />
      </StyledMailContentHeader>
      {mailList?.data?.length > 0 ? (
        <StyledMailContentHeaderPagination
          count={mailList?.count}
          page={page}
          onChange={onPageChange}
        />
      ) : null}
    </>
  );
};

export default MailContentHeader;
