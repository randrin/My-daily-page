import React from "react";
import { List } from "antd";
import {
  StyledNewsImg,
  StyledNewsList,
  StyledNewsListContent,
} from "./NewsList.styled";
import type { NewsDataType } from "@crema/types/models/dashboards/Crypto";

type LatestNewsProps = {
  newsData: NewsDataType[];
};

const NewsList: React.FC<LatestNewsProps> = ({ newsData }) => {
  return (
    <List
      dataSource={newsData}
      renderItem={(news) => {
        return (
          <StyledNewsList
            key={news.id}
            className="item-hover"
            extra={<StyledNewsImg src={news.image} alt="bitcoin" />}
          >
            <StyledNewsListContent>
              <h5>
                <span>{news.created}</span>
                <span className="text-primary">{news.by}</span>
              </h5>
              <p>{news.news}</p>
            </StyledNewsListContent>
          </StyledNewsList>
        );
      }}
    />
  );
};

export default NewsList;
