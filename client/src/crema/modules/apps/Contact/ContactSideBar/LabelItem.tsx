import React from "react";
import { MdLabelOutline } from "react-icons/md";
import {
  StyledContactLabelItem,
  StyledContactSidebarLabelItem,
} from "./index.styled";
import { LabelObjType } from "@crema/types/models/apps/Contact";

type LabelItemProps = {
  label: LabelObjType;
};

const LabelItem: React.FC<LabelItemProps> = ({ label }) => {
  return (
    <div key={label.id}>
      <StyledContactSidebarLabelItem
        href={`/apps/contact/label/${label.alias}`}
      >
        <StyledContactLabelItem>
          <MdLabelOutline style={{ color: `${label.color}` }} />
        </StyledContactLabelItem>
        {label.name}
      </StyledContactSidebarLabelItem>
    </div>
  );
};

export default LabelItem;
