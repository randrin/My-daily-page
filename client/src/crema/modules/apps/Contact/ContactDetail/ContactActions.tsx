import React from "react";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import AppIconButton from "@crema/components/AppIconButton";
import { StyledContactAction, StyledContactActionHover } from "./index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type ContactActionsProps = {
  contact: ContactObjType | null;
  onDeleteContact: () => void;
  onChangeStarred: (checked: boolean, item: any) => void;
  onOpenEditContact: (contact: ContactObjType | null) => void;
};

const ContactActions: React.FC<ContactActionsProps> = ({
  onDeleteContact,
  onChangeStarred,
  onOpenEditContact,
  contact,
}) => {
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
