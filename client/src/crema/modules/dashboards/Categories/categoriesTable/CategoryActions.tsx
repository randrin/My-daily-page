import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Dropdown } from "antd";
import { useCategoryActionsContext } from "modules/apps/context/CategoryContextProvider";
import { StatusEnums } from "utils/common-constants.utils";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";
import { LuPower, LuPowerOff } from "react-icons/lu";
import { CategoryType } from "@crema/types/models/dashboards/CategoryType";

type Props = {
  category: CategoryType;
};

const CategoryActions = ({ category }: Props) => {
  // States
  const { handleOnGetCategory, handleOnEnabledOrDisabled, handleOnDelete } =
    useCategoryActionsContext();

  // Destructing

  // Init
  const items = [
    {
      key: 1,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          {category.status === StatusEnums.ACTIVE ? (
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
      key: 2,
      label: (
        <span style={{ fontSize: 14 }} className="tt-expenses-space-start">
          <CiEdit className="tt-expenses-secondary tt-expenses-margin-btn-icon" />
          <IntlMessages id="common.edit" />
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
        handleOnEnabledOrDisabled(category._id);
        break;
      case "2":
        handleOnGetCategory(category);
        break;
      case "3":
        handleOnDelete(category._id);
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
export default CategoryActions;
