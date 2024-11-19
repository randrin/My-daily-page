import React, { useState } from "react";
import clsx from "clsx";
import ItemMenu from "./ItemMenu";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { Avatar, Checkbox } from "antd";
import ActionBtnHover from "./ActionBtnHover";
import {
  StyledContactListItem,
  StyledContactListItemAvatar,
  StyledContactListItemAvatarView,
  StyledContactListItemCheckView,
  StyledContactListItemCol,
  StyledContactListItemCompany,
  StyledContactListItemMail,
  StyledContactListItemTitle,
  StyledContactListItemAction,
  StyledContactListExportIcon,
  StyledContactListItemMenuView,
} from "../index.styled";
import { ContactObjType, LabelObjType } from "@crema/types/models/apps/Contact";
import {
  ContactType,
  LabelType,
} from "@crema/types/models/dashboards/ContactType";
import { log } from "console";

type ContactListItemProps = {
  contact: ContactType;
  labelList: LabelType[];
  onChangeStarred: (contactId: string) => void;
  onChangeCheckedContacts: (event: any, id: string) => void;
  checkedContacts: string[];
  onSelectContactsForDelete: (contactIds: string[]) => void;
  onOpenEditContact: (contact: ContactType) => void;
  onViewContactDetail: (contact: ContactType) => void;

  [x: string]: any;
};

const ContactListItem: React.FC<ContactListItemProps> = ({
  contact,
  labelList,
  onChangeCheckedContacts,
  checkedContacts,
  onChangeStarred,
  onSelectContactsForDelete,
  onViewContactDetail,
  onOpenEditContact,
}) => {
  // States
  const [isChecked, setIsChecked] = useState(false);

  // Functions
  const onGetLabelColor = (labelId: string) => {
    if (labelId) {
      return labelList?.find((label) => label._id === labelId)!.color;
    }
    return "";
  };

  // Render
  return (
    <StyledContactListItem
      key={contact._id}
      className={clsx("item-hover", {
        rootCheck: checkedContacts.includes(contact._id),
      })}
      onClick={() => onViewContactDetail(contact)}
    >
      <StyledContactListItemCheckView
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={checkedContacts.includes(contact._id)}
          onChange={() => {
            setIsChecked(!isChecked);
            onChangeCheckedContacts(!isChecked, contact._id);
          }}
        />
      </StyledContactListItemCheckView>
      <StyledContactListItemCheckView
        onClick={(event) => event.stopPropagation()}
      >
        <AppsStarredIcon
          item={contact}
          onChange={() => onChangeStarred(contact._id)}
        />
      </StyledContactListItemCheckView>
      <StyledContactListItemAvatarView>
        {contact.photoURL ? (
          <Avatar size={36} src={contact.photoURL.secure_url} />
        ) : (
          <StyledContactListItemAvatar size={36}>
            {contact.displayName[0].toUpperCase()}
          </StyledContactListItemAvatar>
        )}
      </StyledContactListItemAvatarView>
      <StyledContactListItemTitle className="text-truncate">
        {contact.displayName}
      </StyledContactListItemTitle>
      <StyledContactListItemMail className="text-truncate">
        <span className="text-truncate">
          {contact.email ? contact.email : null}
        </span>
      </StyledContactListItemMail>
      <StyledContactListItemCol className="text-truncate">
        <span className="text-truncate">{contact.phoneNumber}</span>
      </StyledContactListItemCol>
      <StyledContactListItemCompany className="text-truncate contact-list-item-company">
        <span className="text-truncate">
          {contact.companyName ? contact.companyName : null}
        </span>
      </StyledContactListItemCompany>

      <StyledContactListItemAction className="contact-list-item-action">
        <StyledContactListExportIcon
          style={{ color: onGetLabelColor(contact.label._id) }}
        />
        <StyledContactListItemMenuView
          onClick={(event) => event.stopPropagation()}
        >
          <ItemMenu
            onSelectContactsForDelete={onSelectContactsForDelete}
            contact={contact}
            onChangeStarred={() => onChangeStarred(contact._id)}
            onOpenEditContact={onOpenEditContact}
          />
        </StyledContactListItemMenuView>
      </StyledContactListItemAction>
      <ActionBtnHover
        contact={contact}
        onChangeStarred={() => onChangeStarred(contact._id)}
        onSelectContactsForDelete={onSelectContactsForDelete}
        onOpenEditContact={onOpenEditContact}
      />
    </StyledContactListItem>
  );
};

export default ContactListItem;
