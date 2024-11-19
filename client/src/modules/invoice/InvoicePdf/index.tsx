import React from "react";
import { InvoicePdf } from "@crema/modules/invoice";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import { StyledTypographyWrapper } from "../index.styled";
import {
  InvoiceType,
  InvoiceSettingType,
  ClientType,
} from "@crema/types/models/invoice";

const InvoicePdfPage = () => {
  const { query } = useRouter();

  const [{ apiData: invoiceSettings }] = useGetDataApi<InvoiceSettingType>(
    "/api/invoice/settings",
    {} as InvoiceSettingType,
    {},
    true
  );

  const [{ apiData: clientsList }] = useGetDataApi<ClientType[]>(
    "/api/invoice/clients",
    [],
    {},
    true
  );

  const [{ apiData: selectedInv }] = useGetDataApi<InvoiceType>(
    "/api/invoice/detail",
    {} as InvoiceType,
    { id: query?.all?.[0] },
    true
  );

  return clientsList?.length > 0 &&
    !isEmptyObject(invoiceSettings) &&
    !isEmptyObject(selectedInv) ? (
    <StyledTypographyWrapper>
      <InvoicePdf
        selectedInv={selectedInv}
        clientsList={clientsList}
        invoiceSettings={invoiceSettings}
      />
    </StyledTypographyWrapper>
  ) : null;
};

export default InvoicePdfPage;
