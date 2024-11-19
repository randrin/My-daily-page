import React from "react";
import AppCard from "@crema/components/AppCard";
import CustomerItem from "./CustomerItem";
import { List } from "antd";
import { useIntl } from "react-intl";
import { StyledCustomerScrollbar } from "./index.styled";
import type { NewCustomersDataType } from "@crema/types/models/dashboards/Ecommerce";

type NewCustomersProps = {
  newCustomers: NewCustomersDataType[];
};

const NewCustomers: React.FC<NewCustomersProps> = ({ newCustomers }) => {
  const { messages } = useIntl();
  return (
    <AppCard
      className="no-card-space-ltr-rtl"
      title={messages["eCommerce.newCustomers"] as string}
    >
      <StyledCustomerScrollbar style={{ height: 350 }}>
        <List
          dataSource={newCustomers}
          renderItem={(item: any) => <CustomerItem key={item.id} item={item} />}
        />
      </StyledCustomerScrollbar>
    </AppCard>
  );
};

export default NewCustomers;
