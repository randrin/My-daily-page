import { CheckOutlined } from "@ant-design/icons";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import {
  ContactType,
  LabelType,
} from "@crema/types/models/dashboards/ContactType";
import { Avatar } from "antd";
import clsx from "clsx";
import React from "react";
import {
  StyledContactListContentMobileItem,
  StyledContactListExportMobileIcon,
  StyledContactListItemActionMobile,
  StyledContactListItemAvatar,
  StyledContactListItemAvatarView,
  StyledContactListItemContentMobile,
  StyledContactListItemMobile,
  StyledContactListMainContent,
  StyledContactListMobileAvatarView,
  StyledContactListStarMobile,
} from "../index.styled";

type ContactListItemProps = {
  contact: ContactType;
  labelList: LabelType[];
  onChangeStarred: (isStarred: boolean, contact: ContactType) => void;
  onChangeCheckedContacts: (event: any, id: string) => void;
  checkedContacts: string[];
  onSelectContactsForDelete?: (contactIds: string[]) => void;
  onOpenEditContact?: (contact: ContactType) => void;
  onViewContactDetail: (contact: ContactType) => void;

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
      return labelList.find((label) => Number(label._id) === labelId)!.color;
    }
    return "";
  };

  return (
    <>
      <StyledContactListItemMobile
        key={contact._id}
        className={clsx("item-hover", {
          rootCheck: checkedContacts.includes(contact._id),
        })}
        onClick={() => onViewContactDetail(contact)}
      >
        <StyledContactListMainContent>
          <StyledContactListMobileAvatarView
            className={clsx({
              checked: checkedContacts.includes(contact._id),
            })}
            onClick={(event) => {
              event.stopPropagation();
              onChangeCheckedContacts(
                !checkedContacts.includes(contact._id),
                contact._id
              );
            }}
          >
            {checkedContacts.includes(contact._id) ? (
              <CheckOutlined />
            ) : (
              <StyledContactListItemAvatarView>
                {contact.photoURL ? (
                  <Avatar size={36} src={contact.photoURL.secure_url} />
                ) : (
                  <StyledContactListItemAvatar size={36}>
                    {contact.displayName[0].toUpperCase()}
                  </StyledContactListItemAvatar>
                )}
              </StyledContactListItemAvatarView>
            )}
          </StyledContactListMobileAvatarView>

          <StyledContactListItemContentMobile>
            <StyledContactListContentMobileItem className="text-truncate">
              {contact.displayName}
            </StyledContactListContentMobileItem>

            <span className="text-truncate">{contact.phoneNumber}</span>
          </StyledContactListItemContentMobile>
        </StyledContactListMainContent>
        <StyledContactListItemActionMobile>
          <StyledContactListExportMobileIcon
            style={{ color: onGetLabelColor(Number(contact.label._id)) }}
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
