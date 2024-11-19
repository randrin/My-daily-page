import IntlMessages from "@crema/helpers/IntlMessages";
import { SubCategoryType } from "@crema/types/models/dashboards/SubCategoryType";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { useRouter } from "next/router";
import {
  FORMAT_DATE_ONE,
  FORMAT_DATE_TWO,
  StatusEnums,
} from "utils/common-constants.utils";
import {
  Tt_FormatDate,
  Tt_GetUser
} from "utils/common-functions.utils";
import {
  StyledObjectStatus,
  StyledObjectTable
} from "../../index.styled";
import SubCategoryActions from "./SubCategoryActions";

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

const getColumns = (): ColumnsType<SubCategoryType> => [
  {
    title: <IntlMessages id="common.title" />,
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
    title: <IntlMessages id="common.category" />,
    dataIndex: "category",
    key: "category",
    render: (id, record) => <span>{record.category.title}</span>,
  },
  {
    title: <IntlMessages id="common.createdAt" />,
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (id, record) => (
      <span>
        {Tt_FormatDate(moment(record.updatedAt).format(FORMAT_DATE_ONE))} <br />
        <i>{moment(record.updatedAt).format(FORMAT_DATE_TWO)}</i>
      </span>
    ),
  },
  {
    title: <IntlMessages id="common.createdBy" />,
    dataIndex: "createdBy",
    key: "createdBy",
    render: (id, record) => (
      Tt_GetUser(record.createdBy)
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
    render: (text, record) => <SubCategoryActions subCategory={record} />,
  },
];

type Props = {
  subCategoryData: SubCategoryType[];
  loading: boolean;
};

const SubCategoryTable = ({ subCategoryData, loading }: Props) => {
  const router = useRouter();

  return (
    <StyledObjectTable
      hoverColor
      data={subCategoryData}
      loading={loading}
      columns={getColumns()}
      scroll={{ x: "auto" }}
    />
  );
};

export default SubCategoryTable;
