import React from "react";
import { MdLabelOutline } from "react-icons/md";
import {
  StyledContactLabelItem,
  StyledContactSidebarLabelItem,
} from "./index.styled";
import { LabelType } from "@crema/types/models/dashboards/ContactType";

type LabelItemProps = {
  label: LabelType;
};

const LabelItem: React.FC<LabelItemProps> = ({ label }) => {
  // Render
  return (
    <div key={label._id}>
      <StyledContactSidebarLabelItem
        href={`/dashboards/contacts/label/${label.alias}`}
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
