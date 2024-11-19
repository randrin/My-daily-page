import React from "react";
import AppCard from "@crema/components/AppCard";
import { Avatar } from "antd";
import { StyledPrimarySubTitle, StyledSecDesc } from "./index.styled";
import { AboutUsSectionData } from "@crema/mockapi/fakedb/extraPages";

type SectionsProps = {
  data: AboutUsSectionData;
};

const Sections = ({ data }: SectionsProps) => {
  return (
    <AppCard style={{ height: "100%" }}>
      <div
        style={{
          marginBottom: 12,
        }}
      >
        <Avatar
          size={40}
          style={{
            backgroundColor: data.avatarColor,
          }}
        >
          {data.icon}
        </Avatar>
      </div>

      <StyledPrimarySubTitle level={3}>{data.title}</StyledPrimarySubTitle>
      <StyledSecDesc>{data.content}</StyledSecDesc>
    </AppCard>
  );
};

export default Sections;
