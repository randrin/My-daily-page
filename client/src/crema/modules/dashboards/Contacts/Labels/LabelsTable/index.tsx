import IntlMessages from "@crema/helpers/IntlMessages";
import { LabelType } from "@crema/types/models/dashboards/ContactType";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import { MdLabelOutline } from "react-icons/md";
import { FORMAT_DATE_ONE, FORMAT_DATE_TWO } from "utils/common-constants.utils";
import {
    Tt_FormatDate,
    Tt_GetUser
} from "utils/common-functions.utils";
import {
    StyledObjectTable
} from "../../../index.styled";
import LabelActions from "./LabelActions";

type Props = {
  labelData: LabelType[];
  loading: boolean;
};

const LabelTable = ({ labelData, loading }: Props) => {
  // Init
  const getColumns = (): ColumnsType<LabelType> => [
    {
      title: <IntlMessages id="common.name" />,
      dataIndex: "name",
      key: "name",
      render: (id, record) => (
        <span className="tt-expenses-primary">{record.name}</span>
      ),
    },
    {
      title: <IntlMessages id="common.color" />,
      dataIndex: "color",
      key: "color",
      render: (id, record) => (
        <span>{<MdLabelOutline style={{ color: `${record.color}` }} />}</span>
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
      render: (id, record) => Tt_GetUser(record.createdBy),
    },
    {
      title: <IntlMessages id="common.actions" />,
      dataIndex: "actions",
      key: "actions",
      className: "order-table-action",
      fixed: "right",
      render: (text, record) => <LabelActions label={record} />,
    },
  ];

  // Render
  return (
    <StyledObjectTable
      hoverColor
      data={labelData}
      loading={loading}
      columns={getColumns()}
      scroll={{ x: "auto" }}
    />
  );
};

export default LabelTable;
