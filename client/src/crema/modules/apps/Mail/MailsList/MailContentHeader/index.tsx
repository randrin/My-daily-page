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
import { MailObjType } from "@crema/types/models/apps/Mail";

type MailContentHeaderProps = {
  path: string[];
  mailList: MailObjType[];
  checkedMails: number[];
  totalMails: number;
  setCheckedMails: (ids: number[]) => void;
  setData: any;
  filterText?: any;
  onSetFilterText: (event: any) => void;
  page: number;
  onChange: (value: number) => void;
};

const MailContentHeader: React.FC<MailContentHeaderProps> = ({
  path,
  checkedMails,
  setCheckedMails,
  page,
  onChange,
  mailList,
  totalMails,
  filterText,
  onSetFilterText,
  setData,
}) => {
  const onHandleMasterCheckbox = (event: any) => {
    if (event.target.checked) {
      const mailIds = mailList.map((mail) => mail.id);
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
            checkedMails?.length > 0 && checkedMails?.length < mailList?.length
          }
          checked={
            mailList?.length > 0 && checkedMails?.length === mailList?.length
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
            setData={setData}
          />
        ) : null}

        <MoreOptions
          checkedMails={checkedMails}
          setCheckedMails={setCheckedMails}
          path={path}
          mailList={mailList || []}
          setData={setData}
        />
      </StyledMailContentHeader>
      {mailList?.length > 0 ? (
        <StyledMailContentHeaderPagination
          count={totalMails}
          page={page}
          onChange={onChange}
        />
      ) : null}
    </>
  );
};

export default MailContentHeader;
