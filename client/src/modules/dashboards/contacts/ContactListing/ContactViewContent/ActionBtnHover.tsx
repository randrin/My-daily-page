import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppIconButton from "@crema/components/AppIconButton";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { StyledContactListItemHover } from "../index.styled";
import { ContactObjType } from "@crema/types/models/apps/Contact";
import { ContactType } from "@crema/types/models/dashboards/ContactType";

type ActionBtnHoverProps = {
  onSelectContactsForDelete: (ids: string[]) => void;
  contact: ContactType;
  onChangeStarred: (isStarred: boolean, contact: ContactType) => void;
  onOpenEditContact: (contact: ContactType) => void;
};

const ActionBtnHover: React.FC<ActionBtnHoverProps> = ({
  onSelectContactsForDelete,
  contact,
  onChangeStarred,
  onOpenEditContact,
}) => {
  const onDeleteContact = () => {
    onSelectContactsForDelete([contact._id]);
  };

  const onChangeStarredStatus = () => {
    onChangeStarred(!contact.isStarred, contact);
  };

  const onClickEditOption = () => {
    onOpenEditContact(contact);
  };

  return (
    <StyledContactListItemHover className="contact-list-item-action-hover">
      <AppsStarredIcon item={contact} onChange={onChangeStarredStatus} />
      <AppIconButton
        onClick={onClickEditOption}
        title={<IntlMessages id="common.edit" />}
        icon={<AiOutlineEdit />}
      />
      <AppIconButton
        onClick={onDeleteContact}
        title={<IntlMessages id="common.delete" />}
        icon={<AiOutlineDelete />}
      />
    </StyledContactListItemHover>
  );
};

export default ActionBtnHover;
