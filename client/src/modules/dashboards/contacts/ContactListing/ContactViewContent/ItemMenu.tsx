import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import AppIconButton from "@crema/components/AppIconButton";
import { ContactObjType } from "@crema/types/models/apps/Contact";
import { ContactType } from "@crema/types/models/dashboards/ContactType";

type ItemMenuProps = {
  onSelectContactsForDelete: (ids: string[]) => void;
  contact: ContactType;
  onChangeStarred: (isStarred: boolean, contact: ContactType) => void;
  onOpenEditContact: (contact: ContactType) => void;
};

const ItemMenu: React.FC<ItemMenuProps> = ({
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
