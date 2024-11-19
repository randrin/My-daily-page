import React from "react";
import {
  StyledFlex,
  StyledFlex2,
  StyledGainerLooserTable,
} from "../index.styled";
import { Avatar, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { GainerLooserType } from "@crema/types/models/dashboards/Crypto";

const columns: ColumnsType<GainerLooserType> = [
  {
    title: "User",
    dataIndex: "user",
    key: "user",
    render: (_, record) => (
      <StyledFlex>
        <Avatar
          style={{ border: "0 none !important", width: 30, height: 30 }}
          alt={record.name}
          src={record.icon}
        />
        <Typography.Title
          level={5}
          style={{
            fontSize: 14,
            marginLeft: 12,
          }}
        >
          {record.name}
        </Typography.Title>
      </StyledFlex>
    ),
  },
  {
    title: "% change",
    dataIndex: "type",
    key: "type",
    align: "right",
    render: (_, record) => (
      <StyledFlex2
        style={{
          color: record.type === "looser" ? "#EA3943" : "#16C784",
        }}
      >
        <span style={{ marginRight: 8 }}>{record.percentage}</span>
        <img src={`/assets/icon/${record.type}.svg`} alt={record.type} />
      </StyledFlex2>
    ),
  },
  {
    title: "USD Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
  },
];

type Props = {
  data: GainerLooserType[];
};
const GainerLooserTable = ({ data }: Props) => {
  return (
    <StyledGainerLooserTable
      hoverColor
      data={data}
      scroll={{ x: "auto", y: 285 }}
      columns={columns}
    />
  );
};

export default GainerLooserTable;
