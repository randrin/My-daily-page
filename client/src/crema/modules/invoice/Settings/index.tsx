import IntlMessages from "@crema/helpers/IntlMessages";
import React from "react";
import Invoicing from "./Invoicing";
import General from "./General";
import Accounting from "./Accounting";
import AppCard from "@crema/components/AppCard";
import { Tabs, TabsProps } from "antd";
import { StyledFormWrapper } from "./index.styled";
import {
  InvoiceSettingType,
  InvoiceSettingItem,
} from "@crema/types/models/invoice";

type Props = {
  defaultSettings: InvoiceSettingType;
  onUpdateSettings: (key: string, newSettings: InvoiceSettingItem) => void;
};

const InvoiceSettings = ({ defaultSettings, onUpdateSettings }: Props) => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <IntlMessages id="faq.general" />,
      children: defaultSettings?.general && (
        <StyledFormWrapper>
          <General
            settings={defaultSettings?.general}
            onUpdateSettings={onUpdateSettings}
          />
        </StyledFormWrapper>
      ),
    },
    {
      key: "2",
      label: <IntlMessages id="invoice.invoicing" />,
      children: defaultSettings?.invoicing && (
        <StyledFormWrapper>
          <Invoicing
            settings={defaultSettings?.invoicing}
            onUpdateSettings={onUpdateSettings}
          />
        </StyledFormWrapper>
      ),
    },
    {
      key: "3",
      label: <IntlMessages id="invoice.accounting" />,
      children: defaultSettings?.accounting && (
        <StyledFormWrapper>
          <Accounting
            settings={defaultSettings?.accounting}
            onUpdateSettings={onUpdateSettings}
          />
        </StyledFormWrapper>
      ),
    },
  ];
  return (
    <AppCard title="Settings">
      <Tabs items={items} />
    </AppCard>
  );
};

export default InvoiceSettings;
