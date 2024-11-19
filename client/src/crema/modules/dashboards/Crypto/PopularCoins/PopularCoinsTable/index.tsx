import React from "react";
import { Avatar } from "antd";
import { red } from "@ant-design/colors";
import {
  StyledPopularCoinTable,
  StyledPopularCoinUserInfo,
  StyledPopularCoinUserInfoContent,
} from "../index.styled";
import type { PopularCoinsDataType } from "@crema/types/models/dashboards/Crypto";

type PopularCoinsTableProps = {
  popularCoins: PopularCoinsDataType[];
};

const columns = [
  {
    title: "No.",
    dataIndex: `id`,
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (name: { title: string; image: string; color: string }) => (
      <StyledPopularCoinUserInfo>
        <Avatar
          src={name.image}
          style={{ backgroundColor: name.image ? name.color : red[5] }}
        />
        <StyledPopularCoinUserInfoContent>
          <h3>{name.title}</h3>
        </StyledPopularCoinUserInfoContent>
      </StyledPopularCoinUserInfo>
    ),
  },
  {
    title: "Market Cap",
    dataIndex: "marketCap",
    key: "marketCap",
  },
  {
    title: "Volume 24h",
    dataIndex: "volume",
    key: "volume",
  },
  {
    title: "24h %",
    dataIndex: "h",
    key: "h",
  },
];

const PopularCoinsTable: React.FC<PopularCoinsTableProps> = ({
  popularCoins,
}) => {
  return (
    <StyledPopularCoinTable
      hoverColor
      data={popularCoins}
      columns={columns}
      pagination={false}
    />
  );
};

export default PopularCoinsTable;
