import IntlMessages from "@crema/helpers/IntlMessages";
import { UserType } from "@crema/types/models/dashboards/UserType";
import { Avatar, Tooltip, Typography } from "antd";
import { useOrganizationContext } from "modules/apps/context/OrganizationContextProvider";
import moment from "moment";
import { useState } from "react";
import { GoDotFill, GoEye, GoEyeClosed } from "react-icons/go";
import { LiaFemaleSolid, LiaMaleSolid } from "react-icons/lia";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  GENDER_FEMALE,
  PREFIX_PASSWORD,
  StatusEnums,
} from "utils/common-constants.utils";
import { Tt_FormatDate, Tt_GetUserAvatar } from "utils/common-functions.utils";
import {
  StyledFlex,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import { StyledUserTable } from "../index.styled";
import UserActions from "./UserActions";

type Props = {
  userData: UserType[];
  loading: boolean;
};

const getGenderIcon = (gender) => {
  return gender === GENDER_FEMALE ? <LiaFemaleSolid /> : <LiaMaleSolid />;
};

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

const UsersTable: React.FC<Props> = ({ userData, loading }: Props) => {
  // States
  const { organizations } = useOrganizationContext();
  const [showPassword, setShowwPassword] = useState(false);

  // Init
  const columns = [
    {
      title: <IntlMessages id="common.userId" />,
      dataIndex: "username",
      key: "username",
    },
    {
      title: <IntlMessages id="common.user" />,
      dataIndex: "user",
      key: "user",
      render: (id, record) => (
        <StyledFlex>
          {record?.photoURL ? (
            <Avatar
              style={{
                marginRight: 14,
                width: 44,
                height: 44,
              }}
              src={record?.photoURL.secure_url}
            />
          ) : (
            <StyledUserInfoAvatar photoRGA={record.photoRGA}>
              {Tt_GetUserAvatar(record)}
            </StyledUserInfoAvatar>
          )}
          <div
            style={{
              flex: 1,
            }}
          >
            <Typography.Title
              level={5}
              style={{ fontSize: 14, marginBottom: 0 }}
            >
              {record?.displayName}
            </Typography.Title>
            <StyledText>{record?.email}</StyledText>
          </div>
        </StyledFlex>
      ),
    },
    {
      title: <IntlMessages id="common.gender" />,
      dataIndex: "gender",
      key: "gender",
      render: (id, record) => (
        <span className="tt-expenses-primary" style={{ fontSize: "20px" }}>
          {getGenderIcon(record.gender)}
        </span>
      ),
    },
    {
      title: <IntlMessages id="common.role" />,
      dataIndex: "role",
      key: "role",
      render: (id, record) => (
        <span className="tt-expenses-primary">
          {record.role ? (
            <IntlMessages id={`common.role.${record.role.toLowerCase()}`} />
          ) : (
            "-"
          )}
        </span>
      ),
    },
    {
      title: <IntlMessages id="sidebar.app.dashboard.organizations" />,
      dataIndex: "users",
      key: "users",
      render: (id, record) => (
        <div className="tt-users-groups">
          {!!handleOnGetUserOrganizations(record)?.length ? (
            <Avatar.Group
              maxCount={4}
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
              {handleOnGetUserOrganizations(record)?.map((data, index) => (
                <>
                  <Tooltip
                    placement="topLeft"
                    title={data.name}
                    className="tt-expenses-cursor-pointer"
                  >
                    <Avatar
                      size={40}
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
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      title: <IntlMessages id="common.status" />,
      dataIndex: "status",
      key: "status",
      render: (text, record) => <span>{getStatusUser(record.status)}</span>,
    },
    {
      title: <IntlMessages id="common.password" />,
      dataIndex: "tmpPassword",
      key: "tmpPassword",
      render: (text, record) => (
        <span className="d-flex">
          {record.tmpPassword ? (
            <span className="tt-expenses-space-center">
              <span className="mr-6">
                {showPassword ? getUserPassword(record) : "xxxxx"}
              </span>
              {showPassword ? (
                <GoEye
                  className="tt-expenses-primary"
                  onClick={() => setShowwPassword(!showPassword)}
                />
              ) : (
                <GoEyeClosed
                  className="tt-expenses-primary"
                  onClick={() => setShowwPassword(!showPassword)}
                />
              )}{" "}
            </span>
          ) : (
            "-"
          )}
        </span>
      ),
    },
    {
      title: <IntlMessages id="common.createdAt.updatedAt" />,
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (id, record) => (
        <span>
          {Tt_FormatDate(moment(record.updatedAt).format(FORMAT_DATE_ONE))}{" "}
          <br />
          <i>{moment(record.updatedAt).format(FORMAT_DATE_TWO)}</i>
        </span>
      ),
    },
    {
      title: <IntlMessages id="common.actions" />,
      dataIndex: "more",
      key: "more",
      fixed: "right",
      className: "order-table-action",
      render: (text, record) => <UserActions user={record} />,
    },
  ];

  // Functions
  const handleOnGetUserOrganizations = (user: UserType) => {
    return organizations?.filter((org) =>
      org.users.find((userOrg) => user._id === userOrg._id)
    );
  };

  const getUserPassword = (record: UserType) => {
    const currentDate = moment(record.createdAt).format("DD");
    const currentMonth = moment(record.createdAt).format("MM");
    const currentYear = moment(record.createdAt).format("YYYY");
    const defaultPassword = `${PREFIX_PASSWORD}${currentDate}${currentMonth}${currentYear}${"!"}`;
    return defaultPassword;
  };

  // Render
  return (
    <StyledUserTable
      hoverColor
      data={userData}
      loading={loading}
      columns={columns}
      pagination={false}
      scroll={{ x: "auto" }}
    />
  );
};

export default UsersTable;
