import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { UserType } from "@crema/types/models/dashboards/UserType";
import {
  Alert,
  Avatar,
  Button,
  Col,
  Divider,
  Drawer,
  Dropdown,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  useOrganizationActionsContext,
  useOrganizationContext,
} from "modules/apps/context/OrganizationContextProvider";
import { useUserActionsContext } from "modules/apps/context/UserContextProvider";
import { StyledRequiredField } from "modules/dashboards/index.styled";
import { StatusEnums } from "utils/common-constants.utils";
import {
  Tt_DateFormat,
  Tt_GetUserAvatar,
} from "utils/common-functions.utils";
import { useState } from "react";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";
import { FaBuildingUser, FaUserGear } from "react-icons/fa6";
import { GoDotFill } from "react-icons/go";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { VscEye } from "react-icons/vsc";
import { StyledText, StyledUserInfoAvatar } from "../../index.styled";

const getStatusUser = (status: string) => {
  switch (status) {
    case StatusEnums.ACTIVE: {
      return (
        <span className="tt-expenses-success">
          <GoDotFill />
        </span>
      );
    }
    case StatusEnums.DISABLED: {
      return (
        <span className="tt-expenses-tomato">
          <GoDotFill />
        </span>
      );
    }
    case StatusEnums.PENDING: {
      return (
        <span className="tt-expenses-warning">
          <GoDotFill />
        </span>
      );
    }
    case StatusEnums.NEVER_CONNECTED: {
      return (
        <span className="tt-expenses-sliver">
          <GoDotFill />
        </span>
      );
    }
    case StatusEnums.ARCHIVED: {
      return (
        <span className="tt-expenses-primary">
          <GoDotFill />
        </span>
      );
    }
  }
};

type Props = {
  user: UserType;
};

