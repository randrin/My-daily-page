import React from "react";
import { Avatar } from "antd";
import {
  StyledGraphItem,
  StyledMarketingCampaignTable,
  StyledMarketingUserInfo,
  StyledMarketingUserInfoContent,
} from "../index.styled";
import type { MarketingCampaignDataType } from "@crema/types/models/dashboards/Ecommerce";
import { ColumnsType } from "antd/es/table";

type OrderTableProps = {
  marketingCampaignData: MarketingCampaignDataType[];
};

const OrderTable: React.FC<OrderTableProps> = ({ marketingCampaignData }) => {
  const columns: ColumnsType<MarketingCampaignDataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <StyledMarketingUserInfo>
          <Avatar src={record.icon} />
          <StyledMarketingUserInfoContent>
            <h3>{record.name}</h3>
            <p>{record.description}</p>
          </StyledMarketingUserInfoContent>
        </StyledMarketingUserInfo>
      ),
    },
    {
      title: "Spend",
      dataIndex: "spend",
      key: "spend",
    },
    {
      title: "Graph",
      dataIndex: "graph",
      key: "graph",
      render: (graph, record) => (
        <StyledGraphItem>
          <span>
            {record.growth ? (
              <img
                src={"/assets/images/dashboard/growth_icon.svg"}
                alt="growth_icon"
              />
            ) : (
              <img
                src={"/assets/images/dashboard/decries_icon.svg"}
                alt="decries_icon"
              />
            )}
          </span>
          <span style={{ color: `${record.growth ? "#0A8FDC" : "#F44D50"}` }}>
            {record.graph}
          </span>
          <span>{record.growth ? "Up" : "Down"}</span>
        </StyledGraphItem>
      ),
    },
  ];

  return (
    <StyledMarketingCampaignTable
      scroll={{ x: "auto", y: 320 }}
      data={marketingCampaignData}
      columns={columns}
      pagination={false}
    />
  );
};

export default OrderTable;
