import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledInvoiceHeader,
  StyledInvoiceHeaderItem,
  StyledInvoiceHeaderRow,
  StyledInvoiceLogo,
} from "./index.styled";
import { invoiceData } from "@crema/mockapi/fakedb/extraPages";

const Header = () => {
  return (
    <StyledInvoiceHeader>
      <StyledInvoiceLogo>
        <img alt="logo" src={"/assets/images/logo.png"} />
      </StyledInvoiceLogo>

      <StyledInvoiceHeaderRow>
        <StyledInvoiceHeaderItem>
          <h3>{invoiceData.company.name}</h3>
          <p>{invoiceData.company.address1}</p>
          <p>{invoiceData.company.address2}</p>
          <p>Phone: {invoiceData.company.phone}</p>
        </StyledInvoiceHeaderItem>

        <StyledInvoiceHeaderItem>
          <h3>
            <IntlMessages id="invoice.client" />
          </h3>
          <p>{invoiceData.client.name}</p>
          <p>{invoiceData.client.phone}</p>
          <p>{invoiceData.client.email}</p>
        </StyledInvoiceHeaderItem>

        <StyledInvoiceHeaderItem>
          <h3>
            <IntlMessages id="invoice.invoice" />
          </h3>
          <p>
            <IntlMessages id="invoice.id" />: {invoiceData.invoice.id}
          </p>
          <p>
            <IntlMessages id="invoice.issued" />: {invoiceData.invoice.date}
          </p>
          <p>
            <IntlMessages id="invoice.dueOn" />: {invoiceData.invoice.dueDate}
          </p>
        </StyledInvoiceHeaderItem>
      </StyledInvoiceHeaderRow>
    </StyledInvoiceHeader>
  );
};

export default Header;
