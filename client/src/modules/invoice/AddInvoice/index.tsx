import React from "react";
import { AddInvoice } from "@crema/modules/invoice";
import { postDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { StyledTypographyWrapper } from "../index.styled";
import {
  ClientType,
  InvoiceSettingType,
  InvoiceType,
} from "@crema/types/models/invoice";

const AddInvoicePage = () => {
  const router = useRouter();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{ apiData: clientsList }] = useGetDataApi<ClientType[]>(
    "/api/invoice/clients",
    [],
    {},
    true
  );
  const [{ apiData: invoiceSettings }] = useGetDataApi<InvoiceSettingType>(
    "/api/invoice/settings",
    {} as InvoiceSettingType,
    {},
    true
  );

  const [{ apiData: invoiceList }] = useGetDataApi<InvoiceType[]>(
    "/api/invoice/list",
    [],
    {},
    true
  );
  const onSave = (invoice: InvoiceType) => {
    postDataApi("/api/invoice/list/add", infoViewActionsContext, { invoice })
      .then(() => {
        infoViewActionsContext.showMessage(
          "New Invoice has been created successfully!"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });

    router.push("/invoice");
  };

  return clientsList && invoiceList?.length ? (
    <StyledTypographyWrapper>
      <AddInvoice
        clientsList={clientsList}
        totalCount={invoiceList?.length || 0}
        invoiceSettings={invoiceSettings}
        onSave={onSave}
      />
    </StyledTypographyWrapper>
  ) : null;
};

export default AddInvoicePage;
