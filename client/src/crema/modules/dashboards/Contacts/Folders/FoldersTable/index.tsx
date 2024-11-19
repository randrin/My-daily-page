import IntlMessages from "@crema/helpers/IntlMessages";
import { FolderType } from "@crema/types/models/dashboards/ContactType";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { FORMAT_DATE_ONE, FORMAT_DATE_TWO } from "utils/common-constants.utils";
import {
    IconByName,
    Tt_FormatDate,
    Tt_GetUser
} from "utils/common-functions.utils";
import {
    StyledObjectTable
} from "../../../index.styled";
import FolderActions from "./FolderActions";

type Props = {
  folderData: FolderType[];
  loading: boolean;
};

const FolderTable = ({ folderData, loading }: Props) => {
  // Init
  const getColumns = (): ColumnsType<FolderType> => [
    {
      title: <IntlMessages id="common.name" />,
      dataIndex: "name",
      key: "name",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.name}</span>
      ),
    },
    {
      title: <IntlMessages id="common.icon" />,
      dataIndex: "icon",
      key: "icon",
      render: (id, record) => <span>{IconByName[record.icon]}</span>,
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
      render: (id, record) => Tt_GetUser(record.createdBy),
    },
    {
      title: <IntlMessages id="common.actions" />,
      dataIndex: "actions",
      key: "actions",
      className: "order-table-action",
      fixed: "right",
      render: (text, record) => <FolderActions folder={record} />,
    },
  ];

  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={folderData}
      loading={loading}
      columns={getColumns()}
      scroll={{ x: "auto" }}
    />
  );
};

export default FolderTable;
