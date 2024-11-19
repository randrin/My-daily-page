import React from "react";
import clsx from "clsx";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { Avatar } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  StyledContactListMobileAvatarView,
  StyledContactListItemMobile,
  StyledContactListMainContent,
  StyledContactListItemAvatarView,
  StyledContactListItemAvatar,
  StyledContactListItemContentMobile,
  StyledContactListContentMobileItem,
  StyledContactListItemActionMobile,
  StyledContactListExportMobileIcon,
  StyledContactListStarMobile,
} from "../index.styled";
import { ContactObjType, LabelObjType } from "@crema/types/models/apps/Contact";

type ContactListItemProps = {
  contact: ContactObjType;
  labelList: LabelObjType[];
  onChangeStarred: (isStarred: boolean, contact: ContactObjType) => void;
  onChangeCheckedContacts: (event: any, id: number) => void;
  checkedContacts: number[];
  onSelectContactsForDelete?: (contactIds: number[]) => void;
  onOpenEditContact?: (contact: ContactObjType) => void;
  onViewContactDetail: (contact: ContactObjType) => void;

  [x: string]: any;
};

const ContactListItemMobile: React.FC<ContactListItemProps> = ({
  contact,
  labelList,
  checkedContacts,
  onChangeStarred,
  onViewContactDetail,
  onChangeCheckedContacts,
}) => {
  const onGetLabelColor = (labelId: number): string => {
    if (labelId) {
      return labelList.find((label) => label.id === labelId)!.color;
    }
    return "";
  };

  return (
    <>
      <StyledContactListItemMobile
        key={contact.id}
        className={clsx("item-hover", {
          rootCheck: checkedContacts.includes(contact.id),
        })}
        onClick={() => onViewContactDetail(contact)}
      >
        <StyledContactListMainContent>
          <StyledContactListMobileAvatarView
            className={clsx({
              checked: checkedContacts.includes(contact.id),
            })}
            onClick={(event) => {
              event.stopPropagation();
              onChangeCheckedContacts(
                !checkedContacts.includes(contact.id),
                contact.id
              );
            }}
          >
            {checkedContacts.includes(contact.id) ? (
              <CheckOutlined />
            ) : (
              <StyledContactListItemAvatarView>
                {contact.image ? (
                  <Avatar size={36} src={contact.image} />
                ) : (
                  <StyledContactListItemAvatar size={36}>
                    {contact.name[0].toUpperCase()}
                  </StyledContactListItemAvatar>
                )}
              </StyledContactListItemAvatarView>
            )}
          </StyledContactListMobileAvatarView>

          <StyledContactListItemContentMobile>
            <StyledContactListContentMobileItem className="text-truncate">
              {contact.name}
            </StyledContactListContentMobileItem>

            <span className="text-truncate">{contact.contact}</span>
          </StyledContactListItemContentMobile>
        </StyledContactListMainContent>
        <StyledContactListItemActionMobile>
          <StyledContactListExportMobileIcon
            style={{ color: onGetLabelColor(contact.label) }}
          />

          <StyledContactListStarMobile
            onClick={(event) => event.stopPropagation()}
          >
            <AppsStarredIcon item={contact} onChange={onChangeStarred} />
          </StyledContactListStarMobile>
        </StyledContactListItemActionMobile>
      </StyledContactListItemMobile>
    </>
  );
};

export default ContactListItemMobile;
