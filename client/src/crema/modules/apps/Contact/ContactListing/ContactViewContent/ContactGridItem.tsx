import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import ItemMenu from "./ItemMenu";
import { Checkbox } from "antd";
import ActionBtnHover from "./ActionBtnHover";
import {
  StyledContactGridCard,
  StyledContactGridHeader,
  StyledContactGridHeaderCheckbox,
  StyledGridCardAction,
  StyledGridCardActionHeader,
  StyledGridCardActionItem,
  StyledGridCardAvatar,
  StyledGridCardContent,
  StyledGridCardTitle,
  StyledIdcardOutlined,
  StyledPhoneOutlined,
} from "../index.styled";
import { ContactObjType, LabelObjType } from "@crema/types/models/apps/Contact";

type ContactGridItemProps = {
  contact: ContactObjType;
  labelList: LabelObjType[];
  onChangeStarred: (isStarred: boolean, contact: ContactObjType) => void;
  onChangeCheckedContacts: (event: any, id: number) => void;
  checkedContacts: number[];
  onSelectContactsForDelete: (contactIds: number[]) => void;
  onOpenEditContact: (contact: ContactObjType) => void;
  onViewContactDetail: (contact: ContactObjType) => void;

  [x: string]: any;
};

const ContactGridItem: React.FC<ContactGridItemProps> = ({
  contact,
  onChangeCheckedContacts,
  checkedContacts,
  onChangeStarred,
  onSelectContactsForDelete,
  onOpenEditContact,
  onViewContactDetail,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  return (
    <StyledContactGridCard
      className="card-hover"
      onClick={() => onViewContactDetail(contact)}
    >
      <StyledContactGridHeader>
        <StyledContactGridHeaderCheckbox
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            checked={checkedContacts.includes(contact.id)}
            onChange={() => {
              setIsChecked(!isChecked);
              onChangeCheckedContacts(!isChecked, contact.id);
            }}
          />
        </StyledContactGridHeaderCheckbox>

        {contact.image ? (
          <StyledGridCardAvatar src={contact.image} />
        ) : (
          <StyledGridCardAvatar>
            {contact.name[0].toUpperCase()}
          </StyledGridCardAvatar>
        )}

        <StyledGridCardActionHeader
          onClick={(event) => event.stopPropagation()}
        >
          <ItemMenu
            onSelectContactsForDelete={onSelectContactsForDelete}
            contact={contact}
            onChangeStarred={onChangeStarred}
            onOpenEditContact={onOpenEditContact}
          />
        </StyledGridCardActionHeader>

        <ActionBtnHover
          contact={contact}
          onChangeStarred={onChangeStarred}
          onSelectContactsForDelete={onSelectContactsForDelete}
          onOpenEditContact={onOpenEditContact}
        />
      </StyledContactGridHeader>

      <StyledGridCardContent>
        <StyledGridCardTitle>{contact.name}</StyledGridCardTitle>
        <p className="text-truncate">{contact.email ? contact.email : null}</p>
      </StyledGridCardContent>

      <StyledGridCardAction>
        <StyledGridCardActionItem>
          <StyledIdcardOutlined />
          <p className="text-truncate mb-0">
            {contact.company ? (
              contact.company
            ) : (
              <IntlMessages id="common.na" />
            )}
          </p>
        </StyledGridCardActionItem>
        <StyledGridCardActionItem>
          <StyledPhoneOutlined />
          <p className="text-truncate mb-0">{contact.contact}</p>
        </StyledGridCardActionItem>
      </StyledGridCardAction>
    </StyledContactGridCard>
  );
};

export default ContactGridItem;
