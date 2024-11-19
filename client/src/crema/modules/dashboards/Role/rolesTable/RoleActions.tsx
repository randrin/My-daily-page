import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { RoleType } from "@crema/types/models/dashboards/RoleType";
import { Button, Col, Drawer, Dropdown, Row, Space, Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";
import { usePermissionContext } from "modules/apps/context/PermissionContextProvider";
import {
  useRoleActionsContext,
  useRoleContext,
} from "modules/apps/context/RoleContextProvider";
import { useEffect, useState } from "react";
import { CiCircleMore, CiCirclePlus, CiEdit, CiTrash } from "react-icons/ci";
import { IoReturnUpBackOutline } from "react-icons/io5";
import { LuCheckCircle } from "react-icons/lu";
import { StatusEnums } from "utils/common-constants.utils";

type Props = {
  role: RoleType;
};

interface RecordType {
  key: string;
  title: string;
  description: string;
  chosen: boolean;
}

const RoleActions = ({ role }: Props) => {
  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dataSource, setDataSopurce] = useState<RecordType[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const { loading } = useRoleContext();
  const { permissions } = usePermissionContext();
  const { handleOnGetRole, handleOnDelete, handleOnAddPermissions } =
    useRoleActionsContext();

  // Init
  useEffect(() => {
    getDataSource();
  }, [isDrawerOpen]);

  const items = [
    {
      key: 1,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiEdit className="tt-expenses-secondary tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.edit" />
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiCirclePlus className="tt-expenses-primary tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.permission" />
        </span>
      ),
    },
    {
      key: 3,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiTrash className="tt-expenses-tomato tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.delete" />
        </span>
      ),
    },
  ];

  // Functions
  const getDataSource = () => {
    const tempTargetKeys = [];
    const tempMockData = [];
    permissions
      .filter((permission) => permission.status === StatusEnums.ACTIVE)
      .map((permission) => {
        const data = {
          key: permission._id,
          title: permission.code,
          description: permission.description,
          chosen: role.permissions.find((per) => per._id === permission._id),
        };
        if (data.chosen) {
          tempTargetKeys.push(data.key);
        }
        tempMockData.push(data);
      });
    setDataSopurce(tempMockData);
    setTargetKeys(tempTargetKeys);
  };

  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case "1":
        handleOnGetRole(role);
        break;
      case "2":
        setIsDrawerOpen(!isDrawerOpen);
        break;
      case "3":
        handleOnDelete(role._id);
        break;
      default:
        break;
    }
  };

  const filterOption = (inputValue: string, option: RecordType) =>
    option.title.indexOf(inputValue.toLocaleUpperCase()) > -1;

  const handleChange = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
  };

  const handleSearch = (dir: TransferDirection, value: string) => {
    console.log("search:", dir, value);
  };

  const handleOnClose = () => {
    setIsDrawerOpen(false);
  };

  const handleOnSubmit = () => {
    handleOnAddPermissions(role._id, targetKeys);
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Render
  return (
    <>
      <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]}>
        <AppIconButton icon={<CiCircleMore />} />
      </Dropdown>
      <Drawer
        title={<IntlMessages id="dashboard.permissions.add" />}
        placement={"right"}
        width={720}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(!isDrawerOpen)}
        footer={
          <Space>
            <Button
              key="back"
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="tt-expenses-space-center"
            >
              <IoReturnUpBackOutline className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.back" />
            </Button>
            ,
            <Button
              key="submit"
              type="primary"
              className="tt-expenses-space-center"
              loading={loading}
              onClick={handleOnSubmit}
              //disabled={!targetKeys.length}
            >
              <LuCheckCircle className="tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.update" />
            </Button>
          </Space>
        }
      >
        <Row>
          <Col xs={24} lg={24}>
            <Transfer
              dataSource={dataSource}
              showSearch
              filterOption={filterOption}
              targetKeys={targetKeys}
              onChange={handleChange}
              onSearch={handleSearch}
              render={(item) => item.title}
            />
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
export default RoleActions;
