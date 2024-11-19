import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import AppIconButton from "@crema/components/AppIconButton";
import { ContactObjType } from "@crema/types/models/apps/Contact";

type ItemMenuProps = {
  onSelectContactsForDelete: (ids: number[]) => void;
  contact: ContactObjType;
  onChangeStarred: (isStarred: boolean, contact: ContactObjType) => void;
  onOpenEditContact: (contact: ContactObjType) => void;
};

const ItemMenu: React.FC<ItemMenuProps> = ({
  onSelectContactsForDelete,
  contact,
  onChangeStarred,
  onOpenEditContact,
}) => {
  const onDeleteContact = () => {
    onSelectContactsForDelete([contact.id]);
  };

  const onChangeStarredStatus = () => {
    onChangeStarred(!contact.isStarred, contact);
  };

  const onClickEditOption = () => {
    onOpenEditContact(contact);
  };

  const items = [
    {
      key: 1,
      label: (
        <span onClick={onChangeStarredStatus}>
          {contact.isStarred ? (
            <IntlMessages id="common.unstarred" />
          ) : (
            <IntlMessages id="common.starred" />
          )}
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <span key={312} onClick={onClickEditOption}>
          <IntlMessages id="common.edit" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span key={313} onClick={onDeleteContact}>
          <IntlMessages id="common.delete" />
        </span>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <AppIconButton
        icon={<MoreOutlined />}
        title={<IntlMessages id="common.more" />}
      />
    </Dropdown>
  );
};

export default ItemMenu;
