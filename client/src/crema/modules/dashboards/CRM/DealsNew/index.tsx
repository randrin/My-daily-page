import React, { useState } from "react";
import DealsTable from "./DealsTable";
import { useIntl } from "react-intl";
import AppCard from "@crema/components/AppCard";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppSelect from "@crema/components/AppSelect";
import { StyledFlexContainer, StyledTitle } from "./index.styled";
import { DealsTableDataType } from "@crema/types/models/dashboards/CRM";

type Props = {
  dealsTableData: DealsTableDataType[];
};
const Deals = ({ dealsTableData = [] }: Props) => {
  const [tableData, setTableData] = useState(dealsTableData);

  const onDealChange = (value: string) => {
    if (value === messages["todo.completed"]) {
      setTableData(
        dealsTableData.filter((data) => data.progress === "Approved")
      );
    } else if (value === messages["common.pending"]) {
      setTableData(
        dealsTableData.filter((data) => data.progress === "Pending")
      );
    } else {
      setTableData(dealsTableData);
    }
  };

  const { messages } = useIntl();

  return (
    <AppCard
      title={
        <StyledFlexContainer>
          <StyledTitle level={5}>
            <IntlMessages id="dashboard.crm.deals" />
          </StyledTitle>
        </StyledFlexContainer>
      }
      className="no-card-space-ltr-rtl"
      extra={
        <AppSelect
          menus={[
            messages["common.all"],
            messages["todo.completed"],
            messages["common.pending"],
          ]}
          defaultValue={messages["common.all"]}
          onChange={onDealChange}
        />
      }
    >
      <DealsTable dealsTableData={tableData} />
    </AppCard>
  );
};

export default Deals;
