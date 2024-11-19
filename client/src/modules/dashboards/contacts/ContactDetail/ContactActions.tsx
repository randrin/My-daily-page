import AppIconButton from "@crema/components/AppIconButton";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import React from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { StyledContactAction, StyledContactActionHover } from "./index.styled";

type ContactActionsProps = {
  contact: ContactType | null;
  onDeleteContact: () => void;
  onChangeStarred: (checked: boolean, item: any) => void;
  onOpenEditContact: (contact: ContactType | null) => void;
};

const ContactActions: React.FC<ContactActionsProps> = ({
  onDeleteContact,
  onChangeStarred,
  onOpenEditContact,
  contact,
}) => {
  // Render
  return (
    <StyledContactAction>
      <StyledContactActionHover className="contact-action-hover">
        <AppIconButton
          icon={<AiOutlineEdit />}
          onClick={() => onOpenEditContact(contact)}
        />
        <AppsStarredIcon item={contact} onChange={onChangeStarred} />
      </StyledContactActionHover>
      <AppIconButton icon={<AiOutlineDelete />} onClick={onDeleteContact} />
    </StyledContactAction>
  );
};

export default ContactActions;
