import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { PermissionType } from "@crema/types/models/dashboards/PermissionType";
import { Dropdown } from "antd";
import { usePermissionActionsContext } from "modules/apps/context/PermissionContextProvider";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";
import { LuPower, LuPowerOff } from "react-icons/lu";
import { StatusEnums } from "utils/common-constants.utils";

type Props = {
  permission: PermissionType;
};

const PermissionActions = ({ permission }: Props) => {
  // States
  const { handleOnGetPermission, handleOnDelete, handleOnEnabledOrDisabled } =
    usePermissionActionsContext();

  // Init
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
          {permission.status === StatusEnums.ACTIVE ? (
            <>
              <LuPowerOff className="tt-expenses-tomato tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.disable" />
            </>
          ) : (
            <>
              <LuPower className="tt-expenses-success tt-expenses-margin-btn-icon" />{" "}
              <IntlMessages id="common.enable" />
            </>
          )}
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
  const onMenuClick = ({ item, key }: { item: any; key: string }) => {
    switch (key) {
      case "1":
        handleOnGetPermission(permission);
        break;
      case "2":
        handleOnEnabledOrDisabled(permission._id);
        break;
      case "3":
        handleOnDelete(permission._id);
        break;
      default:
        break;
    }
  };

  // Render
  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} trigger={["click"]}>
      <AppIconButton icon={<CiCircleMore />} />
    </Dropdown>
  );
};
export default PermissionActions;
