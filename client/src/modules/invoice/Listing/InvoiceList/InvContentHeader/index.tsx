import React from "react";
import { useIntl } from "react-intl";
import AppsPagination from "@crema/components/AppsPagination";
import { StyledCheckbox, StyledFlex } from "./index.style";
import { Input } from "antd";
import { InvoiceType } from "@crema/types/models/invoice";
import { CheckboxChangeEvent } from "antd/es/checkbox";

type InvContentHeaderPropsTypes = {
  page: number;
  invoiceList: InvoiceType[];
  checkedInvs: number[];
  setCheckedInvs: (checkedInvs: number[]) => void;
  filterText: string;
  onPageChange: (page: number) => void;
  onSetFilterText: (filterText: string) => void;
};

const InvContentHeader = (props: InvContentHeaderPropsTypes) => {
  const {
    page,
    invoiceList,
    checkedInvs,
    setCheckedInvs,
    filterText,
    onPageChange,
    onSetFilterText,
  } = props;

  const onHandleMasterCheckbox = (event: CheckboxChangeEvent) => {
    if (event.target.checked) {
      const InvIds = invoiceList?.map((Inv) => Inv.id);
      setCheckedInvs(InvIds);
    } else {
      setCheckedInvs([]);
    }
  };

  const { messages } = useIntl();

  return (
    <>
      <StyledFlex>
        <StyledCheckbox
          checked={
            invoiceList?.length > 0 &&
            checkedInvs?.length === invoiceList?.length
          }
          onChange={onHandleMasterCheckbox}
        />
        <div style={{ marginRight: 12 }}>
          <Input.Search
            value={filterText}
            onChange={(event) => onSetFilterText(event.target.value)}
            placeholder={messages["common.searchHere"] as string}
          />
        </div>
      </StyledFlex>

      {invoiceList?.length > 0 ? (
        <AppsPagination
          count={invoiceList?.length}
          page={page}
          onChange={onPageChange}
        />
      ) : null}
    </>
  );
};

export default InvContentHeader;
