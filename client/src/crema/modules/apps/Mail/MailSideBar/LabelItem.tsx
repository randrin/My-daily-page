import React from "react";
import NavLink from "next/link";
import { StyledMailLabelItem } from "./index.styled";
import { StyledMailDots } from "../MailsList/index.styled";
import { LabelObjType } from "@crema/types/models/apps/Mail";

type LabelItemProps = {
  label: LabelObjType;
};

const LabelItem: React.FC<LabelItemProps> = ({ label }) => {
  return (
    <StyledMailLabelItem key={label.id}>
      <NavLink href={`/apps/mail/label/${label.alias}`}>
        <StyledMailDots
          className="mail-dots"
          style={{ backgroundColor: label.color }}
        />
        {label.name}
      </NavLink>
    </StyledMailLabelItem>
  );
};

export default LabelItem;
