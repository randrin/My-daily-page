import React from "react";
import { StyledTable } from "./index.styled";
import { getColumns } from "./columns";
import { TableDataType } from "@crema/types/models/extrapages/Pricing";

type Props = {
  billingFormat: string;
  tableData: TableDataType[];
};

const PricingTable = ({ billingFormat, tableData }: Props) => {
  return (
    <StyledTable
      columns={getColumns(billingFormat) as any}
      dataSource={tableData}
      pagination={false}
    />
  );
};

export default PricingTable;
