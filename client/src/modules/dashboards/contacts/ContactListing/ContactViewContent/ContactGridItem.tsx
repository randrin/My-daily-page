import IntlMessages from "@crema/helpers/IntlMessages";
import {
  ContactType,
  LabelType,
} from "@crema/types/models/dashboards/ContactType";
import { Checkbox } from "antd";
import React, { useState } from "react";
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
import ActionBtnHover from "./ActionBtnHover";
import ItemMenu from "./ItemMenu";

type ContactGridItemProps = {
  contact: ContactType;
  labelList: LabelType[];
  onChangeStarred: (isStarred: boolean, contact: ContactType) => void;
  onChangeCheckedContacts: (event: any, id: string) => void;
  checkedContacts: string[];
  onSelectContactsForDelete: (contactIds: string[]) => void;
  onOpenEditContact: (contact: ContactType) => void;
  onViewContactDetail: (contact: ContactType) => void;

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
            checked={checkedContacts.includes(contact._id)}
            onChange={() => {
              setIsChecked(!isChecked);
              onChangeCheckedContacts(!isChecked, contact._id);
            }}
          />
        </StyledContactGridHeaderCheckbox>

        {contact.photoURL ? (
          <StyledGridCardAvatar src={contact.photoURL.secure_url} />
        ) : (
          <StyledGridCardAvatar>
            {contact.displayName[0].toUpperCase()}
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
        <StyledGridCardTitle>{contact.displayName}</StyledGridCardTitle>
        <p className="text-truncate">{contact.email ? contact.email : null}</p>
      </StyledGridCardContent>

      <StyledGridCardAction>
        <StyledGridCardActionItem>
          <StyledIdcardOutlined />
          <p className="text-truncate mb-0">
            {contact.companyName ? (
              contact.companyName
            ) : (
              <IntlMessages id="common.na" />
            )}
          </p>
        </StyledGridCardActionItem>
        <StyledGridCardActionItem>
          <StyledPhoneOutlined />
          <p className="text-truncate mb-0">{contact.phoneNumber}</p>
        </StyledGridCardActionItem>
      </StyledGridCardAction>
    </StyledContactGridCard>
  );
};

export default ContactGridItem;
