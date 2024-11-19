import AppIconButton from "@crema/components/AppIconButton";
import IntlMessages from "@crema/helpers/IntlMessages";
import { ContactType } from "@crema/types/models/dashboards/ContactType";
import { Dropdown } from "antd";
import {
  useContactsActionsContext,
  useContactsContext,
} from "modules/apps/context/ContactsContextProvider";
import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdLabelOutline } from "react-icons/md";
import { StyledContactCheckedAction } from "../index.styled";

type ContactCheckedActionsProps = {
  checkedContacts: string[];
  setCheckedContacts: (checkedContacts: string[]) => void;
  onSelectContactsForDelete: (checkedContacts: string[]) => void;
};

const ContactCheckedActions: React.FC<ContactCheckedActionsProps> = ({
  checkedContacts,
  setCheckedContacts,
  onSelectContactsForDelete,
}) => {
  // States
  const { labelList } = useContactsContext();
  const { handleOnUpdateLabelContacts } = useContactsActionsContext();
  const [isLabelOpen, onOpenLabel] = useState(false);

  // Functions
  const onLabelOpen = () => {
    onOpenLabel(true);
  };

  const onLabelClose = () => {
    onOpenLabel(false);
  };

  const onSelectLabel = (labelId: string) => {

    handleOnUpdateLabelContacts(checkedContacts, labelId);
    setCheckedContacts([]);
    onLabelClose();
  };

  const handleOnGetLabels = () => {
    let items = [];
    labelList.map((label, index) => {
      items.push({
        key: index,
        label: (
          <span key={index} onClick={() => onSelectLabel(label._id)}>
            {label.name}
          </span>
        ),
      });
    });
    return items;
  };

  // Render
  return (
    <StyledContactCheckedAction>
      <AppIconButton
        icon={<AiOutlineDelete />}
        title={<IntlMessages id="common.delete" />}
        onClick={() => onSelectContactsForDelete(checkedContacts)}
      />

      <Dropdown
        onOpenChange={onLabelOpen}
        open={isLabelOpen}
        menu={{ items: handleOnGetLabels() }}
        trigger={["click"]}
      >
        <AppIconButton
          icon={<MdLabelOutline />}
          title={<IntlMessages id="common.label" />}
        />
      </Dropdown>
    </StyledContactCheckedAction>
  );
};

export default ContactCheckedActions;
