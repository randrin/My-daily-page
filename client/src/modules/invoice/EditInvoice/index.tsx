import React from "react";
import { AddInvoice } from "@crema/modules/invoice";
import { putDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useRouter } from "next/router";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { isEmptyObject } from "@crema/helpers/ApiHelper";
import {
  ClientType,
  InvoiceSettingType,
  InvoiceType,
} from "@crema/types/models/invoice";

const EditInvoicePage = () => {
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
  const [{ apiData: selectedInv }] = useGetDataApi<InvoiceType>(
    "/api/invoice/detail",
    {} as InvoiceType,
    { id: router.query?.all?.[0] },
    true
  );

  const onSave = (invoice: InvoiceType) => {
    putDataApi("/api/invoice/list/update", infoViewActionsContext, { invoice })
      .then(() => {
        infoViewActionsContext.showMessage(
          "New Invoice has been udpated successfully!"
        );
      })
      .catch((error) => {
        infoViewActionsContext.fetchError(error.message);
      });

    router.push("/invoice");
  };

  return clientsList && invoiceList?.length && !isEmptyObject(selectedInv) ? (
    <AddInvoice
      selectedInv={selectedInv}
      clientsList={clientsList}
      totalCount={invoiceList?.length || 0}
      invoiceSettings={invoiceSettings}
      onSave={onSave}
    />
  ) : null;
};

export default EditInvoicePage;
