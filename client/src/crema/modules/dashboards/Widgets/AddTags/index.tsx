import React, { useState } from "react";
import AddNewTag from "./AddNewTag";
import AppCard from "@crema/components/AppCard";
import { useIntl } from "react-intl";
import { CloseOutlined } from "@ant-design/icons";
import { blue, cyan, green, orange, red } from "@ant-design/colors";
import {
  StyledAddTagsContent,
  StyledAddTagsRow,
  StyledTagBadge,
  StyledTagBadgeButton,
} from "./index.styled";
import type { TagsListType } from "@crema/types/models/dashboards/Widgets";
import { generateRandomUniqueNumber } from "@crema/helpers/Common";

const colorList = [
  { id: 9001, color: blue[6] },
  { id: 9002, color: red[6] },
  { id: 9003, color: green[6] },
  { id: 9004, color: orange[6] },
  { id: 9005, color: cyan[7] },
  { id: 9006, color: blue[6] },
];

type AddTagsPorps = {
  data: TagsListType[];
};

const AddTags: React.FC<AddTagsPorps> = ({ data }) => {
  const [tags, setTags] = useState(data);

  const handleDelete = (tagToDelete: TagsListType) => () => {
    setTags((tags) => tags.filter((tag) => tag.id !== tagToDelete.id));
    console.log("Deleted");
  };

  const onAddNewTag = (newTag: string) => {
    const tag = {
      label: newTag,
      id: generateRandomUniqueNumber(),
      color: colorList[Math.floor(Math.random() * colorList.length)].color,
    };
    setTags((tags) => tags.concat(tag));
  };

  const { messages } = useIntl();

  return (
    <AppCard heightFull title={messages["dashboard.addTags"] as string}>
      <StyledAddTagsContent>
        <StyledAddTagsRow>
          {tags.map((item) => {
            return (
              <StyledTagBadge
                key={item.id}
                id={String(item.id)}
                style={{ backgroundColor: item.color }}
              >
                <span>{item.label}</span>
                <StyledTagBadgeButton onClick={handleDelete(item)}>
                  <CloseOutlined />
                </StyledTagBadgeButton>
              </StyledTagBadge>
            );
          })}
        </StyledAddTagsRow>

        <AddNewTag onAddNewTag={onAddNewTag} />
      </StyledAddTagsContent>
    </AppCard>
  );
};

export default AddTags;
