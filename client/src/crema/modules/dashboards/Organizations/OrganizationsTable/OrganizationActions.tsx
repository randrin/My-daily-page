import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  Avatar,
  Button,
  Col,
  Drawer,
  Dropdown,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useOrganizationActionsContext } from "modules/apps/context/OrganizationContextProvider";
import { useUserContext } from "modules/apps/context/UserContextProvider";
import { StatusEnums } from "utils/common-constants.utils";
import {
  Tt_DateFormat,
  Tt_GetUserAvatar,
} from "utils/common-functions.utils";
import { useEffect, useState } from "react";
import { AiOutlineUserSwitch } from "react-icons/ai";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle, LuPowerOff } from "react-icons/lu";
import { VscEye } from "react-icons/vsc";
import { StyledText, StyledUserInfoAvatar } from "../../index.styled";

const OrganizationActions = ({ organization }) => {
  // States
  const {
    handleOnGetOrganization,
    handleOnEnabledOrDisabled,
    handleOnDelete,
    handleOnAddUsersToOrganization,
  } = useOrganizationActionsContext();
  const { users } = useUserContext();
  const [isAppDrawerViewOpen, setAppDrawerViewOpen] = useState(false);
  const [isAppDrawerAddOpen, setAppDrawerAddOpen] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState([]);

  // Destructing
  const { Option } = Select;

  // Init
  useEffect(() => {
    setUserOrganizations(organization.users.map((user) => user._id));
  }, []);

  const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label">
        <b>{title}</b>:
      </p>
      {content}
    </div>
  );

  const items = [
    {
      key: 1,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <VscEye className="tt-expenses-primary tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.view" />
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiEdit className="tt-expenses-secondary tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.edit" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <AiOutlineUserSwitch className="tt-expenses-default tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.users" />
        </span>
      ),
    },
    {
      key: 4,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          {organization.status === StatusEnums.ACTIVE ? (
            <>
              <LuPowerOff className="tt-expenses-tomato tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.disable" />
            </>
          ) : (
            <>
              <LuPowerOff className="tt-expenses-success tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.enable" />
            </>
          )}
        </span>
      ),
    },
    {
      key: 5,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiTrash className="tt-expenses-tomato tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.delete" />
        </span>
      ),
    },
  ];

  // Functions
  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case "1":
        setAppDrawerViewOpen(!isAppDrawerViewOpen);
        break;
      case "2":
        handleOnGetOrganization(organization);
        break;
      case "3":
        setAppDrawerAddOpen(!isAppDrawerAddOpen);
        break;
      case "4":
        handleOnEnabledOrDisabled(organization._id);
        break;
      case "5":
        handleOnDelete(organization._id);
        break;
      default:
        break;
    }
  };

  // Render
  return (
    <>
      <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]}>
        <AppIconButton icon={<CiCircleMore />} />
      </Dropdown>
      {/* View Organization */}
      <Drawer
        title={<IntlMessages id="dashboard.organization.view" />}
        placement={"right"}
        open={isAppDrawerViewOpen}
        onClose={() => setAppDrawerViewOpen(!isAppDrawerViewOpen)}
        footer={
          <Space>
            <Button
              key="back"
              onClick={() => setAppDrawerViewOpen(!isAppDrawerViewOpen)}
              className="tt-expenses-space-center"
            >
              <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.back" />
            </Button>
          </Space>
        }
      >
        <Row>
          <Col xs={24} lg={24} className="tt-expenses-space-center pb-15">
            <Avatar
              style={{
                marginRight: 14,
                width: 80,
                height: 80,
              }}
              src={
                organization.logo?.secure_url
                  ? organization.logo?.secure_url
                  : "/assets/icon/default-org.jpg"
              }
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.name" />}
              content={organization.name}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.code" />}
              content={organization.code}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.description" />}
              content={organization.description}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.createdAt" />}
              content={Tt_DateFormat(organization.createdAt)}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.head.office" />}
              content={organization.headOffice}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.phone" />}
              content={organization.phoneNumber || "-"}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.createdBy" />}
              content={organization.createdBy.displayName}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.number.users" />}
              content={organization.users.length}
            />
            <Avatar.Group>
              {organization.users.map((data, index) => (
                <>
                  <Tooltip
                    placement="topLeft"
                    title={data.displayName}
                    className="tt-expenses-cursor-pointer"
                  >
                    {data.photoURL ? (
                      <Avatar
                        size={45}
                        key={"member-" + index}
                        alt={data.displayName}
                        src={data.photoURL?.secure_url}
                      />
                    ) : (
                      <StyledUserInfoAvatar photoRGA={data?.photoRGA}>
                        {Tt_GetUserAvatar(data)}
                      </StyledUserInfoAvatar>
                    )}
                  </Tooltip>
                </>
              ))}
            </Avatar.Group>
          </Col>
        </Row>
      </Drawer>
      {/* Add users to Organization */}
      <Drawer
        title={<IntlMessages id="dashboard.organization.add.user" />}
        placement={"right"}
        open={isAppDrawerAddOpen}
        onClose={() => setAppDrawerAddOpen(!isAppDrawerAddOpen)}
        footer={
          <Space>
            <Button
              key="back"
              onClick={() => setAppDrawerAddOpen(!isAppDrawerAddOpen)}
              className="tt-expenses-space-center"
            >
              <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.back" />
            </Button>
            ,
            <Button
              type="primary"
              className="tt-expenses-space-center"
              onClick={() => {
                handleOnAddUsersToOrganization(
                  organization._id,
                  userOrganizations
                );
                setAppDrawerAddOpen(!isAppDrawerAddOpen);
              }}
              disabled={!userOrganizations?.length}
            >
              <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.add" />
            </Button>
          </Space>
        }
      >
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="groups" className="label">
              <IntlMessages id="common.users" />
            </label>
            <Select
              size="large"
              value={userOrganizations || undefined}
              showSearch
              showArrow
              mode="multiple"
              style={{ width: "100%" }}
              placeholder={<IntlMessages id="placeholder.select" />}
              optionLabelProp="label"
              optionFilterProp="label"
              onChange={(e) => setUserOrganizations(e)}
            >
              {users.map((user, index) => (
                <Option key={index} value={user._id} label={user.displayName}>
                  <div className="tt-expenses-space-center">
                    {user?.photoURL ? (
                      <Avatar
                        style={{
                          marginRight: 14,
                          width: 40,
                          height: 40,
                        }}
                        src={user?.photoURL.secure_url}
                      />
                    ) : (
                      <StyledUserInfoAvatar photoRGA={user?.photoRGA}>
                        {Tt_GetUserAvatar(user)}
                      </StyledUserInfoAvatar>
                    )}
                    <div>
                      <Typography.Title
                        level={5}
                        style={{ fontSize: 14, marginBottom: 0 }}
                      >
                        {user?.displayName}
                      </Typography.Title>
                      <StyledText>{user?.email}</StyledText>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
export default OrganizationActions;