const UserActions = ({ user }: Props) => {
  // States
  const {
    handleOnDelete,
    handleOnGetUser,
    handleOnAddOrganizationsToUser,
    handleOnUpdateUserStatus,
  } = useUserActionsContext();
  const { reCallAPI } = useOrganizationActionsContext();
  const { organizations } = useOrganizationContext();
  const [isAppDrawerViewOpen, setAppDrawerViewOpen] = useState(false);
  const [isAppDrawerStatusOpen, setAppDrawerStatusOpen] = useState(false);
  const [isAppDrawerOrgOpen, setAppDrawerOrgOpen] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState([]);
  const [userStatut, setUserStatut] = useState(user.status);
  const [groups, setGroups] = useState([]);

  // Destructing
  const { Option } = Select;

  // Init
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
          <CiEdit className="tt-expenses-secondary tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.edit" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <FaUserGear className="tt-expenses-warning tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.status" />
        </span>
      ),
    },
    {
      key: 4,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <FaBuildingUser className="tt-expenses-default tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.organization" />
        </span>
      ),
    },
    {
      key: 5,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiTrash className="tt-expenses-tomato tt-expenses-margin-btn-icon" />{" "}
          <IntlMessages id="common.delete" />
        </span>
      ),
    },
  ];

  // Functions
  const handleOnGetUserOrganizations = (user: UserType) => {
    setUserOrganizations(
      organizations.filter((org) =>
        org.users.find((userOrg) => userOrg._id === user._id)
      )
    );
  };

  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case "1":
        setAppDrawerViewOpen(!isAppDrawerViewOpen);
        handleOnGetUserOrganizations(user);
        break;
      case "2":
        handleOnGetUser(user);
        break;
      case "3":
        setAppDrawerStatusOpen(!isAppDrawerStatusOpen);
        break;
      case "4":
        setAppDrawerOrgOpen(!isAppDrawerOrgOpen);
        setGroups(
          organizations
            .filter((org) =>
              org.users.find((userOrg) => userOrg._id === user._id)
            )
            .map((org) => org._id)
        );
        break;
      case "5":
        handleOnDelete(user);
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
      {/* View User */}
      <Drawer
        title={<IntlMessages id="dashboard.user.view" />}
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
            {user?.photoURL ? (
              <Avatar
                style={{
                  marginRight: 14,
                  width: 80,
                  height: 80,
                }}
                src={user?.photoURL.secure_url}
              />
            ) : (
              <StyledUserInfoAvatar photoRGA={user.photoRGA}>
                {Tt_GetUserAvatar(user)}
              </StyledUserInfoAvatar>
            )}
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.userId" />}
              content={user.username}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.gender" />}
              content={user.gender}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.firstname" />}
              content={user.firstName}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.lastname" />}
              content={user.lastName}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.role" />}
              content={user.role}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.birthday" />}
              content={Tt_DateFormat(user.dateOfBorn)}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.email" />}
              content={user.email}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.phone" />}
              content={user.phoneNumber}
            />
          </Col>
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.status" />}
              content={getStatusUser(user.status)}
            />
          </Col>
          <Divider className="tt-expenses-background-sliver m-9" />
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="common.createdBy" />}
              content={user.createdBy ? user.createdBy.displayName : "-"}
            />
          </Col>
          <Divider className="tt-expenses-background-sliver m-9" />
          <Col xs={24} lg={24}>
            <DescriptionItem
              title={<IntlMessages id="sidebar.app.dashboard.organizations" />}
              content={userOrganizations.length}
            />
            <Avatar.Group
              maxCount={10}
              maxStyle={{
                color: "#fff",
                backgroundColor: "#2997ff99",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
              }}
            >
              {userOrganizations.map((data, index) => (
                <>
                  <Tooltip
                    placement="topLeft"
                    title={data.name}
                    className="tt-expenses-cursor-pointer"
                  >
                    <Avatar
                      size={45}
                      key={"organization-" + index}
                      alt={data.name}
                      src={
                        data.logo?.secure_url
                          ? data.logo?.secure_url
                          : "/assets/icon/default-org.jpg"
                      }
                    />
                  </Tooltip>
                </>
              ))}
            </Avatar.Group>
          </Col>
        </Row>
      </Drawer>
      {/* Status User */}
      <Drawer
        title={<IntlMessages id="dashboard.user.status" />}
        placement={"right"}
        open={isAppDrawerStatusOpen}
        onClose={() => setAppDrawerStatusOpen(!isAppDrawerStatusOpen)}
        footer={
          <Space>
            <Button
              key="back"
              onClick={() => setAppDrawerStatusOpen(!isAppDrawerStatusOpen)}
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
                handleOnUpdateUserStatus(user._id, userStatut);
                setAppDrawerStatusOpen(!isAppDrawerStatusOpen);
              }}
              disabled={user.status === userStatut}
            >
              <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.add" />
            </Button>
          </Space>
        }
      >
        <Row>
          <Col xs={24} lg={24}>
            <Alert
              message={<IntlMessages id="common.alert.info.message" />}
              description={
                <IntlMessages id="common.alert.statut.description" />
              }
              type="info"
              showIcon
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24} lg={24}>
            <label htmlFor="status" className="label">
              <IntlMessages id="common.status" />
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Select
              size="large"
              value={userStatut || undefined}
              showSearch
              showArrow
              style={{ width: "100%" }}
              placeholder={<IntlMessages id="placeholder.select" />}
              optionLabelProp="label"
              optionFilterProp="label"
              onChange={(e) => setUserStatut(e)}
            >
              {Object.values(StatusEnums)?.map((statut, index) => (
                <Option
                  key={index}
                  value={statut}
                  disabled={statut === StatusEnums.NEVER_CONNECTED}
                  label={
                    <IntlMessages
                      id={`common.status.${statut
                        .replaceAll("_", ".")
                        .toLocaleLowerCase()}`}
                    />
                  }
                >
                  <div className="tt-expenses-space-start">
                    {getStatusUser(statut)}
                    <span>
                      <IntlMessages
                        id={`common.status.${statut
                          .replaceAll("_", ".")
                          .toLocaleLowerCase()}`}
                      />
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Drawer>
      {/* Organizations User */}
      <Drawer
        title={<IntlMessages id="dashboard.user.organization" />}
        placement={"right"}
        open={isAppDrawerOrgOpen}
        onClose={() => setAppDrawerOrgOpen(!isAppDrawerOrgOpen)}
        footer={
          <Space>
            <Button
              key="back"
              onClick={() => setAppDrawerOrgOpen(!isAppDrawerOrgOpen)}
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
                handleOnAddOrganizationsToUser(user._id, groups);
                setAppDrawerOrgOpen(!isAppDrawerOrgOpen);
                reCallAPI();
              }}
              disabled={!groups?.length}
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
              <IntlMessages id="sidebar.app.dashboard.organizations" />
              <StyledRequiredField>*</StyledRequiredField>
            </label>
            <Select
              size="large"
              value={groups || undefined}
              showSearch
              showArrow
              mode="multiple"
              style={{ width: "100%" }}
              placeholder={<IntlMessages id="placeholder.select" />}
              optionLabelProp="label"
              optionFilterProp="label"
              onChange={(e) => setGroups(e)}
            >
              {organizations?.map((org, index) => (
                <Option key={index} value={org._id} label={org.name}>
                  <div className="tt-expenses-space-center">
                    <Avatar
                      size={45}
                      key={"organization-" + index}
                      alt={org.name}
                      src={
                        org.logo?.secure_url
                          ? org.logo?.secure_url
                          : "/assets/icon/default-org.jpg"
                      }
                    />
                    <div>
                      <Typography.Title
                        level={5}
                        style={{ fontSize: 14, marginBottom: 0 }}
                      >
                        {org?.name}
                      </Typography.Title>
                      <StyledText>{org?.code}</StyledText>
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
export default UserActions;
