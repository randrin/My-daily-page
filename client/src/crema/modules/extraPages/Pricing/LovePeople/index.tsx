import React from "react";
import { Col, Row } from "antd";
import PeopleCard from "./PeopleCard";
import type { GitPackageType } from "@crema/types/models/extrapages/Pricing";

type Props = {
  data: GitPackageType[];
};

const LovePeople = ({ data }: Props) => {
  return (
    <Row gutter={30}>
      {data.map((data) => (
        <Col xs={24} md={12} lg={8} key={data.id}>
          <PeopleCard data={data} />
        </Col>
      ))}
    </Row>
  );
};

export default LovePeople;
