import { OrganizationType } from "@crema/types/models/dashboards/OrganizationType";
import { Avatar, Tooltip, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { NextRouter, useRouter } from "next/router";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  StatusEnums,
} from "utils/common-constants.utils";
import {
  Tt_FormatDate,
  Tt_GetUserAvatar,
} from "utils/common-functions.utils";
import {
  StyledFlex,
  StyledObjectStatus,
  StyledObjectTable,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import OrganizationActions from "./OrganizationActions";
import IntlMessages from "@crema/helpers/IntlMessages";

const getStatusColor = (status: string) => {
  switch (status) {
    case StatusEnums.ACTIVE: {
      return "#43C888";
    }
    case StatusEnums.DISABLED: {
      return "#F84E4E";
    }
  }
};

const getColumns = (router: NextRouter): ColumnsType<OrganizationType> => [
  {
    title: <IntlMessages id="common.logo" />,
    dataIndex: "logo",
    key: "logo",
    render: (id, record) => (
      <StyledFlex>
        <Avatar
          style={{
            marginRight: 14,
            width: 44,
            height: 44,
          }}
          src={
            record.logo?.secure_url
              ? record.logo?.secure_url
              : "/assets/icon/default-org.jpg"
          }
        />
        <div
          style={{
            flex: 1,
          }}
        >
          <Typography.Title
            level={5}
            className="tt-expenses-primary"
            style={{ fontSize: 14, marginBottom: 0 }}
          >
            {record.name}
          </Typography.Title>
          <StyledText>{record.code}</StyledText>
        </div>
      </StyledFlex>
    ),
  },
  {
    title: <IntlMessages id="common.users" />,
    dataIndex: "users",
    key: "users",
    render: (id, record) => (
      <div className="tt-users-groups">
        {!!record.users.length ? (
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
            {record.users.map((data, index) => (
              <>
                <Tooltip
                  placement="topLeft"
                  title={data.displayName}
                  className="tt-expenses-cursor-pointer"
                >
                  {data.photoURL ? (
                    <Avatar
                      size={40}
                      key={"user-" + index}
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
        ) : (
          "-"
        )}
      </div>
    ),
  },
  {
    title: <IntlMessages id="common.createdBy" />,
    dataIndex: "createdBy",
    key: "createdBy",
    render: (id, record) => (
      <StyledFlex>
        {record.createdBy ? (
          <>
            {record.createdBy?.photoURL ? (
              <Avatar
                style={{
                  marginRight: 14,
                  width: 44,
                  height: 44,
                }}
                src={record.createdBy?.photoURL.secure_url}
              />
            ) : (
              <StyledUserInfoAvatar photoRGA={record.createdBy?.photoRGA}>
                {Tt_GetUserAvatar(record.createdBy)}
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
                {record.createdBy?.displayName}
              </Typography.Title>
              <StyledText>{record.createdBy?.email}</StyledText>
            </div>
          </>
        ) : (
          "-"
        )}
      </StyledFlex>
    ),
  },
  {
    title: <IntlMessages id="common.createdAt.updatedAt" />,
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (id, record) => (
      <>
        {record.updatedAt ? (
          <span>
            {Tt_FormatDate(moment(record.updatedAt).format(FORMAT_DATE_ONE))}{" "}
            <br />
            <i>{moment(record.updatedAt).format(FORMAT_DATE_TWO)}</i>
          </span>
        ) : (
          "-"
        )}
      </>
    ),
  },
  {
    title: <IntlMessages id="common.status" />,
    dataIndex: "status",
    key: "status",
    render: (data, record) => (
      <StyledObjectStatus
        style={{
          color: getStatusColor(record?.status),
          backgroundColor: getStatusColor(record?.status) + "44",
        }}
      >
        {record?.status === StatusEnums.ACTIVE ? (
          <IntlMessages id="common.enabled" />
        ) : (
          <IntlMessages id="common.disabled" />
        )}
      </StyledObjectStatus>
    ),
  },
  {
    title: <IntlMessages id="common.actions" />,
    dataIndex: "actions",
    key: "actions",
    className: "order-table-action",
    fixed: "right",
    render: (text, record) => <OrganizationActions organization={record} />,
  },
];

type Props = {
  organizationData: OrganizationType[];
  loading: boolean;
};

const OrganizationTable = ({ organizationData, loading }: Props) => {
  // States
  const router = useRouter();

  // Functions

  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={organizationData}
      loading={loading}
      columns={getColumns(router)}
      scroll={{ x: "auto" }}
    />
  );
};

export default OrganizationTable;
