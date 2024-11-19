import React from "react";
import { useIntl } from "react-intl";
import RecentPost from "./RecentPost";
import Categories from "./Categories";
import TagCloud from "./TagCloud";
import AppCard from "@crema/components/AppCard";
import { StyledSidebarBox } from "./index.styled";
import { Input } from "antd";
import { BlogSidebarType } from "@crema/types/models/extrapages/Blog";

type Props = {
  blogSidebar: BlogSidebarType;
};

const BlogSidebarCard = ({ blogSidebar }: Props) => {
  const { messages } = useIntl();

  return (
    <AppCard>
      <StyledSidebarBox>
        <Input.Search
          style={{ width: "100%" }}
          placeholder={messages["common.searchHere"] as string}
        />
      </StyledSidebarBox>
      <RecentPost recentPost={blogSidebar.recentPost} />
      <Categories categories={blogSidebar.categories} />
      <TagCloud tag={blogSidebar.tag} />
    </AppCard>
  );
};

export default BlogSidebarCard;
