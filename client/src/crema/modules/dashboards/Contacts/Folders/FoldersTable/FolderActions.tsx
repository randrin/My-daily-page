import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { FolderType } from "@crema/types/models/dashboards/ContactType";
import { Dropdown } from "antd";
import { useContactsActionsContext } from "modules/apps/context/ContactsContextProvider";
import { CiCircleMore, CiEdit, CiTrash } from "react-icons/ci";

type Props = {
  folder: FolderType;
};

const FolderActions = ({ folder }: Props) => {
  // States
  const { handleOnGetFolder, handleOnDeleteFolder } =
    useContactsActionsContext();

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
        handleOnGetFolder(folder);
        break;
      case "2":
        handleOnDeleteFolder(folder._id);
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
export default FolderActions;
