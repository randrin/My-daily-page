import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import ConfirmationModal from "@crema/components/AppConfirmationModal";
import { MoreOutlined } from "@ant-design/icons";
import AppsStarredIcon from "@crema/components/AppsStarredIcon";
import { Dropdown } from "antd";
import UserInfo from "../../ChatSideBar/UserInfo";
import AppIconButton from "@crema/components/AppIconButton";
import { MdOutlinePhone } from "react-icons/md";
import { BiVideo } from "react-icons/bi";
import { StyledChatHeader, StyledChatHeaderAction } from "../index.styled";
import { ConnectionObjType } from "@crema/types/models/apps/Chat";

type HeaderProps = {
  selectedUser: ConnectionObjType;
  onChangeStarred: (checked: boolean) => void;
  clearChatHistory: () => void;
  deleteConversation: () => void;
  isChecked: boolean;
};

const Header: React.FC<HeaderProps> = ({
  deleteConversation,
  selectedUser,
  onChangeStarred,
  clearChatHistory,
  isChecked,
}) => {
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const toggleDeleteModal = () => {
    setDeleteModalOpen(!isDeleteModalOpen);
  };

  const onDeleteConversation = () => {
    deleteConversation();
    toggleDeleteModal();
  };

  const items = [
    {
      key: 1,
      label: (
        <span onClick={toggleDeleteModal}>
          <IntlMessages id="chatApp.deleteConversation" />
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <span onClick={clearChatHistory}>
          <IntlMessages id="chatApp.clearChat" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span>
          <IntlMessages id="chatApp.hide" />
        </span>
      ),
    },
  ];

  return (
    <StyledChatHeader>
      <UserInfo user={selectedUser} showStatus={true} />
      <StyledChatHeaderAction>
        <AppIconButton
          title={<IntlMessages id="common.call" />}
          icon={<MdOutlinePhone />}
        />

        <AppIconButton
          title={<IntlMessages id="common.videoCall" />}
          icon={<BiVideo />}
        />

        <AppsStarredIcon
          item={{ isStarred: isChecked }}
          onChange={onChangeStarred}
        />

        <Dropdown menu={{ items }} trigger={["click"]}>
          <AppIconButton
            title={<IntlMessages id="common.more" />}
            icon={<MoreOutlined />}
          />
        </Dropdown>
      </StyledChatHeaderAction>

      {isDeleteModalOpen ? (
        <ConfirmationModal
          open={isDeleteModalOpen}
          onDeny={setDeleteModalOpen}
          onConfirm={onDeleteConversation}
          modalTitle={<IntlMessages id="chatApp.deleteContent" />}
        />
      ) : null}
    </StyledChatHeader>
  );
};

export default Header;
