import IntlMessages from "@crema/helpers/IntlMessages";
import { PermissionType } from "@crema/types/models/dashboards/PermissionType";
import { Avatar, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  StatusEnums,
} from "utils/common-constants.utils";
import { Tt_FormatDate, Tt_GetUserAvatar } from "utils/common-functions.utils";
import {
  StyledFlex,
  StyledObjectStatus,
  StyledObjectTable,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import PermissionActions from "./PermissionActions";

type Props = {
  permissionData: PermissionType[];
  loading: boolean;
};

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

const PermissionTable = ({ permissionData, loading }: Props) => {
  // Init
  const getColumns = (): ColumnsType<PermissionType> => [
    {
      title: <IntlMessages id="common.code" />,
      dataIndex: "code",
      key: "code",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.code}</span>
      ),
    },
    {
      title: <IntlMessages id="common.description" />,
      dataIndex: "description",
      key: "description",
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
      title: <IntlMessages id="common.createdAt" />,
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
      title: <IntlMessages id="common.createdBy" />,
      dataIndex: "createdBy",
      key: "createdBy",
      render: (id, record) => (
        <StyledFlex>
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
            <StyledUserInfoAvatar photoRGA={record.createdBy.photoRGA}>
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
        </StyledFlex>
      ),
    },
    {
      title: <IntlMessages id="common.actions" />,
      dataIndex: "actions",
      key: "actions",
      className: "order-table-action",
      fixed: "right",
      render: (text, record) => <PermissionActions permission={record} />,
    },
  ];

  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={permissionData}
      loading={loading}
      columns={getColumns()}
      scroll={{ x: "auto" }}
    />
  );
};

export default PermissionTable;
