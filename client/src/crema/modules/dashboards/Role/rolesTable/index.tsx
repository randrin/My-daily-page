import { RoleType } from "@crema/types/models/dashboards/RoleType";
import {
  StyledFlex,
  StyledObjectTable,
  StyledText,
  StyledUserInfoAvatar,
} from "../../index.styled";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ColumnsType } from "antd/es/table";
import { Tt_FormatDate, Tt_GetUserAvatar } from "utils/common-functions.utils";
import moment from "moment";
import { FORMAT_DATE_ONE, FORMAT_DATE_TWO } from "utils/common-constants.utils";
import { Avatar, Typography } from "antd";
import RoleActions from "./RoleActions";

type Props = {
  roleData: RoleType[];
  loading: boolean;
};

const RoleTable = ({ roleData, loading }: Props) => {
  // Init
  const getColumns = (): ColumnsType<RoleType> => [
    {
      title: <IntlMessages id="common.role" />,
      dataIndex: "title",
      key: "title",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.title}</span>
      ),
    },
    {
      title: <IntlMessages id="common.description" />,
      dataIndex: "description",
      key: "description",
    },
    {
      title: <IntlMessages id="sidebar.app.dashboard.permissions" />,
      dataIndex: "permissions",
      key: "permissions",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.permissions?.length || 0}</span>
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
      render: (text, record) => <RoleActions role={record} />,
    },
  ];
  
  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={roleData}
      loading={loading}
      columns={getColumns()}
      scroll={{ x: "auto" }}
    />
  );
};

export default RoleTable;
